import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { diagnosticTestImports } from './helpers/diagnostic-test-imports.mjs';

function compile(file, imports = {}, globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true,
  });
  assert.equal(output.diagnostics.length, 0);
  const exports = {};
  const dependencies = { ...diagnosticTestImports, ...imports };
  new Function('require', 'exports', ...Object.keys(globals), output.outputText)(name => {
    assert(name in dependencies, `Unexpected dependency ${name}`);
    return dependencies[name];
  }, exports, ...Object.values(globals));
  return exports;
}
const helpers = compile('../lib/pdf-original-error-diagnostics.ts');
const resources = compile('../lib/pdf-image-resource-diagnostics.ts');
const worker = compile('../lib/dark-worker-diagnostics.ts');
const page = { pageNumber: 104, width: 892, height: 1262, imageRegionCount: 0 };
const image = 'data:image/jpeg;base64,QUJDRA==';

function harness(globals = {}, helperOverrides = helpers) {
  const sentry = [], pulse = [], logs = [];
  const bitmap = { close() {} };
  const diagnostics = compile('../lib/pdf-image-diagnostics.ts', {
    './pdf-original-error-diagnostics': helperOverrides,
    './pdf-image-resource-diagnostics': resources,
    './dark-worker-diagnostics': worker,
    './pulse-error-monitoring': { capturePulseException: (...args) => pulse.push(args) },
    '@sentry/nextjs': { captureException: (...args) => sentry.push(args) },
  }, {
    fetch: () => Promise.resolve(new Response(new Uint8Array([1, 2, 3]), { status: 200 })),
    createImageBitmap: () => Promise.resolve(bitmap),
    document: { visibilityState: 'visible', hasFocus: () => true }, navigator: { onLine: true },
    console: { error: (...args) => logs.push(args) }, ...globals,
  });
  return { ...diagnostics, sentry, pulse, logs, bitmap };
}

for (const [message, kind] of [['Load failed', 'load_failed'], ['Failed to fetch', 'failed_to_fetch'], ['Out of memory', 'out_of_memory_text']]) {
  test(`the full fixed native message ${JSON.stringify(message)} survives as a symptom, without guessing its cause`, () => {
    const error = new TypeError(message);
    const result = helpers.summarizeOriginalError(error);
    assert.equal(result.message, message);
    assert.equal(result.message_kind, kind);
    assert.equal(result.message_status, 'recognized');
    assert.equal(result.message_length, message.length);
    assert.equal(result.name, 'TypeError');
  });
}

test('unknown, prefixed, suffixed, whitespace and very long messages never expose their content', () => {
  for (const message of ['Load failed PRIVATE.pdf', 'PRIVATE: Failed to fetch', ' Load failed', 'Load failed ', 'x'.repeat(1024 * 1024) + 'SECRET', 'data:image/jpeg;base64,PRIVATE', 'blob:https://pdfdark.org/SECRET']) {
    const result = helpers.summarizeOriginalError({ name: 'PRIVATE.pdf', message, code: 'ERR_PRIVATE' });
    assert.equal(result.name, 'Other');
    assert.equal(result.message_status, 'unrecognized');
    assert.equal(result.message_length, message.length);
    assert.equal(result.message, undefined);
    assert.equal(result.message_kind, undefined);
    assert.equal(result.code, undefined);
    assert(!/PRIVATE|SECRET|\.pdf|data:|blob:/.test(JSON.stringify(result)));
  }
});

test('numeric code0 and finite signed/unsigned32 codes survive; strings, fractions and invalid numbers do not', () => {
  for (const code of [0, 22, -1, -2147483648, 4294967295]) assert.equal(helpers.summarizeOriginalError({ code }).code, code);
  for (const code of ['ERR_SECRET', '22', NaN, Infinity, -Infinity, 0.5, 4294967296, -2147483649]) {
    const result = helpers.summarizeOriginalError({ code });
    assert.equal(result.code, undefined);
    assert.equal(result.code_status, 'unsupported');
  }
});

test('cause summaries stop at two levels, remain flat and retain no Error object', () => {
  const third = { message: 'THIRD_PRIVATE' };
  const second = { name: 'SecurityError', message: 'The operation is insecure.', code: 18, cause: third };
  const first = { name: 'TypeError', message: 'Failed to fetch', code: 0, cause: second };
  const root = { name: 'Error', message: 'PRIVATE file.pdf', cause: first };
  const result = helpers.summarizeOriginalError(root);
  assert.equal(result.cause_depth, 2);
  assert.equal(result.cause_status, 'depth_limit');
  assert.equal(result.cause_1_message, 'Failed to fetch');
  assert.equal(result.cause_1_code, 0);
  assert.equal(result.cause_2_name, 'SecurityError');
  assert.equal(result.cause_2_code, 18);
  assert(Object.values(result).every(value => ['string', 'number', 'boolean'].includes(typeof value)));
  assert(Object.keys(result).length <= 30);
  assert(!/PRIVATE|THIRD/.test(JSON.stringify(result)));
  assert.equal(root.cause, first);
  assert.equal(first.cause, second);
  assert.equal(second.cause, third);
});

test('cycles, primitive causes, revoked proxies and throwing accessors stay bounded and cannot throw', () => {
  const cycle = { message: 'Load failed' }; cycle.cause = cycle;
  assert.equal(helpers.summarizeOriginalError(cycle).cause_status, 'cycle');
  assert.equal(helpers.summarizeOriginalError({ cause: 'PRIVATE.pdf' }).cause_status, 'primitive');
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const error of [revoked.proxy, new Proxy({}, { get() { throw Error('PRIVATE'); } }), null, undefined, { get message() { throw Error('PRIVATE'); }, get code() { throw Error('SECRET'); }, get cause() { throw Error('PRIVATE'); } }]) {
    let result;
    assert.doesNotThrow(() => { result = helpers.summarizeOriginalError(error); });
    assert(!/PRIVATE|SECRET/.test(JSON.stringify(result)));
  }
});

test('source sampling is capped, complete only for small inputs, and does not decode or retain image data', () => {
  const small = helpers.summarizeImageInput(image);
  assert.equal(small.scan_coverage, 'complete');
  assert.equal(small.scanned_chars, 8);
  assert.equal(small.padding_kind, 'two');
  assert.equal(small.sample_characters_valid, true);
  const source = 'data:image/jpeg;base64,' + 'A'.repeat(1024 * 1024) + '==';
  const original = String.prototype.charCodeAt;
  let reads = 0;
  String.prototype.charCodeAt = function(index) { reads++; return original.call(this, index); };
  let result;
  try { result = helpers.summarizeImageInput(source); } finally { String.prototype.charCodeAt = original; }
  assert.equal(reads, 4096);
  assert.equal(result.scanned_chars, 4096);
  assert.equal(result.scan_coverage, 'edges_only');
  assert.equal(result.input_length, source.length);
  assert(!JSON.stringify(result).includes('data:'));
  assert(!Object.keys(result).some(key => /base64|data_url|body|headers/.test(key)));
  assert.equal(helpers.summarizeImageInput('data:image/png;base64,QUJ=RA==').sample_characters_valid, false);
});

test('unrecognized source headers and throwing Blob fields never expose content or affect decoding', () => {
  for (const source of ['data:image/jpeg;name=PRIVATE.pdf;base64,SECRET', 'data:' + 'PRIVATE'.repeat(10000), 'blob:https://pdfdark.org/SECRET', 'https://user:SECRET@example.com/PRIVATE.pdf']) {
    const result = helpers.summarizeImageInput(source);
    assert(!/PRIVATE|SECRET|https:|data:|blob:/.test(JSON.stringify(result)));
    assert.equal(result.scan_coverage, 'not_applicable');
  }
  const result = helpers.summarizeImageInput({ get size() { throw Error('PRIVATE'); }, get type() { throw Error('SECRET'); } });
  assert.equal(result.input_kind, 'blob');
  assert.equal(result.input_length, undefined);
});

test('response summary reads a real Response without consuming its body and rejects arbitrary lookalikes', () => {
  const response = new Response('PRIVATE', { status: 200, headers: { 'x-private': 'SECRET' } });
  assert.deepEqual(helpers.summarizeImageResponse(response), { response_received: true, response_metadata_status: 'available', response_status: 200, response_type: 'default', response_consumed: false });
  assert.equal(response.bodyUsed, false);
  assert.deepEqual(helpers.summarizeImageResponse({ status: 200, type: 'PRIVATE', bodyUsed: true }), { response_received: true, response_metadata_status: 'not_native' });
});

for (const sync of [true, false]) {
  test(`fetch ${sync ? 'synchronous throw' : 'Promise rejection'} has a distinct phase and preserves the original Error`, async () => {
    const error = Object.assign(new TypeError('Load failed'), { code: 0, cause: new DOMException('The operation is insecure.', 'SecurityError') });
    const h = harness({ fetch: sync ? () => { throw error; } : () => Promise.reject(error) });
    let checks = 0;
    await assert.rejects(h.loadPageBitmap(image, page, () => { checks++; }), actual => actual === error);
    assert.equal(checks, 2, 'original entry check + catch cancellation check');
    h.capturePdfProcessingException(error, 'read', { tool: 'reader' });
    assert.equal(h.sentry.length, 1); assert.equal(h.pulse.length, 1);
    assert.strictEqual(h.sentry[0][1], h.pulse[0][1]);
    const scope = h.sentry[0][1];
    assert.equal(scope.contexts.pdf_image_read.failure_phase, sync ? 'fetch_call_threw' : 'fetch_promise_rejected');
    assert.equal(scope.contexts.pdf_image_read.task_state, 'active_at_failure');
    assert.equal(scope.contexts.pdf_image_read.response_received, false);
    assert.equal(scope.contexts.pdf_original_error.code, 0);
    assert.equal(scope.contexts.pdf_exception.version, 4);
    assert.equal(scope.tags.pdf_diagnostic_version, '4');
    assert.equal(scope.contexts.pdf_original_error.message, 'Load failed');
  });
}

for (const sync of [true, false]) {
  test(`response Blob ${sync ? 'synchronous throw' : 'Promise rejection'} has a distinct phase and no response content`, async () => {
    const error = new TypeError('PRIVATE image content');
    const response = new Response('PRIVATE', { status: 200, headers: { 'x-private': 'SECRET' } });
    Object.defineProperty(response, 'blob', { value: sync ? function() { assert.equal(this, response); throw error; } : function() { assert.equal(this, response); return Promise.reject(error); } });
    const h = harness({ fetch: () => Promise.resolve(response) });
    let checks = 0;
    await assert.rejects(h.loadPageBitmap(image, page, () => { checks++; }), actual => actual === error);
    assert.equal(checks, 3, 'entry, after fetch and catch checks only');
    h.capturePdfProcessingException(error, 'read');
    const context = h.sentry[0][1].contexts.pdf_image_read;
    assert.equal(context.failure_phase, sync ? 'blob_call_threw' : 'blob_promise_rejected');
    assert.equal(context.response_received, true);
    assert.equal(context.response_status, 200);
    assert.equal(context.response_consumed, false);
    assert(!/PRIVATE|SECRET/.test(JSON.stringify(h.sentry)));
  });
}

for (const sync of [true, false]) {
  test(`bitmap ${sync ? 'synchronous throw' : 'Promise rejection'} preserves classification and original rejection`, async () => {
    const error = new DOMException('The source image could not be decoded.', 'InvalidStateError');
    const h = harness({ createImageBitmap: sync ? () => { throw error; } : () => Promise.reject(error) });
    let checks = 0;
    await assert.rejects(h.loadPageBitmap(image, page, () => { checks++; }), actual => actual === error);
    assert.equal(checks, 4, 'entry, after fetch, before decode, catch');
    h.capturePdfProcessingException(error, 'read');
    const scope = h.sentry[0][1];
    assert.equal(scope.contexts.pdf_image_read.failure_phase, sync ? 'bitmap_call_threw' : 'bitmap_promise_rejected');
    assert.equal(scope.contexts.pdf_image_read.response_consumed, true);
    assert.equal(scope.tags.image_error_hint, 'invalid_state');
  });
}

test('successful string reads preserve this, call order, checks, single awaits and bitmap identity without diagnostic work', async () => {
  const order = [], response = new Response('JPEG');
  const bitmap = { close() { assert.fail('successful bitmap must remain open'); } };
  Object.defineProperty(response, 'blob', { value: function() {
    assert.equal(this, response); order.push('blob');
    return { then(resolve) { order.push('blob.await'); resolve(new Blob(['JPEG'])); } };
  } });
  const never = () => assert.fail('success must not run diagnostic probes');
  const h = harness({
    fetch() { order.push('fetch'); return { then(resolve) { order.push('fetch.await'); resolve(response); } }; },
    createImageBitmap() { order.push('bitmap'); return { then(resolve) { order.push('bitmap.await'); resolve(bitmap); } }; },
  }, { summarizeOriginalError: never, summarizeImageInput: never, summarizeImageResponse: never });
  assert.strictEqual(await h.loadPageBitmap(image, page, () => order.push('check'), never), bitmap);
  assert.deepEqual(order, ['check', 'fetch', 'fetch.await', 'check', 'blob', 'blob.await', 'check', 'bitmap', 'bitmap.await', 'check']);
  assert.equal(h.logs.length, 0); assert.equal(h.sentry.length, 0); assert.equal(h.pulse.length, 0);
});

test('cancellation after allocation closes the bitmap, preserves cancellation identity and skips every new probe', async () => {
  const abort = new DOMException('cancelled', 'AbortError');
  let closed = 0, checks = 0;
  const never = () => assert.fail('cancelled tasks must not run diagnostics');
  const h = harness({ createImageBitmap: () => Promise.resolve({ close() { closed++; } }) }, { summarizeOriginalError: never, summarizeImageInput: never, summarizeImageResponse: never });
  await assert.rejects(h.loadPageBitmap(image, page, () => { if (++checks >= 4) throw abort; }, never), error => error === abort);
  assert.equal(checks, 5); assert.equal(closed, 1);
  assert.equal(h.logs.length, 0); assert.equal(h.sentry.length, 0); assert.equal(h.pulse.length, 0);
});

test('non-image PDF failures get the original summary without an invented image phase', () => {
  const h = harness();
  const error = new Error('PRIVATE parser content');
  h.capturePdfProcessingException(error, 'export', { tool: 'deskew' });
  assert.equal(h.sentry[0][1].contexts.pdf_original_error.message_status, 'unrecognized');
  assert.equal(h.sentry[0][1].contexts.pdf_image_read, undefined);
  assert(!/PRIVATE/.test(JSON.stringify(h.sentry)));
});


test('an unexpected new probe failure preserves legacy image diagnostics and both error reports', async () => {
  const error = new TypeError('Load failed');
  const h = harness({ fetch: () => Promise.reject(error) }, {
    ...helpers,
    summarizeImageInput() { throw Error('PRIVATE diagnostic bug'); },
    summarizeOriginalError() { throw Error('SECRET diagnostic bug'); },
  });
  await assert.rejects(h.loadPageBitmap(image, page, () => {}), actual => actual === error);
  assert.equal(h.logs.length, 1);
  h.capturePdfProcessingException(error, 'read');
  assert.equal(h.sentry.length, 1); assert.equal(h.pulse.length, 1);
  const scope = h.sentry[0][1];
  assert.equal(scope.contexts.pdf_image_processing.step, 'fetch_image_data');
  assert.equal(scope.contexts.pdf_original_error.summary_status, 'unavailable');
  assert(!/PRIVATE|SECRET/.test(JSON.stringify(h.sentry)));
});


test('a fulfilled fetch is distinguished from readable native Response metadata without inspecting lookalike getters', async () => {
  const error = new TypeError('Load failed');
  const response = {
    get status() { assert.fail('arbitrary response metadata must not be read'); },
    get type() { assert.fail('arbitrary response metadata must not be read'); },
    get bodyUsed() { assert.fail('arbitrary response metadata must not be read'); },
    blob() { throw error; },
  };
  const h = harness({ fetch: () => Promise.resolve(response) });
  await assert.rejects(h.loadPageBitmap(image, page, () => {}), actual => actual === error);
  h.capturePdfProcessingException(error, 'read');
  const context = h.sentry[0][1].contexts.pdf_image_read;
  assert.equal(context.failure_phase, 'blob_call_threw');
  assert.equal(context.response_received, true);
  assert.equal(context.response_metadata_status, 'not_native');
  assert.equal(context.response_status, undefined);
  assert.deepEqual(helpers.summarizeImageResponse(undefined, true), { response_received: true, response_metadata_status: 'not_native' });
});
