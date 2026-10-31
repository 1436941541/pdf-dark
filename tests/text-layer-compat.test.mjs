import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);
const pdfLib = require('pdf-lib');
const { PDFDocument, PDFName, PDFNumber, StandardFonts, degrees, decodePDFRawStream } = pdfLib;
const source = fs.readFileSync(new URL('../lib/text-layer.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

class ReaderOnlyStream {}
class IterableStream {
  [Symbol.asyncIterator]() {}
}

function compile(Stream = IterableStream) {
  const exports = {};
  // Access the private helper only inside the isolated test module; the
  // production module keeps drawInvisibleTextLayer as its only export.
  return new Function('require', 'exports', 'ReadableStream', `${code}
    return { ...exports, getPageTextContent };
  `)(name => {
    assert.equal(name, 'pdf-lib');
    return pdfLib;
  }, exports, Stream);
}

const native = compile();
const fallback = compile(ReaderOnlyStream);

function chunk(items = [], styles = {}, lang = null) {
  return { items, styles, lang };
}

function readerFor(chunks) {
  const events = [];
  let index = 0;
  return {
    events,
    async read() {
      events.push('read');
      return index < chunks.length
        ? { value: chunks[index++], done: false }
        : { value: undefined, done: true };
    },
    async cancel(reason) { events.push(['cancel', reason]); },
    releaseLock() { events.push('release'); },
  };
}

function pageFor(reader) {
  return {
    isPureXfa: false,
    getTextContent() { assert.fail('The reader-only path must not call getTextContent'); },
    streamTextContent(...args) {
      assert.deepEqual(args, []);
      return { getReader: () => reader };
    },
  };
}

test('native stream support delegates once to the original getter with its receiver and arguments', async () => {
  const expected = chunk([{ str: 'native' }]);
  let calls = 0;
  const page = {
    getTextContent(...args) {
      calls++;
      assert.equal(this, page);
      assert.deepEqual(args, []);
      return Promise.resolve(expected);
    },
    streamTextContent() { assert.fail('Do not start a second extraction'); },
  };
  assert.equal(await native.getPageTextContent(page), expected);
  assert.equal(calls, 1);
});

test('native extraction errors are not retried through the compatibility reader', async () => {
  const failure = new TypeError('native extraction failed');
  const page = {
    getTextContent() { return Promise.reject(failure); },
    streamTextContent() { assert.fail('Do not retry a native extraction error'); },
  };
  await assert.rejects(native.getPageTextContent(page), error => error === failure);
});

test('pure XFA keeps its original getter even without a stream async iterator', async () => {
  const expected = chunk([{ str: 'XFA form text' }]);
  const page = {
    isPureXfa: true,
    getTextContent() { assert.equal(this, page); return expected; },
    streamTextContent() { assert.fail('Pure XFA has a separate pdf.js extraction path'); },
  };
  assert.equal(await fallback.getPageTextContent(page), expected);
});

test('a missing ReadableStream global keeps the original extraction path', async () => {
  const expected = chunk();
  const page = {
    getTextContent: () => expected,
    streamTextContent() { assert.fail('There is no stream capability to adapt'); },
  };
  // Passing undefined explicitly uses the function default, so use a separate
  // isolated constructor invocation to model an absent browser global.
  const exports = {};
  const read = new Function('require', 'exports', 'ReadableStream', `${code}
    return getPageTextContent;
  `)(() => pdfLib, exports, undefined);
  assert.equal(await read(page), expected);
});

test('reader-only streams aggregate all chunks in order with pdf.js styles and lang semantics', async () => {
  const first = { str: 'First' }, marked = { type: 'beginMarkedContent' }, last = { str: 'Last' };
  const originalStyle = { fontFamily: 'serif' }, newStyle = { fontFamily: 'sans-serif' };
  const chunks = [
    chunk([first], { shared: originalStyle }, null),
    chunk([marked], { extra: originalStyle }, 'en-US'),
    chunk([last], { shared: newStyle }, 'fr-FR'),
  ];
  const reader = readerFor(chunks);
  const result = await fallback.getPageTextContent(pageFor(reader));
  assert.deepEqual(result.items, [first, marked, last]);
  assert.equal(result.items[0], first);
  assert.equal(Object.getPrototypeOf(result.styles), null);
  assert.deepEqual({ ...result.styles }, { shared: newStyle, extra: originalStyle });
  assert.equal(result.lang, 'en-US');
  assert.deepEqual(reader.events, ['read', 'read', 'read', 'read', 'release']);
  assert.deepEqual(chunks[0].items, [first]);
  assert.equal(chunks[0].styles.shared, originalStyle);
});

test('an empty reader-only stream returns the same empty content shape and releases its lock', async () => {
  const reader = readerFor([]);
  const result = await fallback.getPageTextContent(pageFor(reader));
  assert.deepEqual(result.items, []);
  assert.equal(Object.getPrototypeOf(result.styles), null);
  assert.deepEqual({ ...result.styles }, {});
  assert.equal(result.lang, null);
  assert.deepEqual(reader.events, ['read', 'release']);
});

test('empty-string language is retained just as in the pdf.js nullish assignment', async () => {
  const reader = readerFor([chunk([], {}, ''), chunk([], {}, 'en-US')]);
  assert.equal((await fallback.getPageTextContent(pageFor(reader))).lang, '');
});

for (const step of ['streamTextContent', 'getReader']) {
  test(`${step} failures retain their exact error without falling back to the getter`, async () => {
    const failure = new TypeError(`${step} failed`);
    let readerCalls = 0;
    const page = pageFor({});
    page.streamTextContent = () => {
      if (step === 'streamTextContent') throw failure;
      return { getReader() { readerCalls++; throw failure; } };
    };
    await assert.rejects(fallback.getPageTextContent(page), error => error === failure);
    assert.equal(readerCalls, step === 'getReader' ? 1 : 0);
  });
}

for (const readMode of ['throw', 'reject']) {
  for (const cancelMode of ['resolve', 'throw', 'reject']) {
    test(`${readMode} from read cancels and releases the reader even when cancel will ${cancelMode}`, async () => {
      const failure = new TypeError('text read failed');
      const cancellationFailure = new Error('cancel failed');
      const reader = readerFor([chunk([{ str: 'partial' }])]);
      const readFirstChunk = reader.read.bind(reader);
      let reads = 0;
      reader.read = () => {
        if (!reads++) return readFirstChunk();
        reader.events.push('failed read');
        if (readMode === 'throw') throw failure;
        return Promise.reject(failure);
      };
      reader.cancel = reason => {
        reader.events.push(['cancel', reason]);
        if (cancelMode === 'throw') throw cancellationFailure;
        if (cancelMode === 'reject') return Promise.reject(cancellationFailure);
        return Promise.resolve();
      };
      await assert.rejects(fallback.getPageTextContent(pageFor(reader)), error => error === failure);
      assert.deepEqual(reader.events, ['read', 'failed read', ['cancel', failure], 'release']);
    });
  }
}

test('an exception during chunk aggregation cancels the unfinished stream and releases its lock', async () => {
  const failure = new Error('could not inspect text chunk');
  const value = chunk();
  Object.defineProperty(value, 'styles', { get() { throw failure; } });
  const reader = readerFor([value]);
  await assert.rejects(fallback.getPageTextContent(pageFor(reader)), error => error === failure);
  assert.deepEqual(reader.events, ['read', ['cancel', failure], 'release']);
});

function contentStream(doc) {
  const contents = doc.getPage(0).node.Contents();
  if (!contents) return '';
  const streams = contents?.asArray ? contents.asArray() : [contents];
  return streams.map(stream => Buffer.from(decodePDFRawStream(doc.context.lookup(stream)).decode()).toString('latin1')).join('\n');
}

async function loadProxy(bytes) {
  return getDocument({ data: bytes.slice(), useSystemFonts: true }).promise;
}

async function realSource({ userUnit = 1, rotation = 0 } = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([600, 400]);
  page.setRotation(degrees(rotation));
  if (userUnit !== 1) page.node.set(PDFName.of('UserUnit'), PDFNumber.of(userUnit));
  page.drawText('Searchable first line', { x: 30, y: 320, size: 18, font });
  page.drawText('Angled second line', { x: 70, y: 170, size: 11, font, rotate: degrees(15) });
  return loadProxy(await doc.save());
}

async function drawRealPage(layer, original, { fontScaleMultiplier = 1, scale = 0.5 } = {}) {
  const doc = await PDFDocument.create();
  const viewport = original.getViewport({ scale });
  const page = doc.addPage([viewport.width, viewport.height]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const events = [];
  const proxy = {
    rotate: original.rotate,
    isPureXfa: original.isPureXfa,
    getViewport: params => original.getViewport(params),
    getTextContent() { events.push('getter'); return original.getTextContent(); },
    streamTextContent() {
      events.push('stream');
      // The returned stream intentionally has only getReader, matching Safari's
      // supported API without mutating the process's real ReadableStream.
      const stream = original.streamTextContent();
      return { getReader() {
        const reader = stream.getReader();
        return {
          read: () => reader.read(),
          cancel(reason) { events.push('cancel'); return reader.cancel(reason); },
          releaseLock() { events.push('release'); reader.releaseLock(); },
        };
      } };
    },
  };
  const written = await layer.drawInvisibleTextLayer(page, font, proxy, fontScaleMultiplier);
  const bytes = await doc.save();
  const output = await loadProxy(bytes);
  try {
    const text = await (await output.getPage(1)).getTextContent();
    return {
      written, events, operators: contentStream(await PDFDocument.load(bytes)),
      text: text.items.filter(item => 'str' in item && item.str.trim()).map(item => ({
        str: item.str, transform: item.transform, width: item.width, height: item.height,
      })),
    };
  } finally {
    await output.destroy();
  }
}

for (const { userUnit, fontScaleMultiplier } of [
  { userUnit: 1, fontScaleMultiplier: 1 },
  { userUnit: 3, fontScaleMultiplier: 1 },
  { userUnit: 3, fontScaleMultiplier: 3 },
]) {
  test(`reader-only exports retain native text, fonts, positions and UserUnit ${userUnit} multiplier ${fontScaleMultiplier}`, async () => {
    const source = await realSource({ userUnit });
    try {
      const page = await source.getPage(1);
      const options = { fontScaleMultiplier };
      const expected = await drawRealPage(native, page, options);
      const actual = await drawRealPage(fallback, page, options);
      assert.equal(actual.written, 2);
      assert.deepEqual(actual.text, expected.text);
      assert.deepEqual(actual.text.map(item => item.str), ['Searchable first line', 'Angled second line']);
      const fontSize = 18 * 0.5 * fontScaleMultiplier;
      assert.deepEqual(actual.text[0].transform, [fontSize, 0, 0, fontSize, 30 * 0.5 * userUnit, 320 * 0.5 * userUnit]);
      assert.equal(actual.operators, expected.operators);
      assert.match(actual.operators, /3 Tr/);
      assert.match(actual.operators, /0 Tr/);
      assert.deepEqual(expected.events, ['getter']);
      assert.deepEqual(actual.events, ['stream', 'release']);
    } finally {
      await source.destroy();
    }
  });
}

test('rotated pages still skip the text layer before starting either extraction path', async () => {
  const source = await realSource({ rotation: 90 });
  try {
    const page = await source.getPage(1);
    for (const layer of [native, fallback]) {
      const result = await drawRealPage(layer, page);
      assert.equal(result.written, 0);
      assert.deepEqual(result.events, []);
      assert.deepEqual(result.text, []);
      assert.doesNotMatch(result.operators, /3 Tr/);
    }
  } finally {
    await source.destroy();
  }
});
