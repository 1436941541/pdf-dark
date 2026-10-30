import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as monochrome from '../lib/monochrome.ts';

function harness(failAt) {
  const failure = new TypeError('Load failed');
  const canvases = [], progress = [];
  let pageNumber = 0;
  const check = phase => { if (phase === failAt && (phase === 'save_pdf' || pageNumber === 2)) throw failure; };
  const output = {
    setCreator() {}, embedFont: async () => ({}),
    embedPng: async bytes => { check('embed_page'); assert(bytes.length > 0); return {}; },
    addPage: () => ({ drawImage() {} }),
    save: async () => { check('save_pdf'); return new Uint8Array([37, 80, 68, 70]); },
  };
  const document = { createElement(tag) {
    assert.equal(tag, 'canvas');
    const canvas = {
      width: 0, height: 0,
      getContext: () => ({
        getImageData: () => ({ data: new Uint8ClampedArray(canvas.width * canvas.height * 4).fill(255) }),
        putImageData() {},
      }),
      toBlob: callback => callback(failAt === 'encode_page' && pageNumber === 2 ? null : new Blob(['PNG'])),
      toDataURL: () => 'data:image/png;base64,UE5H',
    };
    canvases.push(canvas);
    return canvas;
  } };
  const source = fs.readFileSync(new URL('../lib/monochrome-pdf.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.url', '"https://pdfdark.org/lib/monochrome-pdf.ts"');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const imports = {
    './monochrome': monochrome,
    './text-layer': { drawInvisibleTextLayer: async () => {} },
    './main-thread': { yieldToMain: async () => {} },
    'pdf-lib': { PDFDocument: { create: async () => output }, StandardFonts: { Helvetica: 'Helvetica' } },
  };
  const exports = {};
  class ImageData {
    constructor(data, width, height) { assert.equal(data.length, width * height * 4); }
  }
  new Function('require', 'exports', 'document', 'ImageData', code)(name => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports, document, ImageData);
  const pdf = { numPages: 2, getPage: async n => {
    pageNumber = n;
    check('get_page');
    return {
      getViewport: ({ scale }) => ({ width: 4 * scale, height: 6 * scale }),
      render: () => ({ promise: Promise.resolve(), cancel() {} }),
    };
  } };
  const processor = { process: async (pixels, settings) => {
    check('process_pixels');
    monochrome.monochromePixels(pixels, settings);
    return pixels;
  } };
  const run = diagnostic => exports.exportMonochromePdf(pdf,
    { mode: 'black-and-white', threshold: 140 }, processor,
    new AbortController().signal, n => progress.push(n), diagnostic);
  return { run, failure, canvases, progress };
}

for (const phase of ['get_page', 'process_pixels', 'embed_page']) {
  test(`a page-2 ${phase} rejection retains the original error and failure location`, async () => {
    const h = harness(phase), diagnostic = {};
    await assert.rejects(h.run(diagnostic), error => error === h.failure);
    assert.equal(diagnostic.monochromeStep, phase);
    assert.equal(diagnostic.pageNumber, 2);
    assert.equal(diagnostic.totalPages, 2);
    assert.equal(diagnostic.monochromeMode, 'black-and-white');
    assert.equal(diagnostic.threshold, 140);
    assert.deepEqual(h.progress, [1]);
    assert(h.canvases.every(c => c.width === 0 && c.height === 0));
  });
}

test('page encoding failures are distinguished from PDF image embedding', async () => {
  const h = harness('encode_page'), diagnostic = {};
  await assert.rejects(h.run(diagnostic), /Could not encode the converted page/);
  assert.equal(diagnostic.monochromeStep, 'encode_page');
  assert.equal(diagnostic.pageNumber, 2);
  assert.equal(diagnostic.pageWidth, 8);
  assert.equal(diagnostic.pageHeight, 12);
  assert(h.canvases.every(c => c.width === 0 && c.height === 0));
});

test('whole-document saving does not incorrectly blame the last rendered page', async () => {
  const h = harness('save_pdf'), diagnostic = {};
  await assert.rejects(h.run(diagnostic), error => error === h.failure);
  assert.equal(diagnostic.monochromeStep, 'save_pdf');
  assert.equal(diagnostic.pageNumber, undefined);
  assert.equal(diagnostic.pageWidth, undefined);
  assert.equal(diagnostic.totalPages, 2);
  assert.deepEqual(h.progress, [1, 2]);
});

test('optional or non-writable diagnostics leave successful output and progress unchanged', async () => {
  const original = harness(), traced = harness(), frozen = harness();
  const diagnostic = {};
  const before = await original.run();
  assert.deepEqual(await traced.run(diagnostic), before);
  assert.deepEqual(await frozen.run(Object.freeze({})), before);
  assert.deepEqual(traced.progress, original.progress);
  assert.equal(diagnostic.monochromeStep, 'save_pdf');
  assert(traced.canvases.every(c => c.width === 0 && c.height === 0));
});
