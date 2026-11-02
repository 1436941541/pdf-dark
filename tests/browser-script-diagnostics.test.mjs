import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const ORIGIN = 'https://pdfdark.org';
const CODE_PATH = '/_next/static/chunks/app-abcd.js';
const CODE_URL = ORIGIN + CODE_PATH;
const compileCode = ts.transpileModule(fs.readFileSync(new URL('../lib/browser-script-diagnostics.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness(overrides = {}, modules = {}) {
  const listeners = new Map();
  const exports = {};
  let timingReads = 0, memoryReads = 0;
  const resources = [];
  const globals = {
    document: { readyState: 'complete', visibilityState: 'visible', hasFocus: () => true },
    navigator: { onLine: true },
    performance: { getEntriesByType(type) { assert.equal(type, 'resource'); timingReads++; return resources; } },
    Date: { now: () => 1800000000000 },
    fetch: () => assert.fail('Do not probe script URLs'),
    ...overrides,
  };
  const dependencies = {
    './pdf-image-resource-diagnostics': { readImageMemorySnapshot() {
      memoryReads++;
      return { memory_api: 'performance.memory', js_heap_used_bytes: 123, js_heap_total_bytes: 456, js_heap_limit_bytes: 789 };
    } },
    './background-worker-diagnostics': { getBackgroundWorkerFailure: () => undefined, getRecentBackgroundWorkerFailures: () => [] },
    ...modules,
  };
  new Function('require', 'exports', ...Object.keys(globals), compileCode)(name => {
    assert(name in dependencies, `Unexpected dependency ${name}`); return dependencies[name];
  }, exports, ...Object.values(globals));
  const diagnostics = exports.createBrowserScriptDiagnostics();
  const win = {
    location: { origin: ORIGIN },
    addEventListener(type, handler, options) {
      const handlers = listeners.get(type) ?? [];
      handlers.push({ handler, options }); listeners.set(type, handlers);
    },
  };
  diagnostics.observeWindow(win);
  return { diagnostics, win, listeners, resources, get timingReads() { return timingReads; }, get memoryReads() { return memoryReads; },
    fire(type, event) { for (const { handler } of listeners.get(type) ?? []) assert.equal(handler(event), undefined); } };
}

function sentryEvent(type = 'SyntaxError', value = 'PRIVATE DOCUMENT CONTENT') {
  return { type: undefined, tags: { existing: 'kept' }, fingerprint: ['existing'],
    contexts: { existing: { kept: true } }, exception: { values: [{ type, value }] } };
}
function nativeError(error, filename = CODE_URL) {
  return { type: 'error', target: {}, error, filename, lineno: 33, colno: 17, timeStamp: 71.5, isTrusted: true,
    get preventDefault() { assert.fail('Must not prevent the event'); },
    get stopPropagation() { assert.fail('Must not stop the event'); } };
}
function context(h, event, originalException) {
  assert.equal(h.diagnostics.enrich(event, { originalException }), event);
  return event.contexts.browser_script;
}

test('native SyntaxError matches both ErrorEvent and its error without changing exception or fingerprint', () => {
  const h = harness();
  const error = new SyntaxError('PRIVATE.pdf SECRET');
  const native = nativeError(error, 'https://user:SECRET@pdfdark.org' + CODE_PATH + '?token=SECRET#PRIVATE');
  h.fire('error', native);
  assert.equal(h.timingReads, 0);
  assert.equal(h.memoryReads, 0);
  h.resources.push({ name: CODE_URL + '?token=PRIVATE', entryType: 'resource', startTime: 10.1, duration: 22.5,
    transferSize: 0, encodedBodySize: 0, decodedBodySize: 0, responseStatus: 0 });
  h.fire('pagehide', { persisted: true });
  h.fire('pageshow', { persisted: true });
  for (const original of [native, error]) {
    const event = sentryEvent();
    const exception = event.exception, fingerprint = event.fingerprint;
    const captured = context(h, event, original);
    assert.equal(event.exception, exception);
    assert.equal(event.fingerprint, fingerprint);
    assert.equal(event.exception.values[0].stacktrace, undefined);
    assert.equal(event.tags.existing, 'kept');
    assert.deepEqual(event.contexts.existing, { kept: true });
    assert.equal(captured.relationship, 'exact_native');
    assert.equal(captured.error_kind, 'syntax');
    assert.equal(captured.native_observation.filename, CODE_URL);
    assert.equal(captured.native_observation.script_path, CODE_PATH);
    assert.equal(captured.native_observation.relationship, 'exact');
    assert.equal(captured.native_observation.lineno, 33);
    assert.equal(captured.native_observation.colno, 17);
    assert.equal(captured.native_observation.observed_at_ms, 1800000000000);
    assert.equal(captured.native_observation.event_timestamp_ms, 71.5);
    assert.equal(captured.last_pagehide_persisted, true);
    assert.equal(captured.last_pageshow_persisted, true);
    assert.equal(captured.document_focused, true);
    assert.equal(captured.js_heap_used_bytes, 123);
    assert.equal(captured.resource_timings[0].timing_status, 'matched');
    assert.equal(captured.resource_timings[0].transfer_bytes, 0);
    assert.equal(captured.resource_timings[0].encoded_body_bytes, 0);
    assert.equal(captured.resource_timings[0].response_status, 0);
    assert.equal(captured.resource_timings[0].network_failed, undefined);
    assert.equal(captured.resource_timings[0].cache_hit, undefined);
    assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|token=|user:/));
  }
  assert.equal(h.timingReads, 2);
});

test('script resource errors are captured on the capture phase and do not swallow or recapture the event', () => {
  const h = harness();
  h.diagnostics.observeWindow(h.win);
  assert.equal(h.listeners.get('error').length, 1);
  assert.equal(h.listeners.get('error')[0].options, true);
  assert.equal(h.listeners.get('pagehide').length, 1);
  const native = { type: 'error', target: { tagName: 'SCRIPT', src: CODE_URL + '?PRIVATE' }, defaultPrevented: false,
    preventDefault() { assert.fail('Must not prevent the event'); } };
  h.fire('error', native);
  assert.equal(native.defaultPrevented, false);
  const captured = context(h, sentryEvent('Event', 'PRIVATE'), native);
  assert.equal(captured.error_kind, 'script_load');
  assert.equal(captured.native_observation.observation_kind, 'script_resource_error');
  assert.equal(captured.native_observation.source_kind, 'site_static');
  assert.equal(captured.resource_timings[0].timing_status, 'not_found');
  h.fire('error', { type: 'error', target: { tagName: 'IMG', src: 'PRIVATE.pdf' } });
  assert.equal(context(h, sentryEvent(), undefined).recent_observations.length, 1);
});

test('an unrelated hint never becomes an exact match based on a recent error or matching filename', () => {
  const h = harness();
  h.fire('error', nativeError(new SyntaxError('PRIVATE')));
  const unrelated = new SyntaxError('PRIVATE');
  const event = sentryEvent();
  const captured = context(h, event, unrelated);
  assert.equal(captured.relationship, 'recent');
  assert.equal(captured.native_observation, undefined);
  assert.equal(captured.recent_observations[0].relationship, 'recent');
  assert(captured.note.includes('do not establish causation'));
  assert.equal(event.exception.values[0].stacktrace, undefined);
  const nonScript = sentryEvent('RangeError', 'PRIVATE');
  assert.equal(context(h, nonScript, new RangeError('PRIVATE')), undefined);
  assert.equal(nonScript.tags.browser_script_diagnostics, undefined);
});

test('a native SyntaxError without an error object keeps its actual ErrorEvent location', () => {
  const h = harness();
  const native = nativeError(null);
  native.message = 'Uncaught SyntaxError: PRIVATE.pdf SECRET';
  h.fire('error', native);
  const captured = context(h, sentryEvent('Error'), native);
  assert.equal(captured.error_kind, 'syntax');
  assert.equal(captured.relationship, 'exact_native');
  assert.equal(captured.native_observation.error_kind, 'syntax');
  assert.equal(captured.native_observation.filename, CODE_URL);
  assert(!JSON.stringify(captured).match(/PRIVATE|SECRET/));
});

test('observations are bounded to six safe scalar copies with no retained messages or event references', () => {
  const h = harness();
  for (let index = 0; index < 10; index++) h.fire('error', nativeError(new SyntaxError('PRIVATE'), CODE_URL + '?SECRET=' + index));
  const captured = context(h, sentryEvent(), undefined);
  assert.equal(captured.recent_observations.length, 6);
  assert(captured.recent_observations.every(observation => Object.values(observation).every(value => ['string', 'boolean', 'number'].includes(typeof value))));
  assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|message|stacktrace/));
});

test('private local URLs and other domains record source kind without retaining a URL', () => {
  const h = harness();
  for (const [filename, kind] of [
    ['blob:https://pdfdark.org/SECRET', 'blob'], ['data:text/javascript,PRIVATE', 'data'],
    ['file:///Users/PRIVATE/SECRET.js', 'file'], ['chrome-extension://PRIVATE/SECRET.js', 'extension'],
    ['moz-extension://PRIVATE/SECRET.js', 'extension'], ['safari-web-extension://PRIVATE/SECRET.js', 'extension'],
    ['https://private.example/_next/static/chunks/SECRET.js', 'external'],
    [ORIGIN + '/PRIVATE.pdf?SECRET', 'same_origin_other'],
    ['app:///PRIVATE.pdf', 'other'],
  ]) {
    const error = new SyntaxError('PRIVATE');
    h.fire('error', nativeError(error, filename));
    const captured = context(h, sentryEvent(), error);
    assert.equal(captured.native_observation.source_kind, kind);
    assert.equal(captured.native_observation.filename, undefined);
    assert.equal(captured.native_observation.script_path, undefined);
    assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|private\.example|data:|blob:|file:|extension:/));
  }
});

test('reported app and site static frames are safe evidence and never added as exception frames', () => {
  const h = harness();
  const event = sentryEvent();
  const frames = [
    { filename: 'app:///_next/static/chunks/app-abcd.mjs?token=SECRET#PRIVATE', lineno: 12, colno: 2 },
    { filename: CODE_URL + '?SECRET', lineno: 13, colno: 3 },
    { filename: 'blob:https://pdfdark.org/SECRET', lineno: 1 },
    { filename: 'https://external.invalid/_next/static/PRIVATE.js', lineno: 1 },
  ];
  event.exception.values[0].stacktrace = { frames };
  const captured = context(h, event, undefined);
  assert.equal(event.exception.values[0].stacktrace.frames, frames);
  assert.equal(captured.reported_frames[0].filename, 'app:///_next/static/chunks/app-abcd.mjs');
  assert.equal(captured.reported_frames[0].relationship, 'reported_frame');
  assert.equal(captured.reported_frames[0].lineno, 12);
  assert.equal(captured.reported_frames[1].filename, CODE_URL);
  assert.equal(captured.reported_frames[2].source_kind, 'blob');
  assert.equal(captured.reported_frames[2].filename, undefined);
  assert.equal(captured.reported_frames[3].filename, undefined);
  assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|external\.invalid|blob:/));
});

test('the actual 1V Turbopack tilde path survives native observations, reported app frames and passive same-origin timing', () => {
  const h = harness();
  const scriptPath = '/_next/static/chunks/0~j61aswh9.9d.js';
  const appFilename = 'app://' + scriptPath;
  const error = new SyntaxError('PRIVATE');
  h.fire('error', nativeError(error, appFilename + '?SECRET#PRIVATE'));
  h.resources.push({ entryType: 'resource', name: ORIGIN + scriptPath + '?SECRET', duration: 13, transferSize: 87, encodedBodySize: 67, responseStatus: 200 });
  const event = sentryEvent();
  const frames = [{ filename: appFilename + '?SECRET', lineno: 1, colno: 12345 }];
  event.exception.values[0].stacktrace = { frames };
  const captured = context(h, event, error);
  assert.equal(captured.native_observation.filename, appFilename);
  assert.equal(captured.native_observation.source_kind, 'app_static');
  assert.equal(captured.native_observation.script_path, scriptPath);
  assert.equal(captured.reported_frames[0].filename, appFilename);
  assert.equal(captured.reported_frames[0].script_path, scriptPath);
  assert.equal(event.exception.values[0].stacktrace.frames, frames);
  assert.deepEqual(captured.resource_timings, [{
    script_path: scriptPath, timing_status: 'matched', match_basis: 'sanitized_script_path',
    duration_ms: 13, transfer_bytes: 87, encoded_body_bytes: 67, response_status: 200,
  }]);
  assert.equal(h.timingReads, 1);
  assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|\?|#/));
});

test('the production /es loader basename with consecutive dots preserves its code location and passive timing', () => {
  const h = harness();
  const scriptPath = '/_next/static/chunks/08fvv0ab..168.js';
  const filename = ORIGIN + scriptPath;
  const error = new SyntaxError('PRIVATE');
  h.fire('error', nativeError(error, filename + '?SECRET#PRIVATE'));
  h.resources.push({ entryType: 'resource', name: filename + '?PRIVATE', duration: 7.5, transferSize: 0, encodedBodySize: 91 });
  const event = sentryEvent();
  event.exception.values[0].stacktrace = { frames: [{ filename: 'app://' + scriptPath, lineno: 1, colno: 250 }] };
  const captured = context(h, event, error);
  assert.equal(captured.native_observation.filename, filename);
  assert.equal(captured.native_observation.script_path, scriptPath);
  assert.equal(captured.reported_frames[0].filename, 'app://' + scriptPath);
  assert.deepEqual(captured.resource_timings, [{
    script_path: scriptPath, timing_status: 'matched', match_basis: 'sanitized_script_path',
    duration_ms: 7.5, transfer_bytes: 0, encoded_body_bytes: 91,
  }]);
  assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|\?|#/));
});

test('timing buffers are passive, bounded to the latest 128 entries, and absence remains inconclusive', () => {
  const resources = [];
  resources.push({ entryType: 'resource', name: CODE_URL, duration: 9, transferSize: 7 });
  for (let index = 0; index < 128; index++) resources.push({ entryType: 'resource', name: 'https://external.invalid/PRIVATE.js' });
  let scanned = 0;
  const entries = new Proxy(resources, { get(target, key) {
    if (/^\d+$/.test(String(key))) { scanned++; assert.notEqual(key, '0', 'Old entries are outside the scan bound'); }
    return target[key];
  } });
  const h = harness({ performance: { getEntriesByType: () => entries } });
  const error = new SyntaxError('PRIVATE');
  h.fire('error', nativeError(error));
  const captured = context(h, sentryEvent(), error);
  assert.equal(scanned, 128);
  assert.deepEqual(captured.resource_timings, [{ script_path: CODE_PATH, timing_status: 'not_found' }]);
  assert(captured.note.includes('zero sizes are inconclusive'));
});

test('unsupported or throwing timing APIs preserve the event and identify timing as unavailable', () => {
  for (const performance of [{}, { getEntriesByType() { throw new Error('PRIVATE'); } }, { getEntriesByType: () => null }]) {
    const h = harness({ performance });
    const error = new SyntaxError('PRIVATE');
    h.fire('error', nativeError(error));
    assert.deepEqual(context(h, sentryEvent(), error).resource_timings, [{ script_path: CODE_PATH, timing_status: 'unavailable' }]);
  }
});

test('bad timing getters and values are optional and do not leak arbitrary properties', () => {
  const h = harness();
  const error = new SyntaxError('PRIVATE');
  h.fire('error', nativeError(error));
  h.resources.push({ entryType: 'resource', name: CODE_URL + '?SECRET', duration: -1, transferSize: Infinity, encodedBodySize: NaN,
    get decodedBodySize() { throw new Error('PRIVATE'); }, responseStatus: 999, cookie: 'SECRET' });
  const captured = context(h, sentryEvent(), error);
  assert.deepEqual(captured.resource_timings[0], { script_path: CODE_PATH, timing_status: 'matched', match_basis: 'sanitized_script_path' });
  assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|cookie/));
});

for (const [message, expected] of [
  ['Failed to fetch dynamically imported module: https://private/SECRET.js', 'module_load'],
  ['Importing a module script failed.', 'module_load'],
  ["Failed to execute 'importScripts' on 'WorkerGlobalScope': PRIVATE", 'import_scripts'],
  ['Failed to load script PRIVATE', 'script_load'],
]) {
  test(`fixed classification ${expected} does not retain browser messages`, () => {
    const h = harness();
    const captured = context(h, sentryEvent('TypeError', message), new TypeError(message));
    assert.equal(captured.error_kind, expected);
    assert.equal(captured.relationship, 'recent');
    assert(!JSON.stringify(captured).match(/PRIVATE|SECRET|private\//));
  });
}

test('exact worker metadata and recent worker observations have explicit different relationships', () => {
  const original = new Error('PRIVATE');
  const failure = { version: 1, worker_id: 9, error_type: 'SyntaxError', error_hint: 'script_load', failure_kind: 'error_event',
    script_path: CODE_PATH + '?SECRET', pending_count: 2, request_at_ms: 1800000000000, disposed: true,
    cancelled_before_error: true, filename: 'PRIVATE.pdf', message: 'SECRET' };
  const h = harness({}, { './background-worker-diagnostics': {
    getBackgroundWorkerFailure: error => error === original ? failure : undefined,
    getRecentBackgroundWorkerFailures: () => Array.from({ length: 7 }, (_, index) => ({ ...failure, worker_id: index })),
  } });
  const exact = context(h, sentryEvent('Error'), original);
  assert.equal(exact.relationship, 'exact_worker');
  assert.equal(exact.background_worker.relationship, 'exact');
  assert.equal(exact.background_worker.script_path, CODE_PATH);
  assert.equal(exact.background_worker.cancelled_before_error, true);
  assert.equal(exact.background_worker.disposed, true);
  assert.equal(exact.background_worker.request_at_ms, 1800000000000);
  assert.equal(exact.recent_background_workers, undefined);
  const recent = context(h, sentryEvent(), new SyntaxError('PRIVATE'));
  assert.equal(recent.relationship, 'recent');
  assert.equal(recent.background_worker, undefined);
  assert.equal(recent.recent_background_workers.length, 4);
  assert(recent.recent_background_workers.every(worker => worker.relationship === 'recent'));
  assert(recent.recent_background_workers.every(worker => worker.disposed === true && worker.request_at_ms === 1800000000000));
  assert(!JSON.stringify([exact, recent]).match(/PRIVATE|SECRET|message|filename/));
});

test('unavailable or hostile diagnostic getters never throw, leak values or change event identity', () => {
  const unavailable = () => { throw new Error('PRIVATE getter'); };
  const h = harness({
    document: { get readyState() { return unavailable(); }, get visibilityState() { return unavailable(); }, hasFocus: unavailable },
    navigator: { get onLine() { return unavailable(); } },
    Date: { now: unavailable },
  }, { './pdf-image-resource-diagnostics': { readImageMemorySnapshot: () => ({ memory_api: 'SECRET', js_heap_used_bytes: 'PRIVATE', raw: 'SECRET' }) } });
  const native = nativeError(undefined);
  Object.defineProperties(native, {
    error: { get: unavailable }, message: { get: unavailable }, lineno: { get: unavailable },
    target: { get: unavailable },
  });
  assert.doesNotThrow(() => h.fire('error', native));
  const event = sentryEvent();
  const captured = context(h, event, native);
  assert.equal(captured.native_observation.filename, CODE_URL);
  assert.equal(captured.native_observation.lineno, undefined);
  assert.equal(captured.memory_api, undefined);
  assert.equal(captured.js_heap_used_bytes, undefined);
  assert(!JSON.stringify(captured).match(/PRIVATE|SECRET/));
  const frozen = Object.freeze(sentryEvent());
  assert.equal(h.diagnostics.enrich(frozen, { originalException: new SyntaxError('PRIVATE') }), frozen);
  const hostile = new Proxy({}, { get: unavailable });
  assert.equal(h.diagnostics.enrich(hostile, hostile), hostile);
  assert.doesNotThrow(() => h.diagnostics.observeWindow({ addEventListener: unavailable }));
});

test('non-script events and success-like input do not query timings or memory', () => {
  const h = harness();
  const event = sentryEvent('TypeError', 'PRIVATE');
  assert.equal(h.diagnostics.enrich(event, {}), event);
  assert.equal(event.contexts.browser_script, undefined);
  assert.equal(h.timingReads, 0);
  assert.equal(h.memoryReads, 0);
});
