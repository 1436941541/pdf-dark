import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function compile(globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(new URL('../lib/pdf-image-resource-diagnostics.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal(output.diagnostics.length, 0);
  const exports = {};
  const scope = { ...globalThis, ...globals };
  new Function('exports', 'globalThis', output.outputText)(exports, scope);
  return exports;
}
const helpers = compile();

test('error hints identify supported signals without returning error text or document data', () => {
  for (const [error, step, hint] of [
    [new Error('PRIVATE document.pdf: Out of memory'), 'read_image_blob', 'out_of_memory'],
    [new Error('allocation failed: data:image/jpeg;base64,SECRET'), 'decode_image_bitmap', 'out_of_memory'],
    [new DOMException('SECRET', 'SecurityError'), 'fetch_image_data', 'security_error'],
    [new DOMException('SECRET', 'QuotaExceededError'), 'read_image_blob', 'quota_exceeded'],
    [new DOMException('SECRET', 'InvalidStateError'), 'decode_image_bitmap', 'invalid_state'],
    [new TypeError('SECRET'), 'fetch_image_data', 'fetch_failed'],
    [new TypeError('SECRET'), 'read_image_blob', 'body_read_failed'],
    [new TypeError('SECRET'), 'decode_image_bitmap', 'bitmap_decode_failed'],
  ]) {
    const result = helpers.imageReadErrorHint(error, step);
    assert.equal(result, hint);
    assert(!/PRIVATE|SECRET|document\.pdf|data:image/.test(result));
  }
});

test('error classification is bounded and tolerates throwing or missing exception fields', () => {
  assert.equal(helpers.imageReadErrorHint({ message: 'x'.repeat(512) + 'Out of memory' }, 'read_image_blob'), 'body_read_failed');
  assert.equal(helpers.imageReadErrorHint({ get name() { throw Error('PRIVATE'); }, message: 'could not allocate' }, 'read_image_blob'), 'out_of_memory');
  assert.equal(helpers.imageReadErrorHint({ name: 'SecurityError', get message() { throw Error('PRIVATE'); } }, 'read_image_blob'), 'security_error');
  assert.equal(helpers.imageReadErrorHint(new Proxy({}, { get() { throw Error('PRIVATE'); } }), 'fetch_image_data'), 'fetch_failed');
  assert.equal(helpers.imageReadErrorHint(null, 'decode_image_bitmap'), 'bitmap_decode_failed');
  assert.equal(helpers.imageReadErrorHint(null, 'invalid-step'), 'other');
});

test('memory snapshot reports browser heap and coarse device capacity with explicit API source', () => {
  const h = compile({ performance: { memory: { usedJSHeapSize: 1000, totalJSHeapSize: 2000, jsHeapSizeLimit: 4000, private: 'SECRET' } }, navigator: { deviceMemory: 0.5 } });
  assert.deepEqual(h.readImageMemorySnapshot(), { memory_api: 'performance.memory', js_heap_used_bytes: 1000, js_heap_total_bytes: 2000, js_heap_limit_bytes: 4000, device_memory_gb: 0.5 });
});

test('missing browser memory APIs are unavailable rather than zero', () => {
  for (const globals of [{}, { performance: undefined, navigator: undefined }, { performance: {}, navigator: {} }]) {
    const h = compile(globals);
    assert.deepEqual(h.readImageMemorySnapshot(), { memory_api: 'unavailable' });
  }
});

test('invalid memory values are omitted and real zero values are retained', () => {
  const h = compile({ performance: { memory: { usedJSHeapSize: 0, totalJSHeapSize: NaN, jsHeapSizeLimit: -1 } }, navigator: { deviceMemory: Infinity } });
  assert.deepEqual(h.readImageMemorySnapshot(), { memory_api: 'performance.memory', js_heap_used_bytes: 0 });
  const invalid = compile({ performance: { memory: { usedJSHeapSize: 'SECRET', totalJSHeapSize: Infinity, jsHeapSizeLimit: Number.MAX_SAFE_INTEGER + 1 } }, navigator: { deviceMemory: -1 } });
  assert.deepEqual(invalid.readImageMemorySnapshot(), { memory_api: 'unavailable' });
});

test('broken memory or navigator getters never throw or hide independent metrics', () => {
  const performance = { memory: { get usedJSHeapSize() { throw Error('PRIVATE'); }, totalJSHeapSize: 42, jsHeapSizeLimit: 100 } };
  const navigator = { get deviceMemory() { throw Error('PRIVATE'); } };
  assert.deepEqual(compile({ performance, navigator }).readImageMemorySnapshot(), { memory_api: 'performance.memory', js_heap_total_bytes: 42, js_heap_limit_bytes: 100 });
  assert.deepEqual(compile({ performance: { get memory() { throw Error('PRIVATE'); } }, navigator: { deviceMemory: 4 } }).readImageMemorySnapshot(), { memory_api: 'unavailable', device_memory_gb: 4 });
  const globals = { get performance() { throw Error('PRIVATE'); }, get navigator() { throw Error('PRIVATE'); } };
  // compile() spreads its argument, so install root getters inside a dedicated
  // VM scope after compilation for this unavailable-root case.
  const source = fs.readFileSync(new URL('../lib/pdf-image-resource-diagnostics.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', 'globalThis', code)(exports, globals);
  assert.deepEqual(exports.readImageMemorySnapshot(), { memory_api: 'unavailable' });
});

test('reader cache summary counts original, display and variants and de-duplicates page-local aliases', () => {
  const original = 'data:image/jpeg;base64,ORIGINAL';
  const dark = 'data:image/jpeg;base64,DARK';
  const sepia = 'data:image/jpeg;base64,SEPIA';
  const pages = [
    { originalDataUrl: original, displayDataUrl: dark, byTheme: { midnight: dark, duplicate: dark, sepia } },
    { originalDataUrl: original, displayDataUrl: original, byTheme: { original } },
  ];
  const result = helpers.summarizeImageCache(pages, 400);
  assert.deepEqual(result, {
    total_pages: 400, cached_pages: 2, cached_original_chars: original.length * 2,
    cached_display_chars: dark.length + original.length,
    cached_variant_chars: dark.length * 2 + sepia.length + original.length,
    cached_variant_count: 4, cached_blob_bytes: 0,
    cached_data_url_chars: original.length * 2 + dark.length + sepia.length,
  });
  assert(!JSON.stringify(result).match(/data:image|ORIGINAL|DARK|SEPIA/));
  assert.equal(pages[0].byTheme.midnight, dark);
});

test('display data outside variant cache is counted once and export blobs use byte sizes', () => {
  const result = helpers.summarizeImageCache([
    { originalDataUrl: 'AAA', displayDataUrl: 'BBBB', byTheme: { cached: 'CCCCC' } },
    { displayBlob: new Blob([new Uint8Array(7)]) },
    { displayBlob: new Blob([]) },
  ], 3);
  assert.equal(result.cached_data_url_chars, 12);
  assert.equal(result.cached_blob_bytes, 7);
  assert.equal(result.cached_variant_count, 1);
  assert.equal(result.cached_pages, 3);
});

test('empty, invalid and adversarial caches return bounded partial scalar metadata', () => {
  assert.deepEqual(helpers.summarizeImageCache([], NaN), { cached_pages: 0, cached_original_chars: 0, cached_display_chars: 0, cached_variant_chars: 0, cached_variant_count: 0, cached_blob_bytes: 0, cached_data_url_chars: 0 });
  for (const input of [undefined, null, {}, new Proxy([], { get() { throw Error('PRIVATE'); } })]) {
    assert.equal(helpers.summarizeImageCache(input).cache_incomplete, true);
  }
  const result = helpers.summarizeImageCache([
    null,
    { get originalDataUrl() { throw Error('PRIVATE'); }, displayDataUrl: 'SAFE', byTheme: { good: '123', get bad() { throw Error('SECRET'); } }, displayBlob: { size: -1 } },
    { byTheme: new Proxy({}, { ownKeys() { throw Error('PRIVATE'); } }), displayBlob: new Blob(['12']) },
  ], -1);
  assert.equal(result.cache_incomplete, true);
  assert.equal(result.total_pages, undefined);
  assert.equal(result.cached_data_url_chars, 7);
  assert.equal(result.cached_blob_bytes, 2);
  assert(!JSON.stringify(result).match(/PRIVATE|SECRET|SAFE/));
});

test('very large malformed cache shapes stop collecting instead of scanning unbounded diagnostic inputs', () => {
  const variants = Object.fromEntries(Array.from({ length: 260 }, (_, index) => [String(index), 'x']));
  const result = helpers.summarizeImageCache([{ byTheme: variants }], 1);
  assert.equal(result.cache_incomplete, true);
  assert.equal(result.cached_variant_count, 256);
  assert.equal(result.cached_data_url_chars, 1);
  const huge = new Proxy([], { get(target, key) { if (key === 'length') return 100001; return undefined; } });
  assert.equal(helpers.summarizeImageCache(huge).cache_incomplete, true);
});
