import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function compile(file, imports = {}, globals = {}) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8')
    .replaceAll('import.meta.url', '"https://pdfdark.org/lib/background-pdf.ts"');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', ...Object.keys(globals), code)((name) => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports, ...Object.values(globals));
  return exports;
}
const settings = { strength: 65, preserveColors: true };
const pixels = () => new Uint8ClampedArray([100, 120, 140, 255]);

function harness(options = {}) {
  const crumbs = [], workers = [];
  let tick = 1700000000000;
  const diagnostics = compile('../lib/background-worker-diagnostics.ts', {
    '@sentry/nextjs': options.sentry ?? { addBreadcrumb: crumb => crumbs.push(crumb) },
  }, {
    location: options.location ?? { origin: 'https://pdfdark.org' },
    navigator: options.navigator ?? { onLine: false },
    document: options.document ?? { visibilityState: 'hidden' },
    Date: { now() { if (options.brokenClock) throw Error('clock unavailable'); return tick++; } },
  });
  class WorkerHarness {
    messages = [];
    terminateCalls = 0;
    constructor(url, init) {
      if (options.constructorError) throw options.constructorError;
      this.url = url; this.init = init;
      workers.push(this);
    }
    postMessage(message, transfer) {
      if (options.postError) throw options.postError;
      if (options.cloneRequest) structuredClone(message);
      this.messages.push({ message, transfer });
    }
    terminate() { this.terminateCalls++; }
    complete(id, buffer) { this.onmessage({ data: { id, buffer } }); }
  }
  const processor = compile('../lib/background-pdf.ts', {
    './monochrome-pdf': { checkCancelled() {} },
    './main-thread': { yieldToMain() {} },
    './deskew-pdf': {},
    './background-worker-diagnostics': diagnostics,
  }, { Worker: WorkerHarness });
  return { ...processor, ...diagnostics, workers, crumbs };
}

test('normal processing retains transfer, settings and result buffer identities', async () => {
  const h = harness();
  const processor = h.createBackgroundProcessor({ pageNumber: 7, mode: 'preview' });
  const input = pixels();
  const pending = processor.process(input, 1, 1, settings);
  const worker = h.workers[0];
  assert.equal(worker.init.type, 'module');
  assert.strictEqual(worker.messages[0].message.buffer, input.buffer);
  assert.strictEqual(worker.messages[0].transfer[0], input.buffer);
  assert.strictEqual(worker.messages[0].message.settings, settings);
  assert.deepEqual(Object.keys(worker.messages[0].message).sort(), ['buffer', 'height', 'id', 'settings', 'width']);
  const result = pixels();
  worker.complete(1, result.buffer);
  assert.strictEqual((await pending).buffer, result.buffer);
  processor.dispose('completed');
  assert.equal(worker.terminateCalls, 1);
  assert.deepEqual(h.getRecentBackgroundWorkerFailures(), []);
  assert.deepEqual(h.crumbs.map(crumb => crumb.message), ['background.created', 'background.request', 'background.disposed']);
  const last = h.crumbs.at(-1).data;
  assert.equal(last.page_number, 7); assert.equal(last.mode, 'preview');
  assert.equal(last.width, 1); assert.equal(last.height, 1);
  assert.equal(last.strength, 65); assert.equal(last.preserve_colors, true);
  assert.equal(last.pending_count, 0); assert.equal(last.cancelled_before_error, false);
  assert.equal(last.online, false); assert.equal(last.visibility, 'hidden');
  for (const field of ['created_at_ms', 'first_request_at_ms', 'last_request_at_ms', 'response_at_ms', 'disposed_at_ms', 'elapsed_ms', 'first_request_elapsed_ms', 'response_elapsed_ms', 'disposed_elapsed_ms']) assert.equal(typeof last[field], 'number', field);
});

test('active error associates the event, its original error and each existing rejection', async () => {
  const h = harness();
  const processor = h.createBackgroundProcessor({ pageNumber: 9, mode: 'export' });
  const first = processor.process(pixels(), 1, 1, settings);
  const second = processor.process(pixels(), 2, 3, { strength: 80, preserveColors: false }, { pageNumber: 10 });
  let firstError, secondError;
  const rejects = [
    assert.rejects(first, error => { firstError = error; return error.message === 'Background cleaning could not start. Reload or try another browser.'; }),
    assert.rejects(second, error => { secondError = error; return error.message === 'Background cleaning could not start. Reload or try another browser.'; }),
  ];
  const original = new TypeError("Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'https://u:SECRET@pdfdark.org/_next/static/chunks/abc-123.js?token=SECRET#PRIVATE' failed to load.");
  let prevented = false;
  const event = { error: original, filename: 'https://pdfdark.org/_next/static/chunks/worker-123.js?PRIVATE#SECRET', preventDefault() { prevented = true; } };
  assert.equal(h.workers[0].onerror(event), undefined);
  await Promise.all(rejects);
  assert.equal(prevented, false);
  assert.notStrictEqual(firstError, secondError);
  const context = h.getBackgroundWorkerFailure(firstError);
  assert.equal(context.failure_kind, 'error_event');
  assert.equal(context.error_type, 'TypeError'); assert.equal(context.error_hint, 'import_scripts');
  assert.equal(context.pending_count, 2); assert.equal(context.disposed_before_error, false);
  assert.equal(context.disposed, false);
  assert.equal(context.cancelled_before_error, false); assert.equal(context.page_number, 9);
  assert.equal(context.request_id, 1); assert.equal(context.width, 1);
  const secondContext = h.getBackgroundWorkerFailure(secondError);
  assert.equal(secondContext.page_number, 10); assert.equal(secondContext.mode, 'export');
  assert.equal(secondContext.request_id, 2); assert.equal(secondContext.width, 2);
  assert.equal(secondContext.strength, 80); assert.equal(secondContext.preserve_colors, false);
  assert.equal(context.request_elapsed_ms, context.failure_at_ms - context.request_at_ms);
  assert.equal(secondContext.request_elapsed_ms, secondContext.failure_at_ms - secondContext.request_at_ms);
  assert(context.request_elapsed_ms > secondContext.request_elapsed_ms);
  assert.equal(context.script_path, '/_next/static/chunks/worker-123.js');
  assert.equal(context.imported_script_path, '/_next/static/chunks/abc-123.js');
  assert.equal(h.getBackgroundWorkerFailure(event).worker_id, context.worker_id);
  assert.equal(h.getBackgroundWorkerFailure(original).worker_id, context.worker_id);
  assert.equal(h.workers[0].terminateCalls, 1);
  assert.equal(typeof context.failure_at_ms, 'number'); assert.equal(typeof context.failure_elapsed_ms, 'number');
  const serialized = JSON.stringify([context, secondContext, h.crumbs, h.getRecentBackgroundWorkerFailures()]);
  assert(!/SECRET|PRIVATE|token=|https:|u:|importScripts|WorkerGlobalScope/.test(serialized));
});

test('cancelled old worker late errors remain distinct from an active preview', async () => {
  const h = harness();
  const old = h.createBackgroundProcessor({ pageNumber: 1, mode: 'preview' });
  const pending = old.process(pixels(), 1, 1, settings);
  const cancelled = assert.rejects(pending, { name: 'AbortError', message: 'Cleaning cancelled' });
  old.dispose(); await cancelled;
  const active = h.createBackgroundProcessor({ pageNumber: 2, mode: 'preview' });
  let activeSettled = false;
  const current = active.process(pixels(), 2, 2, settings);
  current.then(() => { activeSettled = true; });
  const staleError = new Error('PRIVATE');
  const staleEvent = new Event('error', { cancelable: true });
  Object.defineProperty(staleEvent, 'error', { value: staleError });
  h.workers[0].onerror(staleEvent);
  assert.equal(staleEvent.defaultPrevented, true);
  const oldContext = h.getBackgroundWorkerFailure(staleError);
  assert.equal(oldContext.page_number, 1); assert.equal(oldContext.pending_count, 0);
  assert.equal(oldContext.cancelled_before_error, true); assert.equal(oldContext.disposed_before_error, true);
  assert.equal(oldContext.disposed, true);
  assert(oldContext.cancelled_at_ms < oldContext.failure_at_ms);
  assert(oldContext.disposed_at_ms < oldContext.failure_at_ms);
  assert.equal(typeof oldContext.cancelled_elapsed_ms, 'number');
  assert.equal(h.workers[0].terminateCalls, 2); // Preserve the pre-existing repeated-dispose behavior.
  await Promise.resolve(); assert.equal(activeSettled, false);
  assert.equal(h.workers[1].terminateCalls, 0);
  assert.notEqual(oldContext.worker_id, h.crumbs.findLast(crumb => crumb.message === 'background.created').data.worker_id);
  assert.equal(h.getRecentBackgroundWorkerFailures()[0].relationship, 'recent');
  h.workers[1].complete(1, pixels().buffer); await current;
  active.dispose('completed');
  await assert.rejects(old.process(pixels(), 1, 1, settings), { name: 'AbortError' });
});

test('cancellation stays authoritative across finally cleanup and repeated late errors', async () => {
  const h = harness(); const processor = h.createBackgroundProcessor();
  const request = processor.process(pixels(), 1, 1, settings);
  const cancelled = assert.rejects(request, { name: 'AbortError', message: 'Cleaning cancelled' });
  processor.dispose('cancelled'); await cancelled;
  processor.dispose('completed'); // renderPage's existing finally cleanup.
  for (let i = 0; i < 2; i++) {
    const event = new Event('error', { cancelable: true });
    h.workers[0].onerror(event);
    assert.equal(event.defaultPrevented, true);
    const context = h.getBackgroundWorkerFailure(event);
    assert.equal(context.pending_count, 0);
    assert.equal(context.disposed_before_error, true);
    assert.equal(context.cancelled_before_error, true);
  }
  assert.equal(h.workers[0].terminateCalls, 4);
  const lateResult = pixels();
  assert.doesNotThrow(() => h.workers[0].complete(1, lateResult.buffer));
  const messageError = new Event('messageerror', { cancelable: true });
  h.workers[0].onmessageerror(messageError);
  assert.equal(messageError.defaultPrevented, false);
  assert.equal(h.getBackgroundWorkerFailure(messageError).failure_kind, 'message_error');
  await assert.rejects(processor.process(pixels(), 1, 1, settings), { name: 'AbortError' });
  assert.equal(h.workers[0].messages.length, 1);
});

test('cancelling one worker does not suppress another active worker failure', async () => {
  const h = harness(); const old = h.createBackgroundProcessor();
  old.dispose('cancelled');
  const active = h.createBackgroundProcessor();
  const request = active.process(pixels(), 1, 1, settings);
  const rejected = assert.rejects(request, { message: 'Background cleaning could not start. Reload or try another browser.' });
  const event = new Event('error', { cancelable: true });
  h.workers[1].onerror(event); await rejected;
  assert.equal(event.defaultPrevented, false);
  assert.equal(h.getBackgroundWorkerFailure(event).disposed_before_error, false);
  assert.equal(h.workers[0].terminateCalls, 1);
  assert.equal(h.workers[1].terminateCalls, 1);
});

test('completed or already failed workers never become cancellation suppressions', async () => {
  for (const reason of ['completed', 'worker_error']) {
    const h = harness(); const processor = h.createBackgroundProcessor();
    const request = processor.process(pixels(), 1, 1, settings);
    if (reason === 'completed') {
      h.workers[0].complete(1, pixels().buffer); await request;
      processor.dispose('completed');
    } else {
      const rejected = assert.rejects(request, { message: 'Background cleaning could not start. Reload or try another browser.' });
      const original = new Event('error', { cancelable: true });
      h.workers[0].onerror(original); await rejected;
      assert.equal(original.defaultPrevented, false);
    }
    processor.dispose('cancelled');
    const late = new Event('error', { cancelable: true });
    h.workers[0].onerror(late);
    assert.equal(late.defaultPrevented, false, reason);
  }
});

test('missing, throwing or hostile preventDefault never creates another cancellation error', () => {
  for (const event of [
    {}, { preventDefault() { throw new Error('PRIVATE'); } },
    { get preventDefault() { throw new Error('PRIVATE'); } },
  ]) {
    const h = harness(); const processor = h.createBackgroundProcessor();
    processor.dispose('cancelled');
    assert.doesNotThrow(() => h.workers[0].onerror(event));
    assert.equal(h.getBackgroundWorkerFailure(event).disposed_before_error, true);
    assert.equal(h.workers[0].terminateCalls, 2);
  }
});

test('constructor and postMessage exceptions retain the exact original thrown identity', async () => {
  const constructorError = new DOMException('PRIVATE file.pdf', 'SecurityError');
  const h = harness({ constructorError });
  assert.throws(() => h.createBackgroundProcessor({ pageNumber: 42, mode: 'preview' }), error => error === constructorError);
  const construction = h.getBackgroundWorkerFailure(constructorError);
  assert.equal(construction.failure_kind, 'constructor'); assert.equal(construction.pending_count, 0);
  assert.equal(construction.error_type, 'SecurityError'); assert.equal(construction.page_number, 42);
  const postError = new DOMException('PRIVATE pixels', 'DataCloneError');
  const p = harness({ postError });
  const processor = p.createBackgroundProcessor({ pageNumber: 43, mode: 'export' });
  await assert.rejects(processor.process(pixels(), 1, 1, settings), error => error === postError);
  const posting = p.getBackgroundWorkerFailure(postError);
  assert.equal(posting.failure_kind, 'post_message'); assert.equal(posting.pending_count, 1);
  assert.equal(posting.error_type, 'DataCloneError'); assert.equal(posting.page_number, 43);
  assert.equal(p.workers[0].terminateCalls, 0);
  processor.dispose('completed');
  assert.equal(p.crumbs.at(-1).data.pending_count, 0);
});

test('messageerror only observes and the original request can still complete', async () => {
  const h = harness();
  const processor = h.createBackgroundProcessor();
  const pending = processor.process(pixels(), 1, 1, settings);
  let settled = false;
  pending.then(() => { settled = true; });
  let prevented = false;
  const event = { data: { private: 'PRIVATE' }, preventDefault() { prevented = true; } };
  h.workers[0].onmessageerror(event);
  await Promise.resolve();
  assert.equal(settled, false); assert.equal(prevented, false); assert.equal(h.workers[0].terminateCalls, 0);
  assert.equal(h.getBackgroundWorkerFailure(event).failure_kind, 'message_error');
  assert.equal(h.getBackgroundWorkerFailure(event).pending_count, 1);
  const output = pixels(); h.workers[0].complete(1, output.buffer);
  assert.strictEqual((await pending).buffer, output.buffer);
  processor.dispose('completed');
  assert(!JSON.stringify(h.crumbs).includes('PRIVATE'));
});

test('diagnostics do not invoke settings accessors before structured clone', async () => {
  const h = harness({ cloneRequest: true }); const processor = h.createBackgroundProcessor();
  let strengthReads = 0, preserveReads = 0;
  const accessorSettings = {
    get strength() { if (++strengthReads > 1) throw Error('PRIVATE getter read twice'); return 65; },
    get preserveColors() { if (++preserveReads > 1) throw Error('PRIVATE getter read twice'); return true; },
  };
  const current = processor.process(pixels(), 1, 1, accessorSettings);
  h.workers[0].complete(1, pixels().buffer); await current;
  assert.equal(strengthReads, 1); assert.equal(preserveReads, 1);
  assert.equal(h.crumbs.find(crumb => crumb.message === 'background.request').data.strength, undefined);
  assert.equal(h.crumbs.find(crumb => crumb.message === 'background.request').data.preserve_colors, undefined);
  assert.strictEqual(h.workers[0].messages[0].message.settings, accessorSettings);
  processor.dispose('completed');
});

for (const response of [{ error: 'PRIVATE worker error' }, {}]) {
  test(`existing ${response.error ? 'worker error' : 'missing buffer'} rejection gets scalar diagnostics`, async () => {
    const h = harness(); const processor = h.createBackgroundProcessor({ pageNumber: 6 });
    const promise = processor.process(pixels(), 1, 1, settings);
    let rejected;
    const result = assert.rejects(promise, error => { rejected = error; return error.message === (response.error ?? 'Could not clean the page.'); });
    h.workers[0].onmessage({ data: { id: 1, ...response } }); await result;
    const context = h.getBackgroundWorkerFailure(rejected);
    assert.equal(context.failure_kind, response.error ? 'response_error' : 'missing_buffer');
    assert.equal(context.pending_count, 1); assert.equal(context.request_id, 1);
    assert.equal(typeof context.response_at_ms, 'number'); assert.equal(h.workers[0].terminateCalls, 0);
    processor.dispose('completed'); assert.equal(h.crumbs.at(-1).data.pending_count, 0);
    assert(!JSON.stringify(h.crumbs).includes('PRIVATE'));
  });
}

test('strict script allowlist discards unrelated domains, local media and malformed paths', () => {
  const h = harness();
  const processor = h.createBackgroundProcessor();
  const unsafe = [
    'https://evil.example/_next/static/chunks/a.js?PRIVATE',
    'https://pdfdark.org/private-document.pdf', 'blob:https://pdfdark.org/PRIVATE',
    'data:application/javascript,PRIVATE', '/_next/static/chunks/%50RIVATE.js',
    'https://pdfdark.org/_next/static/chunks/a.js/PRIVATE',
    'https://pdfdark.org.evil.example/_next/static/chunks/a.js',
    'file:///_next/static/chunks/a.js',
  ];
  for (const path of unsafe) {
    const event = { filename: path, message: `importScripts '${path}' PRIVATE` };
    h.workers[0].onerror(event);
    const context = h.getBackgroundWorkerFailure(event);
    assert.equal(context.script_path, undefined, path);
    assert.equal(context.imported_script_path, undefined, path);
  }
  processor.dispose();
  assert.equal(h.getRecentBackgroundWorkerFailures().length, 4);
  assert(!/PRIVATE|evil|blob:|data:/.test(JSON.stringify(h.crumbs)));
});

test('same-origin Turbopack tilde hashes are retained without URL credentials or query strings', () => {
  const h = harness(); const processor = h.createBackgroundProcessor();
  const path = '/_next/static/chunks/0~j61aswh9.9d.js';
  const event = {
    filename: `https://user:SECRET@pdfdark.org${path}?PRIVATE#SECRET`,
    message: `Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'https://user:SECRET@pdfdark.org${path}?PRIVATE#SECRET' failed to load.`,
  };
  h.workers[0].onerror(event);
  const context = h.getBackgroundWorkerFailure(event);
  assert.equal(context.script_path, path);
  assert.equal(context.imported_script_path, path);
  assert.equal(context.error_hint, 'import_scripts');
  const external = { filename: `https://evil.example${path}`, message: `importScripts 'https://evil.example${path}'` };
  h.workers[0].onerror(external);
  assert.equal(h.getBackgroundWorkerFailure(external).script_path, undefined);
  assert.equal(h.getBackgroundWorkerFailure(external).imported_script_path, undefined);
  assert(!/PRIVATE|SECRET|user:|https:|evil/.test(JSON.stringify(h.crumbs)));
  processor.dispose();
});

test('same-origin loader basenames may contain consecutive dots while path constraints remain', () => {
  const h = harness(); const processor = h.createBackgroundProcessor();
  const path = '/_next/static/chunks/08fvv0ab..168.js';
  const event = { filename: `https://pdfdark.org${path}?PRIVATE#SECRET`, message: `importScripts 'https://pdfdark.org${path}?PRIVATE#SECRET'` };
  h.workers[0].onerror(event);
  assert.equal(h.getBackgroundWorkerFailure(event).script_path, path);
  assert.equal(h.getBackgroundWorkerFailure(event).imported_script_path, path);
  for (const url of [
    `https://evil.example${path}`, `ftp://pdfdark.org${path}`, `https://pdfdark.org${path}.map`,
    'https://pdfdark.org/_next/static/chunks../08fvv0ab..168.js',
    `https://pdfdark.org/_next/static/chunks/${'x'.repeat(240)}..168.js`,
  ]) {
    const denied = { filename: url, message: `importScripts '${url}'` };
    h.workers[0].onerror(denied);
    assert.equal(h.getBackgroundWorkerFailure(denied).script_path, undefined, url);
    assert.equal(h.getBackgroundWorkerFailure(denied).imported_script_path, undefined, url);
  }
  assert(!/PRIVATE|SECRET|https:|evil/.test(JSON.stringify(h.crumbs)));
  processor.dispose();
});

test('throwing probes, SDK, hostile event accessors and absent SDK do not alter processing', async () => {
  const bad = { get origin() { throw Error('PRIVATE'); } };
  for (const sentry of [{}, { addBreadcrumb() { throw Error('PRIVATE'); } }]) {
    const h = harness({ sentry, location: bad, brokenClock: true,
      navigator: { get onLine() { throw Error('PRIVATE'); } },
      document: { get visibilityState() { throw Error('PRIVATE'); } },
    });
    const processor = h.createBackgroundProcessor({ get pageNumber() { throw Error('PRIVATE'); }, get mode() { throw Error('PRIVATE'); } });
    const current = processor.process(pixels(), 1, 1, settings);
    const rejected = assert.rejects(current, { message: 'Background cleaning could not start. Reload or try another browser.' });
    const event = new Proxy({}, { get() { throw Error('PRIVATE'); } });
    assert.doesNotThrow(() => h.workers[0].onerror(event)); await rejected;
    const context = h.getBackgroundWorkerFailure(event);
    assert.equal(context.failure_kind, 'error_event'); assert.equal(context.error_type, 'ErrorEvent');
    assert.equal(context.created_at_ms, undefined); assert.equal(context.online, undefined);
    assert.equal(context.visibility, undefined); assert.equal(h.workers[0].terminateCalls, 1);
    assert.doesNotThrow(() => h.getBackgroundWorkerFailure(null));
    assert.equal(h.getBackgroundWorkerFailure('PRIVATE'), undefined);
  }
});

test('breadcrumb volume and recent failures are bounded and snapshots are defensive scalar copies', async () => {
  const h = harness(); const processor = h.createBackgroundProcessor();
  for (let i = 1; i <= 10; i++) {
    const current = processor.process(pixels(), 1, 1, settings);
    h.workers[0].complete(i, pixels().buffer); await current;
  }
  const events = [];
  for (let i = 0; i < 20; i++) { const event = {}; events.push(event); h.workers[0].onmessageerror(event); }
  processor.dispose();
  assert(h.crumbs.length <= 12);
  assert.equal(h.crumbs.filter(crumb => crumb.message === 'background.request').length, 3);
  assert.equal(h.crumbs.filter(crumb => crumb.message === 'background.failed').length, 3);
  assert.equal(h.getRecentBackgroundWorkerFailures().length, 4);
  const failure = h.getBackgroundWorkerFailure(events[0]); failure.width = 999;
  assert.equal(h.getBackgroundWorkerFailure(events[0]).width, 1);
  const recent = h.getRecentBackgroundWorkerFailures(); recent[0].width = 999; recent.push({});
  assert.equal(h.getRecentBackgroundWorkerFailures().length, 4);
  assert.equal(h.getRecentBackgroundWorkerFailures()[0].width, 1);
  for (const crumb of h.crumbs) {
    assert.equal(crumb.category, 'pdf.worker');
    for (const value of Object.values(crumb.data)) assert(['number', 'string', 'boolean'].includes(typeof value));
    assert(JSON.stringify(crumb).length < 1600);
  }
});
