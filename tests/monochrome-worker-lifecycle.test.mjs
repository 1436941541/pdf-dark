import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as monochrome from '../lib/monochrome.ts';

const source = fs.readFileSync(new URL('../lib/monochrome-pdf.ts', import.meta.url), 'utf8')
  .replaceAll('import.meta.url', '"https://pdfdark.org/lib/monochrome-pdf.ts"');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const imports = {
  './monochrome': monochrome,
  './text-layer': {},
  './main-thread': { yieldToMain: () => Promise.resolve() },
};
const exports = {};
new Function('require', 'exports', code)((name) => {
  assert(name in imports, `Unexpected dependency ${name}`);
  return imports[name];
}, exports);
const { createMonochromeProcessor } = exports;
const settings = { mode: 'black-and-white', threshold: 128 };
const pixels = () => new Uint8ClampedArray([100, 100, 100, 255]);

class WorkerHarness {
  static instances = [];
  messages = [];
  terminated = false;
  constructor() { WorkerHarness.instances.push(this); }
  postMessage(message) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  complete(id, value) {
    this.onmessage({ data: { id, buffer: new Uint8ClampedArray([value, value, value, 255]).buffer } });
  }
}

function withWorker(run) {
  return async () => {
    const previous = globalThis.Worker;
    globalThis.Worker = WorkerHarness;
    WorkerHarness.instances = [];
    try { await run(); }
    finally { globalThis.Worker = previous; }
  };
}

test('pixels start one lazy worker and concurrent responses retain their task IDs', withWorker(async () => {
  const processor = createMonochromeProcessor();
  assert.equal(WorkerHarness.instances.length, 0);
  const first = processor.process(pixels(), settings);
  const second = processor.process(pixels(), { ...settings, threshold: 190 });
  assert.equal(WorkerHarness.instances.length, 1);
  const worker = WorkerHarness.instances[0];
  const [a, b] = worker.messages;
  worker.complete(b.id, 255);
  assert.equal((await second)[0], 255);
  worker.complete(a.id, 0);
  assert.equal((await first)[0], 0);
  assert.equal(worker.terminated, false);
  processor.dispose();
}));

test('cancelling obsolete previews keeps the worker and ignores stale responses', withWorker(async () => {
  const processor = createMonochromeProcessor();
  const controller = new AbortController();
  const obsolete = processor.process(pixels(), settings, controller.signal);
  const rejected = assert.rejects(obsolete, { name: 'AbortError' });
  const worker = WorkerHarness.instances[0];
  const staleId = worker.messages[0].id;
  controller.abort();
  await rejected;
  assert.equal(worker.terminated, false);
  const active = processor.process(pixels(), { ...settings, threshold: 190 });
  assert.equal(WorkerHarness.instances.length, 1);
  let settled = false;
  active.then(() => { settled = true; });
  worker.complete(staleId, 255);
  await Promise.resolve();
  assert.equal(settled, false);
  worker.complete(worker.messages[1].id, 0);
  assert.equal((await active)[0], 0);
  processor.dispose();
}));

test('pre-cancelled or disposed operations never start a worker or silently run fallback', withWorker(async () => {
  const processor = createMonochromeProcessor();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(processor.process(pixels(), settings, controller.signal), { name: 'AbortError' });
  processor.dispose();
  await assert.rejects(processor.process(pixels(), settings), { name: 'AbortError' });
  assert.equal(WorkerHarness.instances.length, 0);
}));

test('closing a PDF terminates its worker and settles every outstanding operation', withWorker(async () => {
  const processor = createMonochromeProcessor();
  const controller = new AbortController();
  const first = assert.rejects(processor.process(pixels(), settings, controller.signal), { name: 'AbortError' });
  const second = assert.rejects(processor.process(pixels(), settings), { name: 'AbortError' });
  processor.dispose();
  await Promise.all([first, second]);
  assert.equal(WorkerHarness.instances[0].terminated, true);
  // Late cancellation and response cannot revive a disposed processor.
  controller.abort();
  WorkerHarness.instances[0].complete(1, 255);
  await assert.rejects(processor.process(pixels(), settings), { name: 'AbortError' });
}));
