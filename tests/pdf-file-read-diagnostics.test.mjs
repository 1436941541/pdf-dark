import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const NOW = 1_800_000_000_000;

function compile(overrides = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL('../lib/pdf-file-read-diagnostics.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  let ticks = 20;
  const globals = {
    Date: { now: () => NOW },
    performance: { now: () => ticks += 12.4 },
    document: { visibilityState: 'visible', hasFocus: () => true },
    navigator: { onLine: true },
    console: { error: () => assert.fail('The read helper must not report failures itself') },
    ...overrides,
  };
  new Function('exports', ...Object.keys(globals), code)(exports, ...Object.values(globals));
  return exports;
}

function fileWithRead(arrayBuffer, overrides = {}) {
  return {
    size: 4096,
    type: 'application/pdf',
    lastModified: NOW - 1000,
    arrayBuffer,
    get name() { assert.fail('Must not read the filename'); },
    get webkitRelativePath() { assert.fail('Must not read a path'); },
    get slice() { assert.fail('Must not probe the file with slice'); },
    get text() { assert.fail('Must not read additional file content'); },
    get stream() { assert.fail('Must not read additional file content'); },
    ...overrides,
  };
}

async function rejectsSame(promise, expected) {
  let rejected = false;
  try { await promise; } catch (error) {
    rejected = true;
    assert(Object.is(error, expected), 'Preserve the original rejection identity');
  }
  assert(rejected, 'Expected the read to reject');
}

test('success returns the same ArrayBuffer and calls the native operation once with its original receiver', async () => {
  const h = compile({ document: new Proxy({}, { get() { assert.fail('Success must not inspect the environment'); } }) });
  const buffer = new ArrayBuffer(4);
  let calls = 0;
  const file = fileWithRead(function () { calls++; assert.equal(this, file); return Promise.resolve(buffer); });
  assert.equal(await h.readPdfFile(file), buffer);
  assert.equal(calls, 1);
  assert.equal(h.getPdfFileReadFailure(buffer), undefined);
});

test('ordinary Error keeps its identity, stack, own properties and message', async () => {
  const h = compile();
  const error = new Error('PRIVATE.pdf C:\\PRIVATE\\OneDrive\\SECRET.pdf');
  const stack = error.stack;
  const ownKeys = Reflect.ownKeys(error);
  let calls = 0;
  await rejectsSame(h.readPdfFile(fileWithRead(async () => { calls++; throw error; })), error);
  assert.equal(calls, 1);
  assert.equal(error.stack, stack);
  assert.deepEqual(Reflect.ownKeys(error), ownKeys);
  const failure = h.getPdfFileReadFailure(error);
  assert.equal(failure.error_kind, 'unknown');
  assert.equal(failure.dom_exception_name, 'Other');
  assert.equal(failure.read_elapsed_ms, 12);
  assert.equal(failure.file_bytes, 4096);
  assert.equal(failure.file_type, 'pdf');
  assert.equal(failure.selection_source, 'unknown');
  assert.equal(failure.last_modified_age, 'under_1h');
  assert.equal(failure.metadata_before_available, true);
  assert.equal(failure.metadata_after_available, true);
  assert.equal(failure.metadata_changed, false);
  assert.equal(failure.visibility, 'visible');
  assert.equal(failure.document_focused, true);
  assert.equal(failure.online, true);
  assert(Object.isFrozen(failure));
  assert(!JSON.stringify(failure).match(/PRIVATE|SECRET|OneDrive|stack|message|filename|lastModified/));
});

for (const [name, kind] of [
  ['NotFoundError', 'not_found'], ['NotReadableError', 'not_readable'],
  ['NotAllowedError', 'not_allowed'], ['SecurityError', 'security'],
  ['AbortError', 'abort'], ['InvalidStateError', 'unknown'], ['UnknownError', 'unknown'],
]) {
  test(`frozen ${name} remains the original rejection and has the fixed ${kind} classification`, async () => {
    const h = compile();
    const error = new DOMException('PRIVATE FILE /PRIVATE/SECRET.pdf', name);
    // Some runtimes lazily materialize this property on its first read.
    const stack = error.stack;
    Object.freeze(error);
    const ownKeys = Reflect.ownKeys(error);
    await rejectsSame(h.readPdfFile(fileWithRead(async () => { throw error; })), error);
    const failure = h.getPdfFileReadFailure(error);
    assert.equal(failure.error_kind, kind);
    assert.equal(failure.dom_exception_name, name);
    assert.equal(failure.dom_exception_code, error.code);
    assert.equal(error.stack, stack);
    assert.deepEqual(Reflect.ownKeys(error), ownKeys);
    assert(!JSON.stringify(failure).match(/PRIVATE|SECRET/));
  });
}

test('selection origins stay per File and use unknown for unmarked or invalid sources', async () => {
  const h = compile();
  for (const source of ['picker', 'drop', 'sample', undefined, 'PRIVATE SOURCE']) {
    const error = new Error('PRIVATE');
    const file = fileWithRead(async () => { throw error; });
    if (source !== undefined) h.markPdfFileSource(file, source);
    await rejectsSame(h.readPdfFile(file), error);
    assert.equal(h.getPdfFileReadFailure(error).selection_source, ['picker', 'drop', 'sample'].includes(source) ? source : 'unknown');
  }
});

test('MIME type is reduced to a fixed enum without retaining an arbitrary value', async () => {
  const h = compile();
  for (const [type, expected] of [
    ['application/pdf', 'pdf'], ['application/octet-stream', 'octet-stream'],
    ['', 'empty'], ['application/PRIVATE; path=/SECRET.pdf', 'other'],
  ]) {
    const error = new Error('PRIVATE');
    await rejectsSame(h.readPdfFile(fileWithRead(async () => { throw error; }, { type })), error);
    const failure = h.getPdfFileReadFailure(error);
    assert.equal(failure.file_type, expected);
    assert(!JSON.stringify(failure).match(/PRIVATE|SECRET|application\//));
  }
});

test('lastModified emits only a coarse age bucket, including boundary and unavailable clock cases', async () => {
  for (const [age, expected] of [
    [-1, 'future'], [0, 'under_1h'], [3_600_000 - 1, 'under_1h'],
    [3_600_000, 'under_1d'], [86_400_000, 'under_30d'],
    [30 * 86_400_000, 'under_1y'], [365 * 86_400_000, 'over_1y'],
  ]) {
    const h = compile();
    const error = new Error('PRIVATE');
    await rejectsSame(h.readPdfFile(fileWithRead(async () => { throw error; }, { lastModified: NOW - age })), error);
    const failure = h.getPdfFileReadFailure(error);
    assert.equal(failure.last_modified_age, expected);
    assert(!JSON.stringify(failure).includes(String(NOW - age)), 'Do not expose the precise timestamp');
  }
  const h = compile({ Date: { now() { throw new Error('PRIVATE clock'); } } });
  const error = new Error('PRIVATE');
  await rejectsSame(h.readPdfFile(fileWithRead(async () => { throw error; })), error);
  assert.equal(h.getPdfFileReadFailure(error).last_modified_age, 'unknown');
});

test('metadata changes detect size, original MIME and lastModified differences without serializing them', async () => {
  for (const [key, oldValue, newValue] of [
    ['size', 4096, 8192], ['type', 'application/PRIVATE', 'application/SECRET'],
    ['lastModified', NOW - 1000, NOW - 2000],
  ]) {
    const h = compile();
    const error = new Error('PRIVATE');
    const file = fileWithRead(async () => { file[key] = newValue; throw error; }, { [key]: oldValue });
    await rejectsSame(h.readPdfFile(file), error);
    const failure = h.getPdfFileReadFailure(error);
    assert.equal(failure.metadata_changed, true);
    assert.equal(failure.metadata_before_available, true);
    assert.equal(failure.metadata_after_available, true);
    assert(!JSON.stringify(failure).match(/PRIVATE|SECRET/));
  }
});

test('throwing or invalid file metadata getters are independently optional before and after the read', async () => {
  const h = compile();
  for (const key of ['size', 'type', 'lastModified']) {
    const error = new Error('PRIVATE');
    const file = fileWithRead(async () => { throw error; });
    Object.defineProperty(file, key, { get() { throw new Error('PRIVATE metadata'); } });
    await rejectsSame(h.readPdfFile(file), error);
    const failure = h.getPdfFileReadFailure(error);
    assert.equal(failure.metadata_before_available, false);
    assert.equal(failure.metadata_after_available, false);
    assert.equal(failure.metadata_changed, undefined, 'Unavailable is not proof metadata remained unchanged');
    assert.equal(failure.file_bytes, key === 'size' ? undefined : 4096);
    assert.equal(failure.file_type, key === 'type' ? undefined : 'pdf');
    assert.equal(failure.last_modified_age, key === 'lastModified' ? 'unknown' : 'under_1h');
  }
  for (const overrides of [{ size: NaN }, { size: -1 }, { size: Infinity }, { size: 1.5 }, { type: null }, { lastModified: NaN }, { lastModified: -1 }]) {
    const error = new Error('PRIVATE');
    await rejectsSame(h.readPdfFile(fileWithRead(async () => { throw error; }, overrides)), error);
    assert.equal(h.getPdfFileReadFailure(error).metadata_before_available, false);
  }
});

test('metadata availability is captured separately before and after a failed operation', async () => {
  const h = compile();
  for (const missingBefore of [true, false]) {
    const error = new Error('PRIVATE');
    let pending = false;
    const file = fileWithRead(async () => { pending = true; throw error; });
    Object.defineProperty(file, 'size', { get() {
      if (pending !== missingBefore) throw new Error('PRIVATE metadata');
      return 4096;
    } });
    await rejectsSame(h.readPdfFile(file), error);
    const failure = h.getPdfFileReadFailure(error);
    assert.equal(failure.metadata_before_available, !missingBefore);
    assert.equal(failure.metadata_after_available, missingBefore);
    assert.equal(failure.metadata_changed, undefined);
  }
});

test('throwing error and environment getters and clocks cannot replace a read rejection', async () => {
  const unavailable = () => { throw new Error('PRIVATE diagnostic getter'); };
  const h = compile({
    performance: { now: unavailable },
    document: { get visibilityState() { return unavailable(); }, hasFocus: unavailable },
    navigator: { get onLine() { return unavailable(); } },
  });
  const error = Object.freeze({ get name() { return unavailable(); }, get code() { return unavailable(); } });
  const file = fileWithRead(async () => { throw error; });
  await rejectsSame(h.readPdfFile(file), error);
  const failure = h.getPdfFileReadFailure(error);
  assert.equal(failure.error_kind, 'unknown');
  assert.equal(failure.dom_exception_name, 'Other');
  for (const key of ['dom_exception_code', 'read_elapsed_ms', 'visibility', 'document_focused', 'online']) assert.equal(failure[key], undefined);
  assert.equal(failure.file_bytes, 4096);
});

test('invalid codes, unallowlisted names and unsafe environment values never enter metadata', async () => {
  const h = compile({
    performance: { now: () => NaN },
    document: { visibilityState: 'PRIVATE', hasFocus: () => 'SECRET' },
    navigator: { onLine: 'PRIVATE' },
  });
  for (const code of ['SECRET', -1, 26, 1.2, NaN, Infinity]) {
    const error = { name: 'PRIVATE /SECRET.pdf', code };
    await rejectsSame(h.readPdfFile(fileWithRead(async () => { throw error; })), error);
    const failure = h.getPdfFileReadFailure(error);
    assert.equal(failure.dom_exception_code, undefined);
    assert.equal(failure.dom_exception_name, 'Other');
    assert.equal(failure.error_kind, 'unknown');
    assert.equal(failure.read_elapsed_ms, undefined);
    assert.equal(failure.visibility, undefined);
    assert.equal(failure.document_focused, undefined);
    assert.equal(failure.online, undefined);
    assert(!JSON.stringify(failure).match(/PRIVATE|SECRET/));
  }
});

test('native arrayBuffer getter and synchronous call failures preserve their original errors', async () => {
  const h = compile();
  for (const getterThrows of [true, false]) {
    const error = Object.freeze(new Error('PRIVATE'));
    let calls = 0;
    const file = fileWithRead(() => { calls++; throw error; });
    if (getterThrows) Object.defineProperty(file, 'arrayBuffer', { get() { calls++; throw error; } });
    await rejectsSame(h.readPdfFile(file), error);
    assert.equal(calls, 1);
    assert.equal(h.getPdfFileReadFailure(error).metadata_before_available, true);
  }
});

test('non-object rejections are rethrown without wrapping and have no WeakMap metadata', async () => {
  const h = compile();
  for (const error of [undefined, null, false, 0, NaN, 'PRIVATE', Symbol('SECRET')]) {
    let calls = 0;
    await rejectsSame(h.readPdfFile(fileWithRead(async () => { calls++; throw error; })), error);
    assert.equal(calls, 1);
    assert.equal(h.getPdfFileReadFailure(error), undefined);
  }
});

test('failures retain only frozen scalar metadata and never access content, message, stack, UA or memory', async () => {
  const forbidden = () => assert.fail('Forbidden diagnostic data was accessed');
  const h = compile({
    navigator: { onLine: false, get userAgent() { return forbidden(); }, get deviceMemory() { return forbidden(); } },
    performance: { now: () => 1, get memory() { return forbidden(); } },
  });
  const error = Object.freeze({
    name: 'NotFoundError', code: 8,
    get message() { return forbidden(); }, get stack() { return forbidden(); },
  });
  const file = fileWithRead(async () => { throw error; });
  await rejectsSame(h.readPdfFile(file), error);
  const failure = h.getPdfFileReadFailure(error);
  assert(Object.values(failure).every(value => ['number', 'string', 'boolean'].includes(typeof value)));
  assert(Object.isFrozen(failure));
  assert.throws(() => { failure.filename = 'PRIVATE.pdf'; }, TypeError);
  assert.equal(failure.online, false);
  assert.deepEqual(Object.keys(failure).sort(), [
    'document_focused', 'dom_exception_code', 'dom_exception_name', 'error_kind',
    'file_bytes', 'file_type', 'last_modified_age', 'metadata_after_available',
    'metadata_before_available', 'metadata_changed', 'online', 'read_elapsed_ms',
    'selection_source', 'visibility',
  ].sort());
});
