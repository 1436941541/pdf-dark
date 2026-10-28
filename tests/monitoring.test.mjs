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
const workerDiagnostics = compile('../lib/dark-worker-diagnostics.ts', {});
const sentry = [];
const diagnostics = compile('../lib/pdf-image-diagnostics.ts', { './dark-worker-diagnostics': workerDiagnostics, '@sentry/nextjs': { captureException: (...args) => sentry.push(args) } });
const classifier = compile('../lib/pdf-load-error.ts', { './i18n': { T: {} } });
const { beginPdfOperation, recordPdfFailure } = compile('../lib/pdf-monitoring.ts', {
  './analytics-events': analytics, './pdf-load-error': classifier, './pdf-image-diagnostics': diagnostics,
});
function setup(track) {
  globalThis.window = { location: { pathname: '/whiten-pdf?private=secret' }, umami: { track } };
  analytics.flushAnalyticsEvents();
  sentry.length = 0;
}

test('events survive a late analytics script with a bounded queue', () => {
  setup(() => {});
  delete window.umami;
  for (let i = 0; i < 70; i++) analytics.trackPdfEvent('pdf_start', { tool: 'whiten', stage: 'prepare', pages: i });
  const events = [];
  window.umami = { track: (name, data) => events.push({ name, data }) };
  analytics.flushAnalyticsEvents();
  assert.equal(events.length, 50);
  assert.equal(events[0].data.pages, 20);
  analytics.flushAnalyticsEvents();
  assert.equal(events.length, 50);
});

test('PDF metadata allowlist excludes raw properties, query strings and invalid numbers', () => {
  const events = [];
  setup((name, data) => events.push({ name, data }));
  analytics.trackPdfEvent('pdf_error', { tool: 'whiten', stage: 'preview', filename: 'private.pdf', message: 'SECRET PDF TEXT', url: 'data:secret', duration_ms: NaN, pages: 2.4 });
  assert.deepEqual(events[0].data, { tool: 'whiten', stage: 'preview', page: '/whiten-pdf', pages: 2 });
  assert.equal(analytics.telemetryPage('/private-secret.pdf'), '/other');
  assert.equal(analytics.telemetryPage('/es/invert-pdf-colors?secret=yes'), '/es/invert-pdf-colors');
});

test('sync and async analytics failures never affect a successful operation', async () => {
  setup(() => { throw Error('offline'); });
  assert.doesNotThrow(() => beginPdfOperation('whiten', 'export').success());
  window.umami.track = () => Promise.reject(Error('blocked'));
  assert.doesNotThrow(() => beginPdfOperation('whiten', 'export').success());
  await new Promise(resolve => setImmediate(resolve));
});

test('success and abort settle each operation once, with duration and original page', () => {
  const events = [];
  setup((name, data) => events.push({ name, data }));
  const controller = new AbortController();
  const op = beginPdfOperation('deskew', 'export', { signal: controller.signal, bytes: 4096, pages: 3 });
  window.location.pathname = '/deskew-pdf';
  op.success(); op.success(); controller.abort(); op.failure(Error('late')); op.cancel();
  assert.deepEqual(events.map(e => e.name), ['pdf_start', 'pdf_success']);
  assert.equal(events[1].data.page, '/whiten-pdf');
  assert(events[1].data.duration_ms >= 0);
  assert.equal(events[1].data.size_bucket, 'under-1mb');
  const second = new AbortController();
  const cancelled = beginPdfOperation('whiten', 'export', { signal: second.signal });
  second.abort(); cancelled.failure(Error('late failure'));
  assert.deepEqual(events.slice(-2).map(e => e.name), ['pdf_start', 'pdf_cancel']);
  assert.equal(sentry.length, 0);
});

test('invalid/password PDFs and cancellation do not become Sentry bugs', () => {
  const events = [];
  setup((name, data) => events.push({ name, data }));
  for (const name of ['InvalidPDFException', 'PasswordException']) {
    const error = Object.assign(new Error('PRIVATE'), { name });
    beginPdfOperation('monochrome', 'prepare').failure(error);
  }
  recordPdfFailure('whiten', 'preview', new DOMException('cancelled', 'AbortError'));
  assert.deepEqual(events.filter(e => e.name === 'pdf_error').map(e => e.data.reason), ['invalid', 'password']);
  assert.equal(sentry.length, 0);
});

test('unexpected failures reach Sentry with redacted message and useful app code frame', () => {
  const events = [];
  setup((name, data) => events.push({ name, data }));
  const error = new TypeError('TOP SECRET file private.pdf');
  error.stack = 'Error: TOP SECRET\n    at convert (https://pdfdark.org/_next/static/a.js:1:2)\n    at source (data:application/pdf;secret)';
  const op = beginPdfOperation('reader', 'read');
  op.failure(error, { readerStep: 'render_page', pageNumber: 2 }); op.cancel();
  assert.equal(sentry.length, 1);
  const [safe, context] = sentry[0];
  assert.equal(safe.message, 'PDF processing failed');
  assert(safe.stack.includes('/_next/static/a.js:1:2'));
  assert(!safe.stack.includes('TOP SECRET'));
  assert(!safe.stack.includes('data:'));
  assert.equal(context.tags.tool, 'reader');
  assert.equal(context.tags.stage, 'read');
  assert.equal(context.tags.original_error_type, 'TypeError');
  assert.equal(context.tags.reader_step, 'render_page');
  assert.deepEqual(context.fingerprint, ['pdf-processing', 'reader', 'read', 'render_page', 'TypeError']);
  assert.deepEqual(context.contexts.pdf_failure, { page_number: 2 });
  assert(!JSON.stringify(events).includes('private.pdf'));
});

test('untrusted error names and messages never enter Sentry metadata', () => {
  setup(() => {});
  const error = Object.assign(new Error('PRIVATE PDF CONTENT'), { name: 'private-document.pdf' });
  beginPdfOperation('reader', 'read').failure(error, { readerStep: 'parse_pdf', pageNumber: 0 });
  const [safe, context] = sentry[0];
  assert.equal(context.tags.original_error_type, 'Other');
  assert.equal(context.tags.reader_step, 'parse_pdf');
  assert.deepEqual(context.fingerprint, ['pdf-processing', 'reader', 'read', 'parse_pdf', 'Other']);
  assert.equal(context.contexts.pdf_failure, undefined);
  assert(!JSON.stringify({ safe: safe.message, context }).includes('private-document.pdf'));
  assert(!JSON.stringify({ safe: safe.message, context }).includes('PRIVATE PDF CONTENT'));
});

test('invert export failures retain a safe processing step and page number', () => {
  setup(() => {});
  const error = new DOMException('private PDF content', 'InvalidStateError');
  beginPdfOperation('invert', 'export').failure(error, { invertStep: 'build_pdf', pageNumber: 24 });
  const [safe, context] = sentry[0];
  assert.equal(safe.message, 'PDF processing failed');
  assert.equal(context.tags.original_error_type, 'InvalidStateError');
  assert.equal(context.tags.invert_step, 'build_pdf');
  assert.deepEqual(context.contexts.pdf_failure, { page_number: 24 });
  assert.deepEqual(context.fingerprint, ['pdf-processing', 'invert', 'export', 'build_pdf', 'InvalidStateError']);
  assert(!JSON.stringify(context).includes('private PDF content'));
});


test('a failing error-monitor SDK never replaces the PDF error handling', () => {
  const events = [];
  setup((name, data) => events.push({ name, data }));
  const broken = compile('../lib/pdf-image-diagnostics.ts', { './dark-worker-diagnostics': workerDiagnostics, '@sentry/nextjs': { captureException: () => { throw Error('SDK offline'); } } });
  assert.doesNotThrow(() => broken.capturePdfProcessingException(new Error('private text'), 'export'));
});

test('navigation cancellation wins over a blob read TypeError, but active failures still report', async () => {
  const events = [];
  setup((name, data) => events.push({ name, data }));
  const originalFetch = globalThis.fetch;
  const originalDocument = globalThis.document;
  const originalConsoleError = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args);
  globalThis.document = { visibilityState: 'visible', hasFocus: () => true };
  try {
    for (const navigate of [true, false]) {
      let rejectBlob;
      globalThis.fetch = async () => ({ blob: () => new Promise((resolve, reject) => { rejectBlob = reject; }) });
      const controller = new AbortController();
      const operation = beginPdfOperation('reader', 'read', { signal: controller.signal });
      const bitmap = diagnostics.loadPageBitmap('data:image/jpeg;base64,PRIVATE', {
        pageNumber: 2, width: 918, height: 1188, imageRegionCount: 0,
      }, () => controller.signal.throwIfAborted());
      // Let fetch finish and blob reading begin, then reproduce a browser
      // rejecting the read during navigation before component cleanup runs.
      await Promise.resolve();
      if (navigate) controller.abort();
      rejectBlob(new TypeError('PRIVATE image interrupted'));
      await bitmap.catch(error => {
        assert.equal(error.name, navigate ? 'AbortError' : 'TypeError');
        operation.failure(error);
      });
      if (navigate) {
        assert.equal(sentry.length, 0);
        assert.equal(logged.length, 0);
        assert.deepEqual(events.map(event => event.name), ['pdf_start', 'pdf_cancel']);
      }
    }
    assert.equal(sentry.length, 1);
    assert.equal(logged.length, 1);
    assert.equal(events.at(-1).name, 'pdf_error');
    assert.equal(sentry[0][1].tags.image_step, 'read_image_blob');
    assert(!JSON.stringify(sentry).includes('PRIVATE'));
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.document = originalDocument;
    console.error = originalConsoleError;
  }
});
