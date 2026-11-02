import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function harness(options = {}) {
  const workers = [], fallbackCalls = [];
  class WorkerHarness {
    messages = [];
    terminateCalls = 0;
    constructor(url, init) {
      if (options.constructorError) throw options.constructorError;
      this.url = url; this.init = init; workers.push(this);
    }
    postMessage(message, transfer) {
      if (options.postError) throw options.postError;
      this.messages.push({ message, transfer });
    }
    terminate() { this.terminateCalls++; }
    complete(id, result) { this.onmessage({ data: { id, result } }); }
  }
  const fallbackResult = { angle: 0, status: 'uncertain', reason: 'fixture' };
  const imports = {
    './pdf-file-read-diagnostics': {},
    './deskew': { detectDeskew(...args) { fallbackCalls.push(args); return fallbackResult; } },
    './monochrome-pdf': {},
    './main-thread': { yieldToMain: () => Promise.resolve() },
  };
  const source = fs.readFileSync(new URL('../lib/deskew-pdf.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.url', '"https://pdfdark.org/lib/deskew-pdf.ts"');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', 'Worker', code)(name => {
    assert(name in imports, `Unexpected dependency ${name}`); return imports[name];
  }, exports, WorkerHarness);
  return { ...exports, workers, fallbackCalls, fallbackResult };
}

const pixels = () => new Uint8ClampedArray([100, 120, 140, 255]);
const failureMessage = 'Page analysis could not start. Reload and try again.';

test('analysis keeps one worker, transfer identity and independent response IDs', async () => {
  const h = harness(), processor = h.createDeskewProcessor();
  const input = pixels(), first = processor.process(input, 1, 1);
  const second = processor.process(pixels(), 2, 3);
  const worker = h.workers[0];
  assert.equal(h.workers.length, 1); assert.equal(worker.init.type, 'module');
  assert.strictEqual(worker.messages[0].message.buffer, input.buffer);
  assert.strictEqual(worker.messages[0].transfer[0], input.buffer);
  const resultA = { angle: -3 }, resultB = { angle: 2 };
  worker.complete(worker.messages[1].message.id, resultB);
  assert.strictEqual(await second, resultB);
  worker.complete(worker.messages[0].message.id, resultA);
  assert.strictEqual(await first, resultA);
  processor.dispose('completed');
  assert.equal(worker.terminateCalls, 1); assert.equal(h.fallbackCalls.length, 0);
});

test('legacy cancellation settles all tasks and suppresses only that old worker error', async () => {
  const h = harness(), old = h.createDeskewProcessor();
  const first = assert.rejects(old.process(pixels(), 1, 1), { name: 'AbortError', message: 'Analysis cancelled' });
  const second = assert.rejects(old.process(pixels(), 1, 1), { name: 'AbortError' });
  old.dispose(); await Promise.all([first, second]);
  old.dispose('completed');
  const active = h.createDeskewProcessor(), current = active.process(pixels(), 1, 1);
  let settled = false; current.then(() => { settled = true; });
  for (let i = 0; i < 2; i++) {
    const event = new Event('error', { cancelable: true });
    h.workers[0].onerror(event); assert.equal(event.defaultPrevented, true);
  }
  h.workers[0].complete(1, { angle: -9 });
  await Promise.resolve(); assert.equal(settled, false);
  h.workers[1].complete(1, { angle: 4 }); assert.equal((await current).angle, 4);
  assert.equal(h.workers[0].terminateCalls, 1);
  active.dispose('completed');
});

test('cancelling another processor never suppresses an active analysis failure', async () => {
  const h = harness(), old = h.createDeskewProcessor(); old.dispose('cancelled');
  const active = h.createDeskewProcessor();
  const rejected = assert.rejects(active.process(pixels(), 1, 1), { message: failureMessage });
  const event = new Event('error', { cancelable: true });
  h.workers[1].onerror(event); await rejected;
  assert.equal(event.defaultPrevented, false);
  assert.equal(h.workers[1].terminateCalls, 1);
});

test('completed or failed analysis cannot later become cancellation suppression', async () => {
  for (const reason of ['completed', 'worker_error']) {
    const h = harness(), processor = h.createDeskewProcessor(), worker = h.workers[0];
    const request = processor.process(pixels(), 1, 1);
    if (reason === 'completed') {
      worker.complete(1, { angle: 0 }); await request; processor.dispose('completed');
    } else {
      const rejected = assert.rejects(request, { message: failureMessage });
      const original = new Event('error', { cancelable: true });
      worker.onerror(original); await rejected; assert.equal(original.defaultPrevented, false);
      processor.dispose('completed');
    }
    processor.dispose('cancelled');
    const late = new Event('error', { cancelable: true });
    worker.onerror(late); assert.equal(late.defaultPrevented, false, reason);
  }
});

test('non-standard late events cannot throw new cancellation errors', () => {
  for (const event of [
    {}, { preventDefault() { throw Error('PRIVATE'); } },
    { get preventDefault() { throw Error('PRIVATE'); } },
  ]) {
    const h = harness(), processor = h.createDeskewProcessor(); processor.dispose('cancelled');
    assert.doesNotThrow(() => h.workers[0].onerror(event));
    assert.equal(h.workers[0].terminateCalls, 1);
  }
});

test('postMessage failures preserve their original identity and reportability', async () => {
  const original = new DOMException('fixture', 'DataCloneError');
  const h = harness({ postError: original }), processor = h.createDeskewProcessor();
  await assert.rejects(processor.process(pixels(), 1, 1), error => error === original);
  const event = new Event('error', { cancelable: true }); h.workers[0].onerror(event);
  assert.equal(event.defaultPrevented, false);
});

test('constructor failure and disposed processors retain the existing main-thread fallback', async () => {
  const unavailable = harness({ constructorError: Error('worker unavailable') });
  assert.strictEqual(await unavailable.createDeskewProcessor().process(pixels(), 1, 1), unavailable.fallbackResult);
  assert.equal(unavailable.fallbackCalls.length, 1);
  const h = harness(), processor = h.createDeskewProcessor(); processor.dispose();
  const input = pixels();
  assert.strictEqual(await processor.process(input, 2, 3), h.fallbackResult);
  assert.strictEqual(h.fallbackCalls[0][0], input);
  assert.deepEqual(h.fallbackCalls[0].slice(1), [2, 3]);
  assert.equal(h.workers[0].messages.length, 0);
});
