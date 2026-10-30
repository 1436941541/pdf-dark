import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { defaultStackParser, eventFromException } from '@sentry/browser';

function compile(file, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(name => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports);
  return exports;
}

function harness() {
  const events = [];
  const diagnostics = compile('../lib/pdf-image-diagnostics.ts', {
    './dark-worker-diagnostics': compile('../lib/dark-worker-diagnostics.ts'),
    './pdf-image-resource-diagnostics': compile('../lib/pdf-image-resource-diagnostics.ts'),
    '@sentry/nextjs': { captureException: (...args) => events.push(args) },
  });
  return { capture: diagnostics.capturePdfProcessingException, events };
}

for (const [format, stack] of [
  ['webkit', 'fetch@[native code]\nPRIVATE_NAME@https://pdfdark.org/_next/static/chunks/page-abc123.js?token=SECRET#PRIVATE:153:26\nprocess@https://pdfdark.org/_next/static/chunks/app-def456.js:297:11'],
  ['v8', 'TypeError: PRIVATE.pdf SECRET\n    at PRIVATE_NAME (https://pdfdark.org/_next/static/chunks/page-abc123.js?token=SECRET#PRIVATE:153:26)\n    at process (https://pdfdark.org/_next/static/chunks/app-def456.js:297:11)'],
]) {
  test(`${format} original code locations survive the actual Sentry event builder without document data`, async () => {
    const h = harness();
    const failure = new TypeError('Load failed');
    failure.stack = stack;
    h.capture(failure, 'read', { tool: 'reader' }, { readerStep: 'darkify_page', pageNumber: 23 });
    const [safe, scope] = h.events[0];
    const event = await eventFromException(defaultStackParser, safe);
    const frames = event.exception.values[0].stacktrace.frames;
    assert(frames.some(f => f.filename === 'https://pdfdark.org/_next/static/chunks/page-abc123.js' && f.lineno === 153 && f.colno === 26));
    assert(frames.some(f => f.filename === 'https://pdfdark.org/_next/static/chunks/app-def456.js' && f.lineno === 297));
    assert.equal(scope.tags.original_error_reason, 'load_failed');
    assert.equal(scope.tags.original_stack_status, 'captured');
    assert.equal(scope.contexts.pdf_exception.original_stack_format, format === 'webkit' ? 'at_sign' : 'v8');
    assert.equal(scope.contexts.pdf_exception.original_code_frames, 2);
    assert.equal(scope.tags.pdf_diagnostic_version, '2');
    assert(!JSON.stringify([event, scope]).match(/PRIVATE|SECRET|token=|data:|blob:/));
    assert.equal(failure.stack, stack, 'do not mutate the original error');
  });
}

test('local media, PDF paths, credentials and non-script frames are filtered out', () => {
  const h = harness();
  const error = new Error('PRIVATE PDF CONTENT');
  error.stack = [
    'Error: PRIVATE PDF CONTENT',
    'doc@data:application/pdf;base64,SECRET:1:2',
    'doc@blob:https://pdfdark.org/SECRET:1:2',
    'doc@https://pdfdark.org/_next/static/PRIVATE.pdf:1:2',
    'doc@https://user:SECRET@pdfdark.org/_next/static/app.js:1:2',
    'doc@https://pdfdark.org/user/PRIVATE.pdf:1:2',
  ].join('\n');
  h.capture(error, 'read', { tool: 'reader' });
  const [safe, scope] = h.events[0];
  assert.equal(scope.contexts.pdf_exception.original_code_frames, 0);
  assert.equal(scope.tags.original_stack_status, 'filtered_out');
  assert(!JSON.stringify([safe.stack, scope]).match(/PRIVATE|SECRET|data:|blob:/));
});

test('a multiline parser message cannot inject document text as a fake code location', () => {
  const h = harness();
  const message = 'PRIVATE PDF TEXT\n    at https://pdfdark.org/_next/static/chunks/SECRET.js:1:2';
  const error = new Error(message);
  error.stack = `Error: ${message}\n    at real (https://pdfdark.org/_next/static/chunks/a.js:7:9)`;
  h.capture(error, 'read');
  const [safe, scope] = h.events[0];
  assert.equal(scope.contexts.pdf_exception.original_code_frames, 1);
  assert(safe.stack.includes('/a.js:7:9'));
  assert(!JSON.stringify([safe.stack, scope]).match(/PRIVATE|SECRET/));
});

test('stack work is bounded, mixed formats are identified, and throwing getters still report', () => {
  const h = harness();
  const error = new Error('PRIVATE');
  error.stack = Array.from({ length: 1000 }, (_, i) => i % 2
    ? `f@https://pdfdark.org/_next/static/chunks/a.js:${i + 1}:2`
    : `    at f (https://pdfdark.org/_next/static/chunks/a.js:${i + 1}:2)`).join('\n');
  h.capture(error, 'read');
  assert.equal(h.events[0][1].contexts.pdf_exception.original_code_frames, 40);
  assert.equal(h.events[0][1].contexts.pdf_exception.original_stack_format, 'mixed');
  const broken = new Error('PRIVATE');
  Object.defineProperty(broken, 'stack', { get() { throw Error('private stack getter'); } });
  Object.defineProperty(broken, 'message', { get() { throw Error('private message getter'); } });
  assert.doesNotThrow(() => h.capture(broken, 'read'));
  assert.equal(h.events[1][1].tags.original_stack_status, 'unavailable');
  assert.equal(h.events[1][1].tags.original_error_reason, 'other');
});

test('known browser messages become fixed categories; arbitrary messages stay private', () => {
  for (const [message, reason] of [
    ['Load failed', 'load_failed'], ['Failed to fetch', 'failed_to_fetch'],
    ['NetworkError when attempting to fetch resource.', 'network_error'],
    ['Importing a module script failed.', 'module_load_failed'],
    ['Failed to fetch dynamically imported module: https://private/SECRET.pdf', 'module_load_failed'],
    ['Out of memory PRIVATE.pdf', 'out_of_memory_hint'],
    ['Cannot use a detached ArrayBuffer PRIVATE.pdf', 'detached_buffer_hint'],
    ['PRIVATE PDF CONTENT', 'other'],
  ]) {
    const h = harness();
    h.capture(new TypeError(message), 'read');
    const [safe, scope] = h.events[0];
    assert.equal(safe.message, 'PDF processing failed');
    assert.equal(scope.tags.original_error_reason, reason);
    assert(!JSON.stringify(scope).match(/PRIVATE|SECRET|https:\/\/private/));
  }
});

test('monochrome phase, dimensions and settings are allowlisted in the final Sentry scope', () => {
  const h = harness();
  h.capture(new TypeError('Load failed'), 'export', { tool: 'monochrome' }, {
    monochromeStep: 'embed_page', pageNumber: 17, pageWidth: 1190, pageHeight: 1684,
    totalPages: 407, monochromeMode: 'black-and-white', threshold: 140,
    filename: 'PRIVATE.pdf', rawData: 'SECRET',
  });
  const scope = h.events[0][1];
  assert.equal(scope.tags.monochrome_step, 'embed_page');
  assert.equal(scope.fingerprint[3], 'embed_page');
  assert.deepEqual(scope.contexts.pdf_failure, {
    page_number: 17, width: 1190, height: 1684, total_pages: 407,
    mode: 'black-and-white', threshold: 140,
  });
  assert(!JSON.stringify(scope).match(/PRIVATE|SECRET/));
});
