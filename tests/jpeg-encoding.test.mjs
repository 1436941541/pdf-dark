import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync(new URL('../lib/main-thread.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function compile(globals = {}) {
  const exports = {};
  new Function('exports', ...Object.keys(globals), source)(exports, ...Object.values(globals));
  return exports;
}

const jpegUrl = 'data:image/jpeg;base64,AQL/';
const pngUrl = 'data:image/png;base64,iVBORw0KGgo=';
const jpegBlob = new Blob([new Uint8Array([1, 2, 255])], { type: 'image/jpeg' });

function canvasWithBlob(blob, fallback = () => assert.fail('Unexpected synchronous fallback')) {
  return {
    toBlob(callback, type, quality) {
      assert.equal(type, 'image/jpeg');
      assert.equal(quality, 0.88);
      queueMicrotask(() => callback(blob));
    },
    toDataURL(type, quality) {
      assert.equal(type, 'image/jpeg');
      assert.equal(quality, 0.88);
      return fallback();
    },
  };
}

function readerWithResult(result) {
  return class {
    readAsDataURL(blob) {
      assert.equal(blob, jpegBlob);
      this.result = result;
      queueMicrotask(() => this.onload());
    }
  };
}

test('reader preserves the FileReader data URL and does not decode a second Base64 copy', async () => {
  const { canvasToJpegDataUrl } = compile({
    FileReader: readerWithResult(jpegUrl),
    atob: () => assert.fail('Reader validation must not allocate decoded bytes'),
  });
  assert.equal(await canvasToJpegDataUrl(canvasWithBlob(jpegBlob), 0.88), jpegUrl);
});

test('reader accepts a nonempty PNG returned by FileReader or the browser fallback', async () => {
  const { canvasToJpegDataUrl } = compile({ FileReader: readerWithResult(pngUrl) });
  assert.equal(await canvasToJpegDataUrl(canvasWithBlob(jpegBlob), 0.88), pngUrl);
  assert.equal(await canvasToJpegDataUrl(canvasWithBlob(null, () => pngUrl), 0.88), pngUrl);
});

test('null and empty toBlob results use the synchronous reader fallback', async () => {
  const { canvasToJpegDataUrl } = compile({ FileReader: class { constructor() { assert.fail('Fallback must not use FileReader'); } } });
  for (const blob of [null, new Blob([], { type: 'image/jpeg' })]) {
    assert.equal(await canvasToJpegDataUrl(canvasWithBlob(blob, () => jpegUrl), 0.88), jpegUrl);
  }
});

const invalidUrls = [
  'data:,',
  '',
  'data:image/jpeg;base64,',
  'data:image/png;base64,',
  'data:text/plain;base64,AQL/',
  'data:image/jpeg;base64,=',
  'data:image/jpeg;base64,A',
  'data:image/jpeg;base64,AA=',
  'data:image/jpeg;base64,A%2F/',
];

test('reader rejects empty or invalid fallback images before bitmap decoding', async () => {
  const { canvasToJpegDataUrl } = compile();
  for (const blob of [null, new Blob()]) {
    for (const url of invalidUrls) {
      await assert.rejects(canvasToJpegDataUrl(canvasWithBlob(blob, () => url), 0.88), { message: 'JPEG encoding failed' });
    }
  }
});

test('asynchronous fallback SecurityError and other callback exceptions reject the reader promise', { timeout: 1000 }, async () => {
  const { canvasToJpegDataUrl } = compile();
  for (const error of [new DOMException('blocked', 'SecurityError'), new Error('encoder failed')]) {
    await assert.rejects(canvasToJpegDataUrl(canvasWithBlob(null, () => { throw error; }), 0.88), (actual) => actual === error);
  }
});

test('FileReader rejects empty, non-string, and invalid image results', async () => {
  for (const result of [...invalidUrls, null, new ArrayBuffer(0)]) {
    const { canvasToJpegDataUrl } = compile({ FileReader: readerWithResult(result) });
    await assert.rejects(canvasToJpegDataUrl(canvasWithBlob(jpegBlob), 0.88), { message: 'JPEG encoding failed' });
  }
});

test('FileReader errors and aborts reject without falling back to synchronous encoding', { timeout: 1000 }, async () => {
  for (const event of ['onerror', 'onabort']) {
    const { canvasToJpegDataUrl } = compile({
      FileReader: class {
        readAsDataURL() { queueMicrotask(() => this[event]()); }
      },
    });
    await assert.rejects(canvasToJpegDataUrl(canvasWithBlob(jpegBlob), 0.88), { message: 'FileReader failed' });
  }
});

test('FileReader constructor and read exceptions reject from the asynchronous toBlob callback', { timeout: 1000 }, async () => {
  const error = new DOMException('blocked', 'SecurityError');
  for (const FileReader of [
    class { constructor() { throw error; } },
    class { readAsDataURL() { throw error; } },
  ]) {
    const { canvasToJpegDataUrl } = compile({ FileReader });
    await assert.rejects(canvasToJpegDataUrl(canvasWithBlob(jpegBlob), 0.88), (actual) => actual === error);
  }
});

test('synchronous toBlob exceptions reject both encoder APIs', async () => {
  const error = new DOMException('blocked', 'SecurityError');
  const { canvasToJpegDataUrl, canvasToJpegBlob } = compile();
  for (const encode of [canvasToJpegDataUrl, canvasToJpegBlob]) {
    await assert.rejects(encode({ toBlob() { throw error; } }, 0.88), (actual) => actual === error);
  }
});

test('Blob encoding returns existing JPEG or PNG bytes without a Base64 round trip', async () => {
  const { canvasToJpegBlob } = compile({ atob: () => assert.fail('Normal Blob encoding must not decode Base64') });
  for (const blob of [jpegBlob, new Blob(['png'], { type: 'image/png' })]) {
    assert.equal(await canvasToJpegBlob(canvasWithBlob(blob), 0.88), blob);
  }
});

test('Blob fallback preserves JPEG bytes and MIME type for null or empty toBlob results', async () => {
  const { canvasToJpegBlob } = compile();
  for (const blob of [null, new Blob()]) {
    for (const url of [jpegUrl, jpegUrl.replace('image/jpeg', 'IMAGE/JPEG')]) {
      const encoded = await canvasToJpegBlob(canvasWithBlob(blob, () => url), 0.88);
      assert.equal(encoded.type, 'image/jpeg');
      assert.deepEqual([...new Uint8Array(await encoded.arrayBuffer())], [1, 2, 255]);
    }
  }
});

test('Blob fallback rejects PNG because the export builder requires JPEG bytes', async () => {
  const { canvasToJpegBlob } = compile();
  for (const blob of [null, new Blob()]) {
    await assert.rejects(canvasToJpegBlob(canvasWithBlob(blob, () => pngUrl), 0.88), { message: 'JPEG encoding failed' });
  }
});

test('Blob fallback rejects zero-byte, empty Base64, and invalid image results', async () => {
  const { canvasToJpegBlob } = compile();
  for (const blob of [null, new Blob()]) {
    for (const url of invalidUrls) {
      await assert.rejects(canvasToJpegBlob(canvasWithBlob(blob, () => url), 0.88), { message: 'JPEG encoding failed' });
    }
  }
});

test('Blob fallback rejects exceptions from an asynchronous canvas callback', { timeout: 1000 }, async () => {
  const { canvasToJpegBlob } = compile();
  const error = new DOMException('blocked', 'SecurityError');
  await assert.rejects(canvasToJpegBlob(canvasWithBlob(null, () => { throw error; }), 0.88), (actual) => actual === error);
});
