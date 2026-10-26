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
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports, ...Object.values(globals));
  return exports;
}
const { canvasToJpegBlob } = compile('../lib/main-thread.ts');

test('JPEG export retains encoded bytes and quality without a Base64 or fetch round trip', async () => {
  const blob = new Blob([new Uint8Array([1, 2, 255])], { type: 'image/jpeg' });
  const canvas = {
    toBlob(callback, type, quality) { assert.equal(type, 'image/jpeg'); assert.equal(quality, 0.88); callback(blob); },
    toDataURL() { assert.fail('Normal encoding must not allocate a Base64 copy'); },
  };
  assert.equal(await canvasToJpegBlob(canvas, 0.88), blob);
});

test('JPEG encoder fallback preserves bytes and rejects an empty canvas result', async () => {
  const canvas = { toBlob(callback) { callback(null); }, toDataURL: () => 'data:image/jpeg;base64,AQL/' };
  assert.deepEqual([...new Uint8Array(await (await canvasToJpegBlob(canvas, 0.88)).arrayBuffer())], [1, 2, 255]);
  canvas.toDataURL = () => 'data:,';
  await assert.rejects(canvasToJpegBlob(canvas, 0.88), /JPEG encoding failed/);
  canvas.toDataURL = () => { throw new DOMException('blocked', 'SecurityError'); };
  await assert.rejects(canvasToJpegBlob(canvas, 0.88), { name: 'SecurityError' });
});

test('Blob decoding bypasses fetch and closes a bitmap if cancelled immediately after decode', async () => {
  let closes = 0;
  const bitmap = { close() { closes++; } };
  let checks = 0;
  const blob = new Blob(['jpeg'], { type: 'image/jpeg' });
  const { loadPageBitmap } = compile('../lib/pdf-image-diagnostics.ts', { '@sentry/nextjs': {} }, {
    fetch() { assert.fail('Blob input must not use fetch'); },
    createImageBitmap: async (input) => { assert.equal(input, blob); return bitmap; },
  });
  assert.equal(await loadPageBitmap(blob, { pageNumber: 1 }, () => {}), bitmap);
  assert.equal(closes, 0);
  const abort = new DOMException('cancelled', 'AbortError');
  await assert.rejects(loadPageBitmap(blob, { pageNumber: 1 }, () => { if (++checks === 3) throw abort; }), (error) => error === abort);
  assert.equal(closes, 1);
});

test('Blob decode failures keep safe diagnostics and the original rejection', async () => {
  const captured = [];
  const error = new TypeError('PRIVATE document data');
  const diagnostics = compile('../lib/pdf-image-diagnostics.ts', { '@sentry/nextjs': { captureException: (...args) => captured.push(args) } }, {
    createImageBitmap: async () => { throw error; },
    console: { error() {} }, document: { visibilityState: 'visible', hasFocus: () => true },
  });
  await assert.rejects(diagnostics.loadPageBitmap(new Blob(['PRIVATE'], { type: 'image/jpeg' }), {
    pageNumber: 416, width: 918, height: 1188, imageRegionCount: 0,
  }, () => {}), (e) => e === error);
  diagnostics.capturePdfProcessingException(error, 'export', { tool: 'invert' });
  const context = captured[0][1].contexts.pdf_image_processing;
  assert.equal(context.step, 'decode_image_bitmap');
  assert.equal(context.source_kind, 'blob');
  assert.equal(context.blob_bytes, 7);
  assert(!JSON.stringify(captured).includes('PRIVATE'));
});

function workerHarness(failEncode = false) {
  const messages = [], canvases = [];
  const self = { postMessage: (message) => messages.push(message) };
  class Canvas {
    constructor(width, height) { this.width = width; this.height = height; canvases.push(this); }
    getContext() { return { drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, 255]) }), putImageData() {} }; }
    async convertToBlob() {
      assert.equal(this.width, 1); assert.equal(this.height, 1);
      if (failEncode) throw Error('encode failed');
      return new Blob(['jpeg'], { type: 'image/jpeg' });
    }
  }
  compile('../lib/dark-worker.ts', {}, { self, OffscreenCanvas: Canvas, console: { error() {} } });
  return { self, messages, canvases };
}
for (const fail of [false, true]) {
  test(`export worker frees its canvas and bitmap after ${fail ? 'failed' : 'successful'} encoding`, async () => {
    const h = workerHarness(fail); let closed = false;
    await h.self.onmessage({ data: { id: 1, bitmap: { close() { closed = true; } }, width: 1, height: 1, theme: 'midnight', releaseResources: true } });
    assert(closed); assert.equal(h.canvases[0].width, 0); assert.equal(h.canvases[0].height, 0);
    assert.equal(h.messages.length, 1);
    assert.equal('error' in h.messages[0], fail);
  });
}

test('reader worker requests retain their existing canvas behavior', async () => {
  const h = workerHarness();
  await h.self.onmessage({ data: { id: 2, bitmap: { close() {} }, width: 1, height: 1, theme: 'midnight' } });
  assert.equal(h.canvases[0].width, 1);
  assert.equal(h.canvases[0].height, 1);
  assert(h.messages[0].blob instanceof Blob);
});
