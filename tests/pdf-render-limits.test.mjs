import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function compile(file) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)((name) => {
    assert.fail(`Unexpected dependency ${name}`);
  }, exports);
  return exports;
}

const { getPdfRenderScale, PDF_RENDER_MAX_SIDE, PDF_RENDER_MAX_PIXELS } = compile('../lib/pdf-render-limits.ts');

function canvasSize(width, height, scale) {
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

function assertWithinBudget(width, height, preferredScale) {
  const scale = getPdfRenderScale(width, height, preferredScale);
  assert(Number.isFinite(scale) && scale > 0, `Invalid scale for ${width} × ${height} at ${preferredScale}`);
  assert(scale <= preferredScale, 'Rendering must never exceed the requested resolution');
  const canvas = canvasSize(width, height, scale);
  assert(canvas.width >= 1 && canvas.width <= PDF_RENDER_MAX_SIDE);
  assert(canvas.height >= 1 && canvas.height <= PDF_RENDER_MAX_SIDE);
  assert(canvas.width * canvas.height <= PDF_RENDER_MAX_PIXELS);
  return { scale, canvas };
}

test('A4 and A3 pages retain their exact preferred resolution within the render budgets', () => {
  for (const [width, height] of [[595.28, 841.89], [841.89, 1190.55]]) {
    for (const preferredScale of [0.5, 1, 1.5, 2]) {
      assert.equal(getPdfRenderScale(width, height, preferredScale), preferredScale);
    }
  }
  assert.equal(PDF_RENDER_MAX_SIDE, 4096);
  assert.equal(PDF_RENDER_MAX_PIXELS, 8_388_608);
  assert.equal(getPdfRenderScale(4096, 2048, 1), 1, 'A page exactly on both budgets stays unchanged');
  assert.equal(getPdfRenderScale(2048, 1024, 2), 2);
});

test('45360 × 6480 pages fit the long side while retaining the whole page aspect ratio', () => {
  const { scale, canvas } = assertWithinBudget(45360, 6480, 1.5);
  assert.equal(scale, 4096 / 45360);
  assert.deepEqual(canvas, { width: 4096, height: 585 });
  assert(Math.abs((45360 * scale) / (6480 * scale) - 7) < 1e-12);
});

test('large square pages are limited by total pixels before their side reaches 4096', () => {
  const { scale, canvas } = assertWithinBudget(4000, 4000, 1.5);
  assert.deepEqual(canvas, { width: 2896, height: 2896 });
  assert(Math.abs(4000 * scale - Math.sqrt(8_388_608)) < 1e-9);
  assert(4000 * scale < 4096);
  assert.equal(getPdfRenderScale(4096, 4096, 0.5), 0.5);
});

test('rotated viewport dimensions and requested scales share the same page budget', () => {
  for (const preferredScale of [0.01, 0.1, 1, 1.5, 3]) {
    const portrait = assertWithinBudget(6480, 45360, preferredScale);
    const landscape = assertWithinBudget(45360, 6480, preferredScale);
    assert.equal(portrait.scale, landscape.scale);
    assert.equal(portrait.canvas.width, landscape.canvas.height);
    assert.equal(portrait.canvas.height, landscape.canvas.width);
    if (preferredScale === 0.01) assert.equal(portrait.scale, preferredScale);
  }
});

test('UserUnit is already reflected in the supplied scale-1 viewport dimensions', () => {
  // A 612 × 792 point page with UserUnit 75 has this PDF.js scale-1 viewport.
  assert.equal(getPdfRenderScale(612, 792, 1.5), 1.5);
  const { scale, canvas } = assertWithinBudget(45900, 59400, 1.5);
  assert.deepEqual(canvas, { width: 2545, height: 3294 });
  assert(Math.abs(59400 * scale - 3294.8210341472) < 1e-9);
  assert(Math.abs((45900 * scale) / (59400 * scale) - 17 / 22) < 1e-12);
});

test('extreme aspect ratios use a one-pixel minimum without exceeding either budget', () => {
  const wide = assertWithinBudget(1e300, 1e-300, 1.5);
  const tall = assertWithinBudget(1e-300, 1e300, 1.5);
  assert.deepEqual(wide.canvas, { width: 4096, height: 1 });
  assert.deepEqual(tall.canvas, { width: 1, height: 4096 });
  assertWithinBudget(Number.MAX_VALUE, Number.MAX_VALUE, 1.5);
  assert.equal(getPdfRenderScale(Number.MIN_VALUE, Number.MIN_VALUE, 0.125), 0.125);
});

test('small pages and preferred scales below one are never enlarged to fill a budget', () => {
  for (const preferredScale of [Number.MIN_VALUE, 0.01, 0.75, 1, 1.5, 10]) {
    assert.equal(getPdfRenderScale(10, 20, preferredScale), preferredScale);
  }
  assert.equal(getPdfRenderScale(45360, 6480, 0.05), 0.05);
});

test('a deterministic grid of finite dimensions produces bounded nonempty canvas sizes', () => {
  const dimensions = [
    Number.MIN_VALUE, 1e-300, 1e-10, 0.5, 1, 16, 595.28, 841.89,
    2048, 4096, 6480, 45360, 1e9, 1e150, Number.MAX_VALUE,
  ];
  const scales = [Number.MIN_VALUE, 0.125, 1, 1.5, 2, 6, 1e150, Number.MAX_VALUE];
  for (const width of dimensions) {
    for (const height of dimensions) {
      for (const preferredScale of scales) assertWithinBudget(width, height, preferredScale);
    }
  }
});

test('invalid dimensions or requested scales fail explicitly before allocating a canvas', () => {
  const invalid = [0, -0, -1, NaN, Infinity, -Infinity, undefined, null, '1'];
  for (let index = 0; index < 3; index++) {
    for (const value of invalid) {
      const input = [595.28, 841.89, 1.5];
      input[index] = value;
      assert.throws(() => getPdfRenderScale(...input), {
        name: 'RangeError', message: /positive finite numbers/,
      });
    }
  }
});
