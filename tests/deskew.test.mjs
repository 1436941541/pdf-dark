import test from "node:test";
import assert from "node:assert/strict";
import { detectDeskew } from "../lib/deskew.ts";

function page({ angle = 0, lines = 12, background = 255, noise = false } = {}) {
  const width = 560, height = 650;
  const source = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < source.length; i += 4) {
    source[i] = source[i + 1] = source[i + 2] = background;
    source[i + 3] = 255;
  }
  // Unequal character shapes and word gaps, rather than identical long horizontal rules.
  for (let line = 0; line < lines; line++) {
    let x = 60;
    for (let character = 0; character < 46; character++) {
      const w = 3 + character % 5, h = 7 + character % 3;
      for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
        if (dx > 0 && dx < w - 1 && dy > 1 && dy < h - 2 && character % 3 === 0) continue;
        const offset = ((75 + line * 30 + dy) * width + x + dx) * 4;
        source[offset] = source[offset + 1] = source[offset + 2] = 40;
      }
      x += w + 3 + (character % 7 === 0 ? 5 : 0);
    }
  }
  if (noise) {
    let seed = 177;
    for (let i = 0; i < 1200; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const offset = (seed % (width * height)) * 4;
      source[offset] = source[offset + 1] = source[offset + 2] = 0;
    }
  }
  const output = new Uint8ClampedArray(source.length);
  const radians = angle * Math.PI / 180, cos = Math.cos(radians), sin = Math.sin(radians);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const sx = Math.round((x - width / 2) * cos + (y - height / 2) * sin + width / 2);
    const sy = Math.round(-(x - width / 2) * sin + (y - height / 2) * cos + height / 2);
    const offset = (y * width + x) * 4;
    const value = sx >= 0 && sx < width && sy >= 0 && sy < height ? source[(sy * width + sx) * 4] : background;
    output[offset] = output[offset + 1] = output[offset + 2] = value;
    output[offset + 3] = 255;
  }
  return { output, width, height };
}

for (const angle of [-5.5, -3, -1.5, 1.5, 3, 5.5]) {
  test(`detects correction opposite to a ${angle} degree scan skew`, () => {
    const { output, width, height } = page({ angle });
    const result = detectDeskew(output, width, height);
    assert.equal(result.status, "detected", result.reason);
    assert.ok(Math.abs(result.angle + angle) <= 0.3, `correction ${result.angle}`);
  });
}

test("keeps a straight page straight", () => {
  const { output, width, height } = page();
  assert.equal(detectDeskew(output, width, height).status, "straight");
});
test("detects skew on gray paper with isolated scanner speckles", () => {
  const { output, width, height } = page({ angle: 2.7, background: 218, noise: true });
  const result = detectDeskew(output, width, height);
  assert.equal(result.status, "detected", result.reason);
  assert.ok(Math.abs(result.angle + 2.7) <= 0.3);
});
test("blank and sparse pages require manual adjustment", () => {
  for (const lines of [0, 1, 2]) {
    const { output, width, height } = page({ lines, angle: 3 });
    assert.equal(detectDeskew(output, width, height).status, "uncertain");
  }
});
test("does not force an angle for random photographic texture", () => {
  const { output, width, height } = page({ lines: 0 });
  let seed = 987;
  for (let i = 0; i < output.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const value = seed >>> 24;
    output[i] = output[i + 1] = output[i + 2] = value;
  }
  assert.equal(detectDeskew(output, width, height).status, "uncertain");
});
test("transparent black pixels are treated as white paper", () => {
  const output = new Uint8ClampedArray(100 * 100 * 4);
  assert.equal(detectDeskew(output, 100, 100).status, "uncertain");
});
test("out-of-range and malformed samples return a safe zero angle", () => {
  assert.equal(detectDeskew(new Uint8ClampedArray(4), 1, 1).angle, 0);
  const { output, width, height } = page({ angle: 10 });
  assert.equal(detectDeskew(output, width, height).status, "uncertain");
});
