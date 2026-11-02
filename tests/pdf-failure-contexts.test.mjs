import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { defaultStackParser, eventFromException } from '@sentry/browser';

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

function harness() {
  const events = [], breadcrumbs = [];
  let ticks = 0;
  const performance = { now: () => ticks++ * 10 };
  const environment = {
    performance,
    Date: { now: () => 1_798_848_000_000 + ticks++ * 10 },
    document: { visibilityState: 'visible', hasFocus: () => true },
    navigator: { onLine: true },
    location: { origin: 'https://pdfdark.org' },
    globalThis: { performance, navigator: { deviceMemory: 16 } },
  };
  const sentry = {
    captureException: (...args) => events.push(args),
    addBreadcrumb: value => breadcrumbs.push(value),
  };
  // Each producer and capture share these actual module instances/WeakMaps.
  const encoding = compile('../lib/pdf-encoding-diagnostics.ts', {}, environment);
  const fileRead = compile('../lib/pdf-file-read-diagnostics.ts', {}, environment);
  const background = compile('../lib/background-worker-diagnostics.ts', { '@sentry/nextjs': sentry }, environment);
  const resources = compile('../lib/pdf-image-resource-diagnostics.ts', {}, environment);
  const encoders = compile('../lib/main-thread.ts', { './pdf-encoding-diagnostics': encoding }, environment);
  const image = compile('../lib/pdf-image-diagnostics.ts', {
    './dark-worker-diagnostics': compile('../lib/dark-worker-diagnostics.ts'),
    './pdf-encoding-diagnostics': encoding,
    './pdf-file-read-diagnostics': fileRead,
    './background-worker-diagnostics': background,
    './pdf-image-resource-diagnostics': resources,
    '@sentry/nextjs': sentry,
  }, environment);
  return { ...encoding, ...fileRead, ...background, ...encoders, ...resources, ...image, events, breadcrumbs };
}

async function rejection(promise) {
  try { await promise; } catch (error) { return error; }
  assert.fail('Expected the native operation to reject');
}

function emptyCanvas() {
  return {
    width: 1224, height: 1584,
    toBlob(callback, type, quality) {
      assert.equal(type, 'image/jpeg');
      assert.equal(quality, 0.88);
      queueMicrotask(() => callback(null));
    },
    toDataURL(type, quality) {
      assert.equal(type, 'image/jpeg');
      assert.equal(quality, 0.88);
      return 'data:,';
    },
  };
}

function assertPrivate(value) {
  assert(!JSON.stringify(value).match(/PRIVATE|SECRET|data:image|data:application|blob:https|token=|\/private\//));
}

test('real canvas failure reaches Sentry with geometry, 73-page cache counts and the existing fingerprint', async () => {
  const h = harness();
  let cacheReads = 0;
  const pages = Array.from({ length: 73 }, () => ({
    originalDataUrl: 'data:image/jpeg;base64,PRIVATE_ORIGINAL',
    displayDataUrl: 'data:image/jpeg;base64,PRIVATE_DARK',
    byTheme: { midnight: 'data:image/jpeg;base64,PRIVATE_DARK' },
  }));
  const expectedCache = h.summarizeImageCache(pages, 100);
  const diagnostic = {
    invertStep: 'encode_page', pageNumber: 74, totalPages: 100,
    pageWidth: 1224, pageHeight: 1584, baseWidth: 612, baseHeight: 792,
    renderScale: 2, renderScaleLimited: false, imageRegionCount: 0, inputBytes: 2_000_000,
    getCacheSnapshot() {
      cacheReads++;
      return {
        ...h.summarizeImageCache(pages, 100),
        get filename() { assert.fail('Unallowlisted filename getter must not be read'); },
        source: 'data:application/pdf;base64,PRIVATE_SECRET',
      };
    },
    filename: 'PRIVATE.pdf', source: 'blob:https://pdfdark.org/PRIVATE',
  };
  const retained = new Blob(['jpeg'], { type: 'image/jpeg' });
  assert.equal(await h.canvasToJpegBlob({ width: 1, height: 1, toBlob(callback) { callback(retained); } }, 0.88), retained);
  assert.equal(cacheReads, 0);
  assert.equal(h.events.length, 0);
  const original = await rejection(h.canvasToJpegBlob(emptyCanvas(), 0.88));
  assert.equal(cacheReads, 0, 'Encoding must not scan retained pages');
  assert.equal(original.message, 'JPEG encoding failed');
  h.capturePdfProcessingException(original, 'export', { tool: 'invert' }, diagnostic);
  assert.equal(cacheReads, 1);
  assert.equal(h.events.length, 1);
  const [safe, scope] = h.events[0];
  assert.equal(scope.tags.pdf_diagnostic_version, '3');
  assert.equal(scope.tags.original_error_reason, 'page_encoding_failed');
  assert.equal(scope.tags.encoding_failure_kind, 'empty_data_url_sentinel');
  assert.equal(scope.contexts.pdf_encoding.api, 'blob');
  assert.equal(scope.contexts.pdf_encoding.phase, 'validate_data_url');
  assert.equal(scope.contexts.pdf_encoding.to_blob_result, 'null');
  assert.equal(scope.contexts.pdf_encoding.canvas_start_pixels, 1_938_816);
  assert.deepEqual(scope.fingerprint, ['pdf-processing', 'invert', 'export', 'encode_page', 'Error']);
  assert.deepEqual(scope.contexts.pdf_failure, {
    page_number: 74, width: 1224, height: 1584, total_pages: 100, input_bytes: 2_000_000,
    image_region_count: 0, base_width: 612, base_height: 792, render_scale: 2, render_scale_limited: false,
  });
  assert.deepEqual(scope.contexts.pdf_cache, { ...expectedCache, cache_snapshot_status: 'captured' });
  assert.equal(safe.message, 'PDF processing failed');
  assertPrivate([safe.message, safe.stack, scope]);
});

test('real frozen file read errors keep identity, classify NotFound/NotReadable, and omit file names/paths', async () => {
  for (const [name, reason] of [['NotFoundError', 'not_found'], ['NotReadableError', 'not_readable']]) {
    const h = harness();
    const original = Object.freeze(new DOMException('PRIVATE /private/SECRET.pdf', name));
    let reads = 0, sizeReads = 0;
    const file = {
      get size() { sizeReads++; return 349_006; },
      type: 'application/pdf', lastModified: 1_798_848_000_000 - 2 * 86_400_000,
      get name() { assert.fail('File name must not be read'); },
      get webkitRelativePath() { assert.fail('Private path must not be read'); },
      async arrayBuffer() { reads++; throw original; },
    };
    h.markPdfFileSource(file, 'picker');
    assert.equal(await rejection(h.readPdfFile(file)), original);
    assert.equal(reads, 1);
    assert.equal(sizeReads, 2);
    assert.equal(h.events.length, 0, 'The native helper must not report independently');
    h.capturePdfProcessingException(original, 'read', { tool: 'reader' }, { readerStep: 'read_file' });
    assert.equal(h.events.length, 1);
    const [safe, scope] = h.events[0];
    assert.equal(scope.tags.original_error_reason, `file_read_${reason}`);
    assert.equal(scope.tags.original_error_type, name);
    assert.equal(scope.tags.file_selection_source, 'picker');
    assert.equal(scope.contexts.pdf_file_read.error_kind, reason);
    assert.equal(scope.contexts.pdf_file_read.selection_source, 'picker');
    assert.equal(scope.contexts.pdf_file_read.file_bytes, 349_006);
    assert.equal(scope.contexts.pdf_file_read.file_type, 'pdf');
    assert.equal(scope.contexts.pdf_file_read.last_modified_age, 'under_30d');
    assert.equal(scope.contexts.pdf_file_read.metadata_changed, false);
    assert.deepEqual(scope.fingerprint, ['pdf-processing', 'reader', 'read', 'read_file', name]);
    assert.equal(original.name, name);
    assert.equal(original.message, 'PRIVATE /private/SECRET.pdf');
    assertPrivate([safe.message, safe.stack, scope]);
  }
});

test('real background diagnostics distinguish active and cancelled late failures on the original objects', () => {
  const h = harness();
  const active = h.createBackgroundWorkerDiagnostics({ pageNumber: 9, mode: 'preview' });
  active.created();
  active.request(1, 600, 800, { strength: 80, preserveColors: true }, 1);
  const activeError = Object.freeze(new Error("importScripts failed '/_next/static/chunks/background-worker-a123.js?token=SECRET' PRIVATE"));
  active.failed('error_event', activeError, 1, false);
  const cancelled = h.createBackgroundWorkerDiagnostics({ pageNumber: 10, mode: 'export' });
  cancelled.created();
  cancelled.request(2, 600, 800, { strength: 80, preserveColors: true }, 1);
  cancelled.dispose('cancelled', 1);
  const lateError = Object.freeze(new Error('PRIVATE worker failed to load script'));
  cancelled.failed('error_event', lateError, 0, true);
  for (const [original, isLate] of [[activeError, false], [lateError, true]]) {
    const beforeStack = original.stack;
    h.capturePdfProcessingException(original, 'export', { tool: 'background' }, { pageNumber: isLate ? 10 : 9 });
    const [safe, scope] = h.events.at(-1);
    const context = scope.contexts.pdf_background_worker;
    assert.equal(context.failure_kind, 'error_event');
    assert.equal(context.disposed_before_error, isLate);
    assert.equal(context.cancelled_before_error, isLate);
    assert.equal(context.page_number, isLate ? 10 : 9);
    assert.equal(scope.tags.original_error_reason, isLate ? 'background_worker_script_load' : 'background_worker_import_scripts');
    assert.equal(scope.tags.background_worker_failure_kind, 'error_event');
    assert.deepEqual(scope.fingerprint, ['pdf-processing', 'background', 'export', 'unknown', 'Error']);
    assert.equal(original.stack, beforeStack);
    assert.equal(h.getBackgroundWorkerFailure(original).worker_id, context.worker_id);
    assertPrivate([safe.message, safe.stack, scope]);
  }
  assert.notEqual(h.events[0][1].contexts.pdf_background_worker.worker_id, h.events[1][1].contexts.pdf_background_worker.worker_id);
  assert.equal(h.events[0][1].contexts.pdf_background_worker.imported_script_path, '/_next/static/chunks/background-worker-a123.js');
  assertPrivate(h.breadcrumbs);
});

test('throwing or hostile cache providers keep Sentry reporting and explicit incomplete counters', async () => {
  for (const provider of [
    () => { throw Error('PRIVATE cache unavailable'); },
    () => ({
      total_pages: 100, cached_pages: 73,
      get cached_original_chars() { throw Error('PRIVATE getter'); },
      filename: 'PRIVATE.pdf', url: 'data:image/jpeg;base64,SECRET',
    }),
  ]) {
    const h = harness();
    const original = await rejection(h.canvasToJpegBlob(emptyCanvas(), 0.88));
    let calls = 0;
    h.capturePdfProcessingException(original, 'export', { tool: 'invert' }, {
      invertStep: 'encode_page', imageRegionCount: 0,
      getCacheSnapshot() { calls++; return provider(); },
    });
    assert.equal(calls, 1);
    assert.equal(h.events.length, 1);
    const [safe, scope] = h.events[0];
    assert.equal(scope.contexts.pdf_failure.image_region_count, 0);
    assert.equal(scope.contexts.pdf_cache.cache_incomplete, true);
    assert(['captured', 'unavailable'].includes(scope.contexts.pdf_cache.cache_snapshot_status));
    assert.equal(scope.tags.encoding_failure_kind, 'empty_data_url_sentinel');
    assertPrivate([safe.message, safe.stack, scope]);
  }
});

test('actual Sentry event builder retains sanitized native script frames for a real canvas failure', async () => {
  const h = harness();
  const original = await rejection(h.canvasToJpegBlob(emptyCanvas(), 0.88));
  const nativeStack = [
    'Error: JPEG encoding failed',
    '    at PRIVATE_FUNCTION (https://pdfdark.org/_next/static/chunks/main-thread-a123.js?token=SECRET#PRIVATE:153:26)',
    'encode@https://pdfdark.org/_next/static/chunks/invert-b456.js:297:11',
    '    at document (data:application/pdf;base64,PRIVATE:1:2)',
    '    at document (blob:https://pdfdark.org/PRIVATE:1:2)',
  ].join('\n');
  original.stack = nativeStack;
  h.capturePdfProcessingException(original, 'export', { tool: 'invert' }, { invertStep: 'encode_page' });
  const [safe, scope] = h.events[0];
  const event = await eventFromException(defaultStackParser, safe);
  const frames = event.exception.values[0].stacktrace.frames;
  assert(frames.some(frame => frame.filename === 'https://pdfdark.org/_next/static/chunks/main-thread-a123.js' && frame.lineno === 153 && frame.colno === 26));
  assert(frames.some(frame => frame.filename === 'https://pdfdark.org/_next/static/chunks/invert-b456.js' && frame.lineno === 297 && frame.colno === 11));
  assert.equal(scope.tags.original_stack_status, 'captured');
  assert.equal(scope.contexts.pdf_exception.original_code_frames, 2);
  assert.equal(scope.contexts.pdf_exception.original_stack_format, 'mixed');
  assert.equal(scope.contexts.pdf_encoding.failure_kind, 'empty_data_url_sentinel');
  assert.equal(original.stack, nativeStack);
  assertPrivate([event, scope]);
});
