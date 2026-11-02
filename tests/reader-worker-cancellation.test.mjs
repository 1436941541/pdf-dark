import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const diagnosticExports = {};
new Function('exports', ts.transpileModule(
  fs.readFileSync(new URL('../lib/dark-worker-diagnostics.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText)(diagnosticExports);

// Execute the production setup/cleanup rather than duplicating either component's
// lifecycle. The rest of the React tree is unrelated to this native event boundary.
function workerEffect(file) {
  const text = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const effects = [];
  const containsWorker = (node) => {
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Worker') return true;
    return ts.forEachChild(node, containsWorker) ?? false;
  };
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'useEffect') {
      const callback = node.arguments[0];
      if (callback && containsWorker(callback)) effects.push(callback);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.equal(effects.length, 1, `${file} should have one native Worker lifecycle`);
  const cancel = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'cancelledError');
  assert(cancel);
  const code = ts.transpileModule(
    `${cancel.getText(source)}\nexports.setup = ${effects[0].getText(source)};`
      .replaceAll('import.meta.url', '"https://pdfdark.org/components/reader.tsx"'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  return (options = {}) => {
    const workers = [];
    const refs = options.refs ?? {
      pendingRef: { current: new Map() }, workerRef: { current: null },
      cancelledRef: { current: false }, operationRef: { current: { cancel() {} } },
    };
    class WorkerHarness {
      constructor(url, init) {
        this.url = url;
        this.init = init;
        this.terminateCalls = 0;
        workers.push(this);
      }
      terminate() {
        this.terminateCalls++;
        if (options.errorOnTerminate) {
          this.terminationError = new Event('error', { cancelable: true });
          this.onerror(this.terminationError);
        }
      }
    }
    const exports = {};
    new Function('exports', 'Worker', 'restoreDarkWorkerError', ...Object.keys(refs), code)(
      exports, WorkerHarness, diagnosticExports.restoreDarkWorkerError, ...Object.values(refs),
    );
    return {
      refs, workers, setup: exports.setup,
      request(id) {
        return new Promise((resolve, reject) => refs.pendingRef.current.set(id, { resolve, reject }));
      },
    };
  };
}

for (const [tool, file] of [
  ['reader', '../components/pdf-viewer.tsx'],
  ['invert', '../components/downloader.tsx'],
]) {
  const harness = workerEffect(file);

  test(`${tool}: active native errors remain reportable and preserve pending work`, async () => {
    const h = harness(); const cleanup = h.setup();
    const request = h.request(1);
    const expectedCancellation = assert.rejects(request, { name: 'AbortError' });
    const event = new Event('error', { cancelable: true });
    assert.equal(h.workers[0].onerror(event), undefined);
    assert.equal(event.defaultPrevented, false);
    assert.equal(h.refs.pendingRef.current.size, 1);
    assert.equal(h.workers[0].terminateCalls, 0);
    cleanup(); await expectedCancellation;
    assert.equal(h.refs.pendingRef.current.size, 0);
    assert.equal(h.refs.workerRef.current, null);
    assert.equal(h.workers[0].terminateCalls, 1);
  });

  test(`${tool}: cleanup cancels the exact worker's late error before terminate can dispatch it`, async () => {
    const h = harness({ errorOnTerminate: true }); const cleanup = h.setup();
    const a = assert.rejects(h.request(1), { name: 'AbortError' });
    const b = assert.rejects(h.request(2), { name: 'AbortError' });
    cleanup(); await Promise.all([a, b]);
    assert.equal(h.workers[0].terminationError.defaultPrevented, true);
    for (let i = 0; i < 2; i++) {
      const late = new Event('error', { cancelable: true });
      h.workers[0].onerror(late);
      assert.equal(late.defaultPrevented, true);
    }
    assert.equal(h.workers[0].terminateCalls, 1);
  });

  test(`${tool}: an old disposed effect never suppresses the current effect or settles its requests`, async () => {
    const old = harness(); const cleanupOld = old.setup(); cleanupOld();
    // React Strict Mode can set up the effect again while retaining its refs.
    const current = harness({ refs: old.refs }); const cleanupCurrent = current.setup();
    let settled = false;
    const request = current.request(2); request.then(() => { settled = true; });
    const stale = new Event('error', { cancelable: true }); old.workers[0].onerror(stale);
    assert.equal(stale.defaultPrevented, true);
    const active = new Event('error', { cancelable: true }); current.workers[0].onerror(active);
    assert.equal(active.defaultPrevented, false);
    await Promise.resolve();
    assert.equal(settled, false);
    assert.equal(current.refs.pendingRef.current.size, 1);
    assert.strictEqual(current.refs.workerRef.current, current.workers[0]);
    const blob = new Blob(['unchanged result']);
    current.workers[0].onmessage({ data: { id: 2, blob } });
    assert.strictEqual(await request, blob);
    cleanupCurrent();
  });

  test(`${tool}: successful responses and diagnostic error packets keep the existing identities and classification`, async () => {
    const h = harness(); const cleanup = h.setup();
    const success = h.request(1); const blob = new Blob(['PDF pixels']);
    h.workers[0].onmessage({ data: { id: 1, blob } });
    assert.strictEqual(await success, blob);
    const failed = h.request(2);
    const failure = assert.rejects(failed, error => {
      assert.equal(error.message, 'PDF image worker failed');
      assert.equal(diagnosticExports.darkWorkerFailure(error).step, 'encode_jpeg');
      return true;
    });
    h.workers[0].onmessage({ data: { id: 2, error: 'PDF image worker failed', diagnostic: { version: 1, step: 'encode_jpeg', error_type: 'EncodingError' } } });
    await failure;
    assert.equal(h.refs.pendingRef.current.size, 0);
    cleanup();
  });

  test(`${tool}: an unusual error event cannot create another error during cancellation`, () => {
    const h = harness(); const cleanup = h.setup(); cleanup();
    for (const event of [{}, { preventDefault() { throw Error('unavailable'); } }, { get preventDefault() { throw Error('unavailable'); } }]) {
      assert.doesNotThrow(() => h.workers[0].onerror(event));
    }
    assert.equal(h.workers[0].terminateCalls, 1);
  });
}
