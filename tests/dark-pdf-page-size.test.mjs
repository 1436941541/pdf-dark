import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);
const pdfLib = require('pdf-lib');
const { PDFDocument, PDFName, PDFNumber, StandardFonts, degrees, decodePDFRawStream } = pdfLib;

// A real 1x1 black JPEG; keeps these document tests independent of canvas APIs.
const jpegBytes = new Uint8Array(Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJVAA//Z',
  'base64',
));

function compile(file, imports) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)((name) => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports);
  return exports;
}

const textLayer = compile('../lib/text-layer.ts', { 'pdf-lib': pdfLib });

function builder(objectPages = []) {
  return compile('../lib/build-dark-pdf.ts', {
    'pdf-lib': pdfLib,
    './dark-color': { classifyImage: () => 'keep', imageDimAlpha: () => 0 },
    './native-image': { extractNativeImage: async () => ({ format: 'jpg', bytes: jpegBytes }) },
    './text-layer': textLayer,
    './content-recolor': { recolorPageInPlace: async (_doc, index) => objectPages.includes(index) },
  }).buildDarkPdf;
}

async function loadProxy(bytes) {
  return getDocument({ data: bytes.slice(), useSystemFonts: true }).promise;
}

async function sourcePages(configs) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const { width = 6000, height = 4000, rotate = 0, userUnit = 1, cropBox } of configs) {
    const page = doc.addPage([width, height]);
    page.setRotation(degrees(rotate));
    if (userUnit !== 1) page.node.set(PDFName.of('UserUnit'), PDFNumber.of(userUnit));
    if (cropBox) page.setCropBox(...cropBox);
    page.drawText('Searchable source text', { x: 100, y: 200, size: 24, font });
  }
  const bytes = await doc.save();
  return { bytes, proxy: await loadProxy(bytes) };
}

async function pageRender(proxy, index, { limited = true, scale = 0.3, overlay = false } = {}) {
  const page = await proxy.getPage(index + 1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale });
  return {
    displayBlob: new Blob([jpegBytes], { type: 'image/jpeg' }),
    width: viewport.width,
    height: viewport.height,
    imageRects: overlay ? [{
      x: viewport.width * 0.1,
      y: viewport.height * 0.2,
      w: viewport.width * 0.2,
      h: viewport.height * 0.1,
      objId: 'native-image',
      composite: true,
    }] : [],
    scannedPage: false,
    ...(limited ? { rasterPageSize: {
      width: base.width / page.userUnit,
      height: base.height / page.userUnit,
      userUnit: page.userUnit,
    } } : {}),
  };
}

function contentStream(doc, index) {
  const contents = doc.getPage(index).node.Contents();
  const streams = contents?.asArray ? contents.asArray() : [contents];
  return streams.map((stream) => Buffer.from(decodePDFRawStream(doc.context.lookup(stream)).decode()).toString('latin1')).join('\n');
}

function imageMatrices(doc, index) {
  const matrices = [];
  const stack = [];
  let current = [1, 0, 0, 1, 0, 0];
  const operators = /(?:^|\s)(q|Q)(?=\s|$)|([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) cm|\/Image[^\s]* Do/g;
  for (const match of contentStream(doc, index).matchAll(operators)) {
    if (match[1] === 'q') stack.push([...current]);
    else if (match[1] === 'Q') current = stack.pop();
    else if (match[2] !== undefined) {
      const [a, b, c, d, e, f] = match.slice(2).map(Number);
      const [g, h, i, j, k, l] = current;
      current = [g * a + i * b, h * a + j * b, g * c + i * d, h * c + j * d, g * e + i * f + k, h * e + j * f + l];
    } else matrices.push([...current]);
  }
  return matrices;
}

async function textItems(proxy, index = 0) {
  return (await (await proxy.getPage(index + 1)).getTextContent()).items.filter((item) => 'str' in item && item.str.trim());
}

test('ordinary whole-raster exports retain the historical pixel-sized pages and text scale', async () => {
  const source = await sourcePages([{ width: 600, height: 400 }]);
  let output;
  try {
    const render = await pageRender(source.proxy, 0, { limited: false, scale: 1.5 });
    const result = await builder()(source.bytes.buffer, [render], 'midnight', 'original', source.proxy);
    assert.deepEqual([result.objectPages, result.rasterPages], [0, 1]);
    const doc = await PDFDocument.load(result.bytes);
    assert.deepEqual(doc.getPage(0).getSize(), { width: 900, height: 600 });
    assert.equal(doc.getPage(0).node.get(PDFName.of('UserUnit')), undefined);
    assert.deepEqual(imageMatrices(doc, 0), [[900, 0, 0, 600, 0, 0]]);
    output = await loadProxy(result.bytes);
    const [text] = await textItems(output);
    assert.equal(text.str, 'Searchable source text');
    assert.deepEqual(text.transform, [36, 0, 0, 36, 150, 300]);
  } finally {
    await source.proxy.destroy();
    await output?.destroy();
  }
});

test('limited whole-raster exports preserve page size, searchable text, and native-image layout at different render scales', async () => {
  const source = await sourcePages([{}]);
  try {
    for (const scale of [0.3, 0.5]) {
      const render = await pageRender(source.proxy, 0, { scale, overlay: true });
      const result = await builder()(source.bytes.buffer, [render], 'midnight', 'original', source.proxy);
      const doc = await PDFDocument.load(result.bytes);
      assert.deepEqual(doc.getPage(0).getSize(), { width: 6000, height: 4000 });
      assert.deepEqual(imageMatrices(doc, 0), [
        [6000, 0, 0, 4000, 0, 0],
        [1200, 0, 0, 400, 600, 2800],
      ]);
      assert.match(contentStream(doc, 0), /3 Tr/);
      const output = await loadProxy(result.bytes);
      try {
        const [text] = await textItems(output);
        assert.equal(text.str, 'Searchable source text');
        assert.deepEqual(text.transform, [24, 0, 0, 24, 100, 200]);
      } finally {
        await output.destroy();
      }
    }
  } finally {
    await source.proxy.destroy();
  }
});

test('limited whole-raster UserUnit pages preserve physical dimensions and apply text-size compensation once', async () => {
  const source = await sourcePages([{ userUnit: 3 }]);
  let output;
  try {
    const render = await pageRender(source.proxy, 0, { scale: 0.1 });
    const result = await builder()(source.bytes.buffer, [render], 'midnight', 'original', source.proxy);
    const doc = await PDFDocument.load(result.bytes);
    assert.deepEqual(doc.getPage(0).getSize(), { width: 6000, height: 4000 });
    assert.equal(doc.getPage(0).node.lookup(PDFName.of('UserUnit'), PDFNumber).asNumber(), 3);
    assert.deepEqual(imageMatrices(doc, 0), [[6000, 0, 0, 4000, 0, 0]]);
    output = await loadProxy(result.bytes);
    const originalViewport = (await source.proxy.getPage(1)).getViewport({ scale: 1 });
    const outputViewport = (await output.getPage(1)).getViewport({ scale: 1 });
    assert.deepEqual([outputViewport.width, outputViewport.height], [originalViewport.width, originalViewport.height]);
    assert.deepEqual((await textItems(output))[0].transform, (await textItems(source.proxy))[0].transform);
  } finally {
    await source.proxy.destroy();
    await output?.destroy();
  }
});

test('ordinary whole-raster UserUnit pages keep their existing text-size behavior without limited metadata', async () => {
  const source = await sourcePages([{ width: 600, height: 400, userUnit: 3 }]);
  let output;
  try {
    const render = await pageRender(source.proxy, 0, { limited: false, scale: 1.5 });
    const result = await builder()(source.bytes.buffer, [render], 'midnight', 'original', source.proxy);
    const doc = await PDFDocument.load(result.bytes);
    assert.deepEqual(doc.getPage(0).getSize(), { width: 2700, height: 1800 });
    assert.equal(doc.getPage(0).node.get(PDFName.of('UserUnit')), undefined);
    output = await loadProxy(result.bytes);
    assert.deepEqual((await textItems(output))[0].transform, [36, 0, 0, 36, 450, 900]);
  } finally {
    await source.proxy.destroy();
    await output?.destroy();
  }
});

test('mixed exports preserve object pages and unrotated source page boxes while sizing limited rotated raster pages upright', async () => {
  const source = await sourcePages([
    { width: 600, height: 400, rotate: 90, userUnit: 3 },
    { width: 4000, height: 2000, rotate: 90, userUnit: 3 },
    { width: 6000, height: 4000, userUnit: 3 },
    { width: 6000, height: 4000, userUnit: 3, cropBox: [100, 200, 5000, 3000] },
  ]);
  let output;
  try {
    const renders = await Promise.all([0, 1, 2, 3].map((index) => pageRender(source.proxy, index, { scale: 0.1 })));
    const result = await builder([0])(source.bytes.buffer, renders, 'midnight', 'original', source.proxy);
    assert.deepEqual([result.objectPages, result.rasterPages], [1, 3]);
    const doc = await PDFDocument.load(result.bytes);
    assert.deepEqual(doc.getPage(0).getSize(), { width: 600, height: 400 });
    assert.equal(doc.getPage(0).getRotation().angle, 90);
    assert.deepEqual(doc.getPage(1).getSize(), { width: 2000, height: 4000 });
    assert.equal(doc.getPage(1).getRotation().angle, 0);
    assert.equal(doc.getPage(1).node.lookup(PDFName.of('UserUnit'), PDFNumber).asNumber(), 3);
    assert.deepEqual(imageMatrices(doc, 1), [[2000, 0, 0, 4000, 0, 0]]);
    assert.deepEqual(doc.getPage(2).getSize(), { width: 6000, height: 4000 });
    assert.deepEqual(doc.getPage(3).getMediaBox(), { x: 0, y: 0, width: 6000, height: 4000 });
    assert.deepEqual(doc.getPage(3).getCropBox(), { x: 100, y: 200, width: 5000, height: 3000 });
    output = await loadProxy(result.bytes);
    for (const index of [0, 1, 2, 3]) {
      const originalViewport = (await source.proxy.getPage(index + 1)).getViewport({ scale: 1 });
      const outputViewport = (await output.getPage(index + 1)).getViewport({ scale: 1 });
      assert.deepEqual([outputViewport.width, outputViewport.height], [originalViewport.width, originalViewport.height]);
    }
    assert.equal((await textItems(output, 0))[0].str, 'Searchable source text');
    assert.deepEqual(await textItems(output, 1), []); // Existing rotated text-layer limitation.
    assert.deepEqual((await textItems(output, 2))[0].transform, (await textItems(source.proxy, 2))[0].transform);
  } finally {
    await source.proxy.destroy();
    await output?.destroy();
  }
});

test('ordinary mixed rotated raster pages retain their RENDER_SCALE-derived dimensions', async () => {
  const source = await sourcePages([{ width: 600, height: 400 }, { width: 200, height: 300, rotate: 90 }]);
  try {
    const renders = await Promise.all([0, 1].map((index) => pageRender(source.proxy, index, { limited: false, scale: 1.5 })));
    const result = await builder([0])(source.bytes.buffer, renders, 'midnight', 'original', source.proxy);
    const doc = await PDFDocument.load(result.bytes);
    assert.deepEqual(doc.getPage(1).getSize(), { width: 300, height: 200 });
    assert.equal(doc.getPage(1).getRotation().angle, 0);
  } finally {
    await source.proxy.destroy();
  }
});
