import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function compile(file, imports = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', ...Object.keys(globals), source)(name => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports, ...Object.values(globals));
  return exports;
}

const jpeg = 'data:image/jpeg;base64,AQL/';
const png = 'data:image/png;base64,iVBORw0KGgo=';
const blob = new Blob(['jpeg'], { type: 'image/jpeg' });

function harness(globals = {}, diagnosticGlobals = {}, overrides = {}) {
  let ticks = 0;
  const diagnostics = compile('../lib/pdf-encoding-diagnostics.ts', {}, {
    globalThis: { performance: { now: () => ticks++ * 50 } }, ...diagnosticGlobals,
  });
  const encoders = compile('../lib/main-thread.ts', {
    './pdf-encoding-diagnostics': { ...diagnostics, ...overrides },
  }, globals);
  return { ...encoders, ...diagnostics };
}

function canvasWith(result, fallback = () => assert.fail('Unexpected fallback')) {
  return {
    width: 1600, height: 2400,
    toBlob(callback, type, quality) {
      assert.equal(type, 'image/jpeg');
      assert.equal(quality, 0.88);
      queueMicrotask(() => callback(result));
    },
    toDataURL(type, quality) {
      assert.equal(type, 'image/jpeg');
      assert.equal(quality, 0.88);
      return fallback();
    },
  };
}

async function failure(promise) {
  try { await promise; } catch (error) { return error; }
  assert.fail('Expected rejection');
}

test('successful Blob and PNG FileReader results preserve bytes without failure probes', async () => {
  let blobMetadataReads = 0;
  const retainedBlob = {
    get size() { blobMetadataReads++; return 4; },
    get type() { assert.fail('Successful encoding must not inspect MIME for diagnostics'); },
  };
  const h = harness({
    atob() { assert.fail('Success must not decode a second copy'); },
    FileReader: class {
      readAsDataURL(value) {
        assert.equal(value, retainedBlob);
        this.result = png;
        queueMicrotask(() => this.onload());
      }
    },
  }, {}, { recordCanvasEncodingFailure() { assert.fail('Success must not record diagnostics'); } });
  const canvas = canvasWith(retainedBlob);
  let widthReads = 0, heightReads = 0;
  Object.defineProperty(canvas, 'width', { get() { widthReads++; return 1600; } });
  Object.defineProperty(canvas, 'height', { get() { heightReads++; return 2400; } });
  assert.equal(await h.canvasToJpegBlob(canvas, 0.88), retainedBlob);
  assert.equal(await h.canvasToJpegDataUrl(canvas, 0.88), png);
  assert.equal(blobMetadataReads, 2);
  assert.equal(widthReads, 2, 'Only the numeric start baseline is read per encode');
  assert.equal(heightReads, 2);
  assert.equal(h.getCanvasEncodingFailure(new Error()), undefined);
});

const invalidUrls = [
  [null, 'data_url_not_string'],
  ['data:,', 'empty_data_url_sentinel'],
  ['', 'invalid_data_url_header'],
  ['data:text/plain;base64,AQL/', 'invalid_data_url_header'],
  ['data:image/jpeg;base64,', 'empty_base64'],
  ['data:image/jpeg;base64,A%2F/', 'invalid_base64_characters'],
  ['data:image/jpeg;base64,A', 'invalid_base64_length'],
  ['data:image/jpeg;base64,AA=', 'invalid_base64_padding'],
];

test('null and empty toBlob fallback failures retain exact validation classifications and sizes', async () => {
  const h = harness();
  for (const [api, encode] of [['blob', h.canvasToJpegBlob], ['data_url', h.canvasToJpegDataUrl]]) {
    for (const result of [null, new Blob([], { type: 'image/jpeg' })]) {
      for (const [url, kind] of invalidUrls) {
        const error = await failure(encode(canvasWith(result, () => url), 0.88));
        assert.equal(error.message, 'JPEG encoding failed');
        const details = h.getCanvasEncodingFailure(error);
        assert.equal(details.api, api);
        assert.equal(details.phase, 'validate_data_url');
        assert.equal(details.failure_kind, kind);
        assert.equal(details.to_blob_result, result ? 'empty' : 'null');
        assert.equal(details.blob_present, Boolean(result));
        assert.equal(details.blob_bytes, result ? 0 : undefined);
        assert.equal(details.canvas_start_pixels, 3_840_000);
        assert.equal(details.canvas_failure_pixels, 3_840_000);
        assert.equal(details.canvas_changed, false);
        assert.equal(details.quality, 0.88);
        assert.equal(details.elapsed_ms, 50);
        assert.equal(details.data_url_chars, typeof url === 'string' ? url.length : undefined);
        assert.equal(details.data_url_empty_sentinel, typeof url === 'string' ? url === 'data:,' : undefined);
      }
    }
  }
});

test('failure snapshots observe canvas reset while preserving the original start geometry', async () => {
  const h = harness();
  const canvas = canvasWith(null, () => {
    canvas.width = 0;
    canvas.height = 0;
    return 'data:,';
  });
  const details = h.getCanvasEncodingFailure(await failure(h.canvasToJpegBlob(canvas, 0.88)));
  assert.equal(details.canvas_start_width, 1600);
  assert.equal(details.canvas_start_height, 2400);
  assert.equal(details.canvas_failure_pixels, 0);
  assert.equal(details.canvas_changed, true);
});

test('PNG fallback stays supported by the reader and gets a precise export rejection', async () => {
  const h = harness();
  assert.equal(await h.canvasToJpegDataUrl(canvasWith(null, () => png), 0.88), png);
  const error = await failure(h.canvasToJpegBlob(canvasWith(null, () => png), 0.88));
  const details = h.getCanvasEncodingFailure(error);
  assert.equal(error.message, 'JPEG encoding failed');
  assert.equal(details.phase, 'validate_jpeg_type');
  assert.equal(details.failure_kind, 'unsupported_jpeg_fallback');
  assert.equal(details.data_url_header_mime, 'png');
  assert.equal(details.base64_characters_valid, true);
});

test('frozen native synchronous and fallback errors keep their identity and safe metadata', async () => {
  for (const method of ['toBlob', 'toDataURL']) {
    for (const api of ['canvasToJpegBlob', 'canvasToJpegDataUrl']) {
      const h = harness();
      const original = Object.freeze(new DOMException('PRIVATE FILE.pdf data:image/jpeg;base64,SECRET', 'SecurityError'));
      const canvas = canvasWith(null, () => { throw original; });
      if (method === 'toBlob') canvas.toBlob = () => { throw original; };
      const error = await failure(h[api](canvas, 0.88));
      assert.equal(error, original);
      const details = h.getCanvasEncodingFailure(error);
      assert.equal(details.phase, method === 'toBlob' ? 'to_blob' : 'to_data_url');
      assert.equal(details.failure_kind, method === 'toBlob' ? 'to_blob_threw' : 'to_data_url_threw');
      assert(!JSON.stringify(details).match(/PRIVATE|SECRET|data:image|SecurityError|FILE\.pdf/));
    }
  }
});

test('atob and Blob allocation failures keep their native errors and report the failing phase', async () => {
  for (const [phase, globals] of [
    ['decode_base64', error => ({ atob() { throw error; } })],
    ['build_blob', error => ({ Blob: class { constructor() { throw error; } } })],
  ]) {
    const original = new RangeError('PRIVATE allocation');
    const h = harness(globals(original));
    const error = await failure(h.canvasToJpegBlob(canvasWith(null, () => jpeg), 0.88));
    assert.equal(error, original);
    const details = h.getCanvasEncodingFailure(error);
    assert.equal(details.phase, phase);
    assert.equal(details.base64_chars, 4);
    assert.equal(details.base64_characters_valid, true);
    assert.equal(details.data_url_header_mime, 'jpeg');
  }
});

test('zero-byte reconstructed Blob keeps the original validation failure', async () => {
  const h = harness({ Blob: class { size = 0; } });
  const error = await failure(h.canvasToJpegBlob(canvasWith(null, () => jpeg), 0.88));
  assert.equal(error.message, 'JPEG encoding failed');
  assert.equal(h.getCanvasEncodingFailure(error).failure_kind, 'empty_encoded_blob');
});

test('asynchronous FileReader error and abort retain FileReader failed without retry', async () => {
  for (const event of ['onerror', 'onabort']) {
    const h = harness({ FileReader: class {
      readAsDataURL(value) {
        assert.equal(value, blob);
        queueMicrotask(() => this[event]());
      }
    } });
    const error = await failure(h.canvasToJpegDataUrl(canvasWith(blob), 0.88));
    const details = h.getCanvasEncodingFailure(error);
    assert.equal(error.message, 'FileReader failed');
    assert.equal(details.phase, 'read_blob_as_data_url');
    assert.equal(details.failure_kind, event === 'onerror' ? 'file_reader_error' : 'file_reader_abort');
    assert.equal(details.to_blob_result, 'nonempty');
    assert.equal(details.blob_bytes, 4);
    assert.equal(details.blob_type, 'jpeg');
    assert.equal(details.data_url_chars, undefined);
  }
});

test('FileReader constructor, read, and result getter failures retain original native errors', async () => {
  const original = new DOMException('PRIVATE', 'NotReadableError');
  for (const [kind, FileReader] of [
    ['file_reader_constructor_threw', class { constructor() { throw original; } }],
    ['file_reader_read_threw', class { readAsDataURL() { throw original; } }],
    ['file_reader_result_threw', class {
      get result() { throw original; }
      readAsDataURL() { queueMicrotask(() => this.onload()); }
    }],
  ]) {
    const h = harness({ FileReader });
    const error = await failure(h.canvasToJpegDataUrl(canvasWith(blob), 0.88));
    assert.equal(error, original);
    assert.equal(h.getCanvasEncodingFailure(error).failure_kind, kind);
  }
});

test('invalid FileReader result reports validation classification without Base64 decode', async () => {
  for (const [result, kind] of invalidUrls) {
    const h = harness({
      atob() { assert.fail('FileReader validation must never decode'); },
      FileReader: class {
        readAsDataURL() { this.result = result; queueMicrotask(() => this.onload()); }
      },
    });
    const details = h.getCanvasEncodingFailure(await failure(h.canvasToJpegDataUrl(canvasWith(blob), 0.88)));
    assert.equal(details.phase, 'validate_data_url');
    assert.equal(details.to_blob_result, 'nonempty');
    assert.equal(details.failure_kind, kind);
  }
});

test('large private data URLs yield only scalar counts, enum MIME and validation flags', async () => {
  const h = harness();
  const privateUrl = `data:image/jpeg;base64,${'A'.repeat(1_000_000)}PRIVATE_SECRET%`;
  const error = await failure(h.canvasToJpegBlob(canvasWith(null, () => privateUrl), 0.88));
  const details = h.getCanvasEncodingFailure(error);
  assert.equal(details.failure_kind, 'invalid_base64_characters');
  assert.equal(details.base64_characters_valid, false);
  assert.equal(details.data_url_chars, privateUrl.length);
  assert.equal(details.base64_chars, privateUrl.length - 'data:image/jpeg;base64,'.length);
  assert(!JSON.stringify(details).match(/PRIVATE|SECRET|data:image|base64,/));
  for (const value of Object.values(details)) assert(value === undefined || ['string', 'boolean', 'number'].includes(typeof value));
  assert(JSON.stringify(details).length < 1500);
  details.failure_kind = 'PRIVATE_MUTATION';
  assert.equal(h.getCanvasEncodingFailure(error).failure_kind, 'invalid_base64_characters');
});

test('hostile canvas/Blob/clock/error getters cannot replace the original encoding rejection', async () => {
  const original = new Error('PRIVATE ORIGINAL');
  Object.defineProperty(original, 'message', { get() { assert.fail('Diagnostics must not read the original message'); } });
  Object.defineProperty(original, 'stack', { get() { assert.fail('Diagnostics must not read the original stack'); } });
  Object.freeze(original);
  const h = harness({}, { globalThis: { get performance() { throw Error('clock'); } } });
  const poisonedBlob = {
    get size() { throw original; },
    get type() { throw Error('PRIVATE MIME'); },
  };
  const canvas = canvasWith(poisonedBlob);
  Object.defineProperty(canvas, 'width', { get() { throw Error('width'); } });
  Object.defineProperty(canvas, 'height', { get() { throw Error('height'); } });
  const error = await failure(h.canvasToJpegBlob(canvas, 0.88));
  assert.equal(error, original);
  const details = h.getCanvasEncodingFailure(error);
  assert.equal(details.failure_kind, 'blob_metadata_threw');
  assert.equal(details.canvas_start_pixels, undefined);
  assert.equal(details.elapsed_ms, undefined);
  assert.equal(details.blob_type, undefined);
  assert(!JSON.stringify(details).match(/PRIVATE/));
});

test('unavailable baseline getters do not interfere with a successful native Blob encode', async () => {
  const h = harness({}, { globalThis: { get performance() { throw Error('clock'); } } });
  const canvas = canvasWith(blob);
  Object.defineProperty(canvas, 'width', { get() { throw Error('width'); } });
  Object.defineProperty(canvas, 'height', { get() { throw Error('height'); } });
  assert.equal(await h.canvasToJpegBlob(canvas, 0.88), blob);
});

test('diagnostic implementation failures never change encoding success or native rejection', async () => {
  const h = harness({}, {}, {
    startCanvasEncodingDiagnostics() { throw Error('diagnostic baseline offline'); },
    recordCanvasEncodingFailure() { throw Error('diagnostic writer offline'); },
  });
  assert.equal(await h.canvasToJpegBlob(canvasWith(blob), 0.88), blob);
  const original = new DOMException('PRIVATE', 'SecurityError');
  const error = await failure(h.canvasToJpegBlob(canvasWith(null, () => { throw original; }), 0.88));
  assert.equal(error, original);
});

test('writer allowlists scalar metadata and getter tolerates primitive or revoked errors', () => {
  const h = harness();
  const error = Object.freeze(new Error('PRIVATE'));
  const canvas = { width: 1, height: 2 };
  const details = {
    api: 'blob', phase: 'to_blob', failure_kind: 'to_blob_threw', to_blob_result: 'unavailable',
    filename: 'PRIVATE FILE.pdf', url: 'data:SECRET', blob_type: 'PRIVATE MIME',
    get base64_chars() { throw Error('PRIVATE'); },
    data_url_chars: Infinity,
  };
  assert.doesNotThrow(() => h.recordCanvasEncodingFailure(error, canvas, {}, details));
  const safe = h.getCanvasEncodingFailure(error);
  assert.equal(safe.filename, undefined);
  assert.equal(safe.base64_chars, undefined);
  assert.equal(safe.data_url_chars, undefined);
  assert(!JSON.stringify(safe).match(/PRIVATE|SECRET|data:/));
  for (const value of [null, undefined, 'PRIVATE', 42, Symbol('PRIVATE')]) {
    assert.equal(h.getCanvasEncodingFailure(value), undefined);
    assert.doesNotThrow(() => h.recordCanvasEncodingFailure(value, canvas, {}, details));
  }
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  assert.equal(h.getCanvasEncodingFailure(revoked.proxy), undefined);
});
