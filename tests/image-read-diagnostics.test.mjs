import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function compile(file, imports = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', ...Object.keys(globals), code)(name => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports, ...Object.values(globals));
  return exports;
}

const workerDiagnostics = compile('../lib/dark-worker-diagnostics.ts');
const resources = compile('../lib/pdf-image-resource-diagnostics.ts');
const pageInfo = { pageNumber: 217, width: 892, height: 1262, imageRegionCount: 0 };

function harness(step, overrides = {}, resourceModule = resources) {
  const sentry = [], logs = [];
  const failure = new TypeError('PRIVATE PDF document.pdf data:image/jpeg;base64,SECRET');
  const globals = {
    performance: { now: () => 10 },
    document: { visibilityState: 'visible', hasFocus: () => true },
    navigator: { onLine: true },
    console: { error: (...args) => logs.push(args) },
    fetch: async () => {
      if (step === 'fetch_image_data') throw failure;
      return { blob: async () => {
        if (step === 'read_image_blob') throw failure;
        return new Blob(['JPEG'], { type: 'image/jpeg' });
      } };
    },
    createImageBitmap: async () => {
      if (step === 'decode_image_bitmap') throw failure;
      return { close() {} };
    },
    ...overrides,
  };
  const diagnostics = compile('../lib/pdf-image-diagnostics.ts', {
    './dark-worker-diagnostics': workerDiagnostics,
    './pdf-image-resource-diagnostics': resourceModule,
    '@sentry/nextjs': { captureException: (...args) => sentry.push(args) },
  }, globals);
  return { diagnostics, failure, sentry, logs };
}

for (const [step, hint] of [['fetch_image_data', 'fetch_failed'], ['read_image_blob', 'body_read_failed'], ['decode_image_bitmap', 'bitmap_decode_failed']]) {
  test(`active ${step} keeps its original rejection and reports bounded cache/classification metadata`, async () => {
    const h = harness(step);
    let snapshots = 0;
    const cached = [
      { originalDataUrl: 'PRIVATE ORIGINAL', displayDataUrl: 'PRIVATE DARK', byTheme: { midnight: 'PRIVATE DARK' } },
      { originalDataUrl: 'PRIVATE ORIGINAL TWO', displayDataUrl: 'PRIVATE SEPIA', byTheme: { midnight: 'PRIVATE OLD', sepia: 'PRIVATE SEPIA' } },
    ];
    await assert.rejects(h.diagnostics.loadPageBitmap('data:image/jpeg;base64,SECRET', pageInfo, () => {}, () => {
      snapshots++;
      return { ...resources.summarizeImageCache(cached, 1000), filename: 'PRIVATE FILE.pdf', total_pages_injected: 'SECRET' };
    }), error => error === h.failure);
    assert.equal(snapshots, 1);
    assert.equal(h.logs.length, 1);
    h.diagnostics.capturePdfProcessingException(h.failure, 'read', { tool: 'reader' }, { readerStep: 'darkify_page', pageNumber: 217 });
    assert.equal(h.sentry.length, 1);
    const [safe, event] = h.sentry[0], context = event.contexts.pdf_image_processing;
    assert.equal(safe.message, 'PDF processing failed');
    assert.equal(event.tags.image_step, step);
    assert.equal(event.tags.image_error_hint, hint);
    assert.deepEqual(event.fingerprint.slice(-3), ['image-read', step, hint]);
    assert.equal(context.total_pages, 1000);
    assert.equal(context.cached_pages, 2);
    assert.equal(context.cached_variant_count, 3);
    assert.equal(context.cached_data_url_chars, resources.summarizeImageCache(cached).cached_data_url_chars);
    assert.equal(context.cache_snapshot_status, 'captured');
    assert.equal(context.source_empty, false);
    assert.equal(context.page_number, 217);
    assert.equal(context.online, true);
    assert.equal(context.document_focused, true);
    assert.equal(context.blob_bytes, step === 'decode_image_bitmap' ? 4 : undefined);
    assert.equal(context.filename, undefined);
    assert(!JSON.stringify([safe.message, event, h.logs]).match(/PRIVATE|SECRET|document\.pdf|data:image/));
  });
}

test('successful decoding never evaluates cache or memory snapshots and preserves the returned bitmap', async () => {
  let probes = 0;
  const bitmap = { close() {} };
  const h = harness(undefined, { createImageBitmap: async () => bitmap }, {
    ...resources, readImageMemorySnapshot() { assert.fail('Successful decoding must not probe memory'); },
  });
  const source = new Blob(['JPEG'], { type: 'image/jpeg' });
  assert.equal(await h.diagnostics.loadPageBitmap(source, pageInfo, () => {}, () => { probes++; throw Error('probe must not run'); }), bitmap);
  assert.equal(probes, 0);
  assert.equal(h.logs.length, 0);
  assert.equal(h.sentry.length, 0);
});

test('available heap metrics and retained export Blob sizes reach Sentry without cache-provider overrides', async () => {
  const memoryResources = compile('../lib/pdf-image-resource-diagnostics.ts', {}, { globalThis: {
    performance: { memory: { usedJSHeapSize: 123, totalJSHeapSize: 456, jsHeapSizeLimit: 789 } },
    navigator: { deviceMemory: 2 },
  } });
  const h = harness('decode_image_bitmap', {}, memoryResources);
  await assert.rejects(h.diagnostics.loadPageBitmap(new Blob(['JPEG'], { type: 'image/jpeg' }), pageInfo, () => {}, () => ({
    ...memoryResources.summarizeImageCache([{ displayBlob: new Blob(['old output']) }], 520),
    memory_api: 'PRIVATE', js_heap_used_bytes: 999, error_hint: 'PRIVATE',
  })), error => error === h.failure);
  h.diagnostics.capturePdfProcessingException(h.failure, 'export', { tool: 'invert' });
  const context = h.sentry[0][1].contexts.pdf_image_processing;
  assert.equal(context.memory_api, 'performance.memory');
  assert.equal(context.js_heap_used_bytes, 123);
  assert.equal(context.js_heap_total_bytes, 456);
  assert.equal(context.js_heap_limit_bytes, 789);
  assert.equal(context.device_memory_gb, 2);
  assert.equal(context.cached_blob_bytes, 10);
  assert.equal(context.cached_pages, 1);
  assert.equal(context.total_pages, 520);
  assert.equal(context.error_hint, 'bitmap_decode_failed');
  assert(!JSON.stringify(h.sentry).match(/PRIVATE|SECRET/));
});

test('cancellation during an interrupted read bypasses new diagnostics and preserves AbortError', async () => {
  let rejectRead;
  const h = harness(undefined, { fetch: async () => ({ blob: () => new Promise((resolve, reject) => { rejectRead = reject; }) }) });
  const controller = new AbortController();
  const result = h.diagnostics.loadPageBitmap('data:image/jpeg;base64,SECRET', pageInfo, () => controller.signal.throwIfAborted(), () => assert.fail('cancelled operation must not scan caches'));
  await Promise.resolve();
  controller.abort();
  rejectRead(h.failure);
  await assert.rejects(result, error => error === controller.signal.reason);
  assert.equal(h.logs.length, 0);
  assert.equal(h.sentry.length, 0);
});

test('broken clocks, DOM signals, cache providers and console never replace an active read failure', async () => {
  const h = harness('read_image_blob', {
    performance: { now() { throw Error('clock offline'); } },
    document: { get visibilityState() { throw Error('DOM offline'); }, hasFocus() { throw Error('focus offline'); } },
    navigator: { get onLine() { throw Error('network state unavailable'); } },
    console: { error() { throw Error('console offline'); } },
  });
  await assert.rejects(h.diagnostics.loadPageBitmap('data:image/jpeg;base64,SECRET', pageInfo, () => {}, () => { throw Error('cache offline'); }), error => error === h.failure);
  h.diagnostics.capturePdfProcessingException(h.failure, 'read', { tool: 'reader' });
  const context = h.sentry[0][1].contexts.pdf_image_processing;
  assert.equal(context.step, 'read_image_blob');
  assert.equal(context.elapsed_ms, undefined);
  assert.equal(context.visibility, undefined);
  assert.equal(context.document_focused, undefined);
  assert.equal(context.online, undefined);
  assert.equal(context.cache_snapshot_status, 'unavailable');
  assert.equal(context.cache_incomplete, true);
});

test('cache callback metadata is re-allowlisted and partial failure is explicit', async () => {
  const h = harness('fetch_image_data');
  await assert.rejects(h.diagnostics.loadPageBitmap('data:image/jpeg;base64,SECRET', pageInfo, () => {}, () => ({
    total_pages: NaN, cached_pages: 216, cached_original_chars: Infinity,
    cached_variant_chars: -1, cached_data_url_chars: 10.5, cached_blob_bytes: 7,
    cache_incomplete: true, filename: 'PRIVATE.pdf', url: 'data:SECRET',
  })));
  h.diagnostics.capturePdfProcessingException(h.failure, 'read', { tool: 'reader' });
  const context = h.sentry[0][1].contexts.pdf_image_processing;
  assert.equal(context.cached_pages, 216);
  assert.equal(context.cached_blob_bytes, 7);
  assert.equal(context.total_pages, undefined);
  assert.equal(context.cached_original_chars, undefined);
  assert.equal(context.cached_variant_chars, undefined);
  assert.equal(context.cached_data_url_chars, undefined);
  assert.equal(context.cache_incomplete, true);
  assert(!JSON.stringify(h.sentry).match(/PRIVATE|SECRET/));
});

test('cache snapshots observe pages and variants retained when the pending read actually fails', async () => {
  let rejectRead;
  const h = harness(undefined, { fetch: async () => ({ blob: () => new Promise((resolve, reject) => { rejectRead = reject; }) }) });
  const cached = [];
  const pending = h.diagnostics.loadPageBitmap('data:image/jpeg;base64,SECRET', pageInfo, () => {}, () => resources.summarizeImageCache(cached, 1000));
  await Promise.resolve();
  cached.push({ originalDataUrl: 'ORIGINAL', displayDataUrl: 'DARK', byTheme: { midnight: 'DARK' } });
  cached[0].byTheme.sepia = 'SEPIA';
  cached.push({ originalDataUrl: 'NEXT', displayDataUrl: 'OUTPUT', byTheme: { midnight: 'OUTPUT' } });
  rejectRead(h.failure);
  await assert.rejects(pending, error => error === h.failure);
  h.diagnostics.capturePdfProcessingException(h.failure, 'read', { tool: 'reader' });
  const context = h.sentry[0][1].contexts.pdf_image_processing;
  assert.equal(context.cached_pages, 2);
  assert.equal(context.cached_variant_count, 3);
  assert.equal(context.cached_data_url_chars, resources.summarizeImageCache(cached).cached_data_url_chars);
});

test('error name and stack getters cannot prevent a safe Sentry event', async () => {
  const h = harness('fetch_image_data');
  Object.defineProperty(h.failure, 'name', { get() { throw Error('name getter'); } });
  Object.defineProperty(h.failure, 'stack', { get() { throw Error('stack getter'); } });
  await assert.rejects(h.diagnostics.loadPageBitmap('data:image/jpeg;base64,SECRET', pageInfo, () => {}), error => error === h.failure);
  assert.doesNotThrow(() => h.diagnostics.capturePdfProcessingException(h.failure, 'read', { tool: 'reader' }));
  assert.equal(h.sentry[0][1].tags.original_error_type, 'Other');
});
