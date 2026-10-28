import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function compile(file, imports = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', ...Object.keys(globals), code)((name) => {
    assert(name in imports, `Unexpected dependency ${name}`); return imports[name];
  }, exports, ...Object.values(globals));
  return exports;
}
const diagnostics = compile('../lib/dark-worker-diagnostics.ts');
const { sanitizeDarkWorkerFailure, describeDarkWorkerFailure, restoreDarkWorkerError, darkWorkerFailure } = diagnostics;
function harness(step, options = {}) {
  const messages = [], logged = [];
  const error = Object.assign(new Error('PRIVATE document.pdf data:image/jpeg;base64,SECRET'), { name: 'EncodingError' });
  const fail = current => { if (step === current) throw error; };
  let draws = 0;
  const context = {
    drawImage() { fail(++draws === 1 ? 'draw_bitmap' : 'restore_images'); },
    getImageData() { fail('read_pixels'); return { get data() { fail('apply_dark'); return new Uint8ClampedArray([0, 0, 0, 255]); } }; },
    putImageData() { fail('write_pixels'); }, beginPath() {}, rect() {}, fill() {},
    isContextLost() { if (options.brokenContextProbe) throw Error('probe failed'); return true; },
  };
  class Canvas {
    constructor(width, height) { fail('create_canvas'); this.width = width; this.height = height; }
    getContext() { fail('create_context'); return context; }
    async convertToBlob() { fail('encode_jpeg'); return new Blob(['JPEG'], { type: 'image/jpeg' }); }
  }
  const self = { postMessage(message) { if ('blob' in message) fail('post_result'); messages.push(message); } };
  const globals = { self, OffscreenCanvas: Canvas, console: { error(...args) { if (options.brokenConsole) throw Error('console failed'); logged.push(args); } } };
  if (options.brokenClock) globals.performance = { now() { throw Error('clock failed'); } };
  compile('../lib/dark-worker.ts', { './dark-worker-diagnostics': diagnostics }, globals);
  const request = { id: 42, pageNumber: 871, sourceBytes: 4, width: 1, height: 1, theme: 'midnight', imageMode: 'smart', bitmap: { width: 1, height: 1, close() { fail('close_bitmap'); } }, imageRects: [{ x: 0, y: 0, w: 1, h: 1 }], imageDims: [0] };
  return { self, request, messages, logged };
}
for (const step of diagnostics.DARK_WORKER_STEPS) {
  test(`worker reports ${step} without forwarding private error strings`, async () => {
    const h = harness(step);
    await h.self.onmessage({ data: h.request });
    assert.equal(h.messages.length, 1);
    const packet = h.messages[0];
    assert.equal(packet.id, 42); assert.equal(packet.error, 'PDF image worker failed');
    assert.equal(packet.diagnostic.step, step);
    assert.equal(packet.diagnostic.error_type, 'EncodingError');
    assert.equal(packet.diagnostic.page_number, 871);
    assert.equal(packet.diagnostic.width, 1); assert.equal(packet.diagnostic.pixel_count, 1);
    assert.equal(packet.diagnostic.bitmap_width, 1);
    assert.equal(packet.diagnostic.image_region_count, 1);
    assert.equal(packet.diagnostic.image_mode, 'smart');
    assert.equal(packet.diagnostic.source_bytes, 4);
    assert(JSON.stringify(packet).length < 1024);
    assert(!JSON.stringify([h.messages, h.logged]).match(/PRIVATE|SECRET|document\.pdf|data:image/));
  });
}

test('successful processing preserves the normal blob response and emits no diagnostic logs', async () => {
  const h = harness(); await h.self.onmessage({ data: h.request });
  assert.equal(h.messages.length, 1); assert(h.messages[0].blob instanceof Blob);
  assert.equal(h.messages[0].diagnostic, undefined); assert.equal(h.logged.length, 0);
});

test('failing clocks, context probes and console never replace the processing failure', async () => {
  const h = harness('encode_jpeg', { brokenClock: true, brokenContextProbe: true, brokenConsole: true });
  await h.self.onmessage({ data: h.request });
  assert.equal(h.messages[0].diagnostic.step, 'encode_jpeg');
  assert.equal(h.messages[0].diagnostic.elapsed_ms, undefined);
  assert.equal(h.messages[0].diagnostic.context_lost, undefined);
});

test('metadata schema discards arbitrary fields, unknown names, malformed sizes and versions', () => {
  const result = sanitizeDarkWorkerFailure({ version: 1, step: 'read_pixels', error_type: 'private.pdf', error_hint: 'SECRET', width: Infinity, height: -1, page_number: NaN, image_region_count: 3, theme: 'SECRET', image_mode: 'SECRET', context_lost: true, message: 'PRIVATE', stack: 'PRIVATE', source: 'PRIVATE' });
  assert.deepEqual(result, { version: 1, step: 'read_pixels', error_type: 'Other', error_hint: 'other', image_region_count: 3, context_lost: true });
  assert.equal(sanitizeDarkWorkerFailure({ version: 2, step: 'read_pixels' }), undefined);
  assert.equal(sanitizeDarkWorkerFailure({ version: 1, step: 'PRIVATE' }), undefined);
  assert.equal(sanitizeDarkWorkerFailure(new Proxy({}, { get() { throw Error('bad accessor'); } })), undefined);
});

test('message hints are bounded categories and do not assert a confirmed cause', () => {
  assert.equal(describeDarkWorkerFailure(new Error('PRIVATE Out of memory'), { step: 'read_pixels' }).error_hint, 'out_of_memory');
  assert.equal(describeDarkWorkerFailure(new Error('context unavailable: PRIVATE'), { step: 'create_context' }).error_hint, 'context_unavailable');
  assert.equal(describeDarkWorkerFailure(new Error('context was lost: PRIVATE'), { step: 'write_pixels' }).error_hint, 'context_lost');
  assert.equal(describeDarkWorkerFailure(new Error('ImageBitmap is detached: PRIVATE'), { step: 'draw_bitmap' }).error_hint, 'invalid_bitmap');
  assert.equal(describeDarkWorkerFailure({ get name() { throw Error('getter'); } }, { step: 'read_pixels' }).error_type, 'Other');
});

test('main-thread restoration keeps Error semantics and tolerates older workers', () => {
  const old = restoreDarkWorkerError({ error: 'PRIVATE' });
  assert.equal(old.name, 'Error'); assert.equal(old.message, 'PDF image worker failed'); assert.equal(darkWorkerFailure(old), undefined);
  const error = restoreDarkWorkerError({ diagnostic: { version: 1, step: 'read_pixels', error_type: 'AbortError' } });
  assert.equal(error.name, 'Error'); assert.equal(darkWorkerFailure(error).error_type, 'AbortError');
  assert.doesNotThrow(() => restoreDarkWorkerError({ get diagnostic() { throw Error('broken'); } }));
});

test('actual worker error packet reaches redacted Sentry context with stage-specific grouping', async () => {
  const h = harness('read_pixels'); await h.self.onmessage({ data: h.request });
  const calls = [];
  const monitoring = compile('../lib/pdf-image-diagnostics.ts', {
    './dark-worker-diagnostics': diagnostics, '@sentry/nextjs': { captureException: (...args) => calls.push(args) },
  }, { document: { visibilityState: 'hidden', hasFocus: () => false }, navigator: { onLine: false } });
  const error = restoreDarkWorkerError(h.messages[0]);
  monitoring.capturePdfProcessingException(error, 'export', { tool: 'invert' }, { invertStep: 'darkify_page', pageNumber: 871 });
  assert.equal(calls.length, 1);
  const [safe, event] = calls[0];
  assert.equal(safe.message, 'PDF processing failed');
  assert.equal(event.tags.worker_step, 'read_pixels');
  assert.equal(event.tags.original_error_type, 'EncodingError');
  assert.equal(event.contexts.pdf_dark_worker.page_number, 871);
  assert.equal(event.contexts.pdf_failure.page_number, 871);
  assert.equal(event.contexts.pdf_dark_worker.visibility, 'hidden');
  assert.equal(event.contexts.pdf_dark_worker.document_focused, false);
  assert.equal(event.contexts.pdf_dark_worker.online, false);
  assert.deepEqual(event.fingerprint.slice(-3), ['dark-worker', 'read_pixels', 'other']);
  assert(!JSON.stringify(calls).match(/PRIVATE|SECRET|document\.pdf|data:image/));
});


test('missing browser signals or a failing SDK cannot replace a worker error', () => {
  const error = restoreDarkWorkerError({ diagnostic: { version: 1, step: 'read_pixels', error_type: 'RangeError' } });
  let calls = 0;
  const monitoring = compile('../lib/pdf-image-diagnostics.ts', {
    './dark-worker-diagnostics': diagnostics,
    '@sentry/nextjs': { captureException() { calls++; throw Error('SDK offline'); } },
  }, { document: { get visibilityState() { throw Error('unavailable'); } } });
  assert.doesNotThrow(() => monitoring.capturePdfProcessingException(error, 'export', { tool: 'invert' }));
  assert.equal(calls, 1);
  assert.equal(error.message, 'PDF image worker failed');
});
