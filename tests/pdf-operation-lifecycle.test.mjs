import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as analytics from '../lib/analytics-events.ts';

function compile(file, imports) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)((name) => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports);
  return exports;
}
const pulse = [];
const { createPdfLifecycle, pdfLifecycle } = compile('../lib/pdf-operation-lifecycle.ts', {
  './analytics-events': analytics,
  './pulse-error-monitoring': { capturePulseException: (...args) => pulse.push(args) },
});
const KEY = 'pdfdark:active-operations';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: key => { data.delete(key); },
  };
}
/** A page load: its own listeners and visibility, sharing the tab's sessionStorage. */
function page(storage, pathname = '/invert-pdf-colors') {
  const listeners = {};
  return {
    sessionStorage: storage,
    location: { pathname },
    document: { visibilityState: 'visible' },
    addEventListener(type, listener) { (listeners[type] ??= []).push(listener); },
    fire(type, event = {}) { for (const listener of listeners[type] ?? []) listener(event); },
  };
}
function clock(start = 1000) {
  const state = { now: start };
  return { state, now: () => state.now };
}

test('a settled operation leaves nothing behind and reports nothing', () => {
  const storage = memoryStorage();
  const reports = [];
  const lifecycle = createPdfLifecycle(event => reports.push(event));
  lifecycle.install(page(storage));
  const op = lifecycle.begin({ tool: 'invert', stage: 'export', input: 'file', size_bucket: '1-10mb' });
  assert(storage.data.has(KEY));
  op.progress('render_page', 2, 9);
  op.end();
  op.end();
  assert(!storage.data.has(KEY));
  createPdfLifecycle(event => reports.push(event)).install(page(storage));
  assert.deepEqual(reports, []);
});

test('leaving the page reports abandon with progress, and is not reported again as interrupted', () => {
  const storage = memoryStorage();
  const time = clock();
  const reports = [];
  const host = page(storage, '/invert-pdf-colors?secret=1');
  const lifecycle = createPdfLifecycle(event => reports.push(event), time.now);
  lifecycle.install(host);
  const op = lifecycle.begin({ tool: 'reader', stage: 'read', input: 'file', size_bucket: '10-50mb' });
  time.state.now = 1500;
  op.progress('darkify_page', 7, 120);
  time.state.now = 4000;
  host.fire('pagehide', { persisted: false });
  assert.equal(reports.length, 1);
  const [report] = reports;
  assert.equal(report.kind, 'abandon');
  assert.equal(report.background, false);
  assert.equal(report.persisted, false);
  assert.equal(report.at - report.record.started_at, 3000);
  assert.equal(report.record.page, '/invert-pdf-colors');
  assert.deepEqual([report.record.step, report.record.at_page, report.record.pages], ['darkify_page', 7, 120]);
  assert(!storage.data.has(KEY));
  op.progress('commit_page', 8, 120);
  op.end();
  assert(!storage.data.has(KEY));
  createPdfLifecycle(event => reports.push(event)).install(page(storage));
  assert.equal(reports.length, 1);
});

test('a page that ended without pagehide is reported as interrupted on the next load', () => {
  const storage = memoryStorage();
  const time = clock();
  const first = page(storage, '/');
  const crashed = createPdfLifecycle(() => assert.fail('nothing settles on the crashed page'), time.now);
  crashed.install(first);
  const op = crashed.begin({ tool: 'reader', stage: 'read', input: 'file', size_bucket: '50mb-plus' });
  time.state.now = 3000;
  op.progress('render_page', 104, 300);
  time.state.now = 5000;
  first.document.visibilityState = 'hidden';
  first.fire('visibilitychange');
  // The OS ends the page here: no pagehide, no end().
  const reports = [];
  const next = createPdfLifecycle(event => reports.push(event), () => 90000);
  next.install(page(storage, '/'));
  assert.equal(reports.length, 1);
  const { kind, record } = reports[0];
  assert.equal(kind, 'interrupted');
  assert.deepEqual([record.tool, record.stage, record.step, record.at_page, record.pages], ['reader', 'read', 'render_page', 104, 300]);
  assert.equal(record.updated_at - record.started_at, 4000);
  assert.equal(record.hidden, true);
  assert.equal(record.hidden_since, 5000);
  assert(!storage.data.has(KEY));
  next.install(page(storage, '/'));
  assert.equal(reports.length, 1);
});

test('hidden time accumulates across background periods and an abandon while hidden is marked background', () => {
  const storage = memoryStorage();
  const time = clock(0);
  const host = page(storage);
  const reports = [];
  const lifecycle = createPdfLifecycle(event => reports.push(event), time.now);
  lifecycle.install(host);
  lifecycle.begin({ tool: 'invert', stage: 'export', input: 'file' });
  for (const [at, state] of [[100, 'hidden'], [400, 'visible'], [1000, 'hidden']]) {
    time.state.now = at;
    host.document.visibilityState = state;
    host.fire('visibilitychange');
  }
  time.state.now = 1600;
  host.fire('pagehide', { persisted: true });
  const [report] = reports;
  assert.equal(report.background, true);
  assert.equal(report.persisted, true);
  assert.equal(report.record.hidden_ms, 900);
});

test('stored records are validated: corrupt, tampered or foreign values are dropped without throwing', () => {
  const valid = { tool: 'invert', stage: 'export', input: 'file', started_at: 1, updated_at: 2, hidden: false, hidden_ms: 0 };
  for (const raw of ['{not json', '"text"', JSON.stringify({ tool: 'invert' }), JSON.stringify([
    { ...valid, tool: 'evil' }, { ...valid, stage: 'drop table' }, { ...valid, step: 'Has Spaces <script>' },
    { ...valid, started_at: 'x' }, null, 7,
  ])]) {
    const storage = memoryStorage({ [KEY]: raw });
    const reports = [];
    assert.doesNotThrow(() => createPdfLifecycle(event => reports.push(event)).install(page(storage)));
    assert.deepEqual(reports, [], raw);
    assert(!storage.data.has(KEY));
  }
});

test('unavailable storage and a failing reporter never affect the PDF operation', () => {
  const broken = { getItem() { throw Error('denied'); }, setItem() { throw Error('quota'); }, removeItem() { throw Error('denied'); } };
  const host = page(broken);
  const lifecycle = createPdfLifecycle(() => { throw Error('report failed'); });
  assert.doesNotThrow(() => lifecycle.install(host));
  let op;
  assert.doesNotThrow(() => { op = lifecycle.begin({ tool: 'reader', stage: 'read', input: 'file' }); });
  assert.doesNotThrow(() => op.progress('render_page', 1, 2));
  assert.doesNotThrow(() => host.fire('visibilitychange'));
  assert.doesNotThrow(() => host.fire('pagehide', {}));
  assert.doesNotThrow(() => op.end());
  const noHost = createPdfLifecycle(() => {});
  assert.doesNotThrow(() => noHost.begin({ tool: 'reader', stage: 'read', input: 'file' }).progress('get_page', 1));
});

test('invalid steps are ignored and the number of mirrored operations is bounded', () => {
  const storage = memoryStorage();
  const lifecycle = createPdfLifecycle(() => {});
  lifecycle.install(page(storage));
  const op = lifecycle.begin({ tool: 'reader', stage: 'read', input: 'file' });
  op.progress('render_page', 3, 10);
  op.progress('Bad Step', 4, 10);
  op.progress('x'.repeat(41), 5, 10);
  assert.deepEqual(JSON.parse(storage.data.get(KEY)).map(record => [record.step, record.at_page]), [['render_page', 3]]);
  for (let i = 0; i < 6; i++) lifecycle.begin({ tool: 'invert', stage: 'export', input: 'file' });
  const stored = JSON.parse(storage.data.get(KEY));
  assert.equal(stored.length, 4);
  assert(stored.every(record => record.tool === 'invert'));
});

test('the production reporter sends allowlisted analytics and a stackless Pulse issue per tool/stage/step', () => {
  const events = [];
  globalThis.window = { location: { pathname: '/' }, umami: { track: (name, data) => events.push({ name, data }) } };
  pulse.length = 0;
  const record = { tool: 'reader', stage: 'read', input: 'file', size_bucket: '10-50mb', page: '/', started_at: 1000, updated_at: 7000,
    step: 'encode_page', at_page: 12, pages: 40, hidden: true, hidden_ms: 0, hidden_since: 6500 };
  const storage = memoryStorage({ [KEY]: JSON.stringify([record]) });
  pdfLifecycle.install(page(storage, '/'));
  assert.deepEqual(events, [{ name: 'pdf_interrupted', data: {
    tool: 'reader', stage: 'read', page: '/', input: 'file', size_bucket: '10-50mb', pages: 40, duration_ms: 6000,
    step: 'encode_page', at_page: 12, hidden: 1, hidden_ms: 0, background: 1,
  } }]);
  assert.equal(pulse.length, 1);
  const [error, options] = pulse[0];
  assert.equal(error.name, 'PdfOperationInterrupted');
  assert.equal(error.stack, 'PdfOperationInterrupted: PDF operation ended without a result');
  assert.deepEqual(options.fingerprint, ['pdf-interrupted', 'reader', 'read', 'encode_page']);
  assert.deepEqual(options.tags, { tool: 'reader', stage: 'read', step: 'encode_page' });
  assert.equal(options.contexts.pdf_interrupted.at_page, 12);
});
