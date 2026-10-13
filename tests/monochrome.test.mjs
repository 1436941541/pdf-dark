import test from "node:test";
import assert from "node:assert/strict";
import { monochromePixels } from "../lib/monochrome.ts";

test("grayscale retains black and white while mapping primary colors to different tones", () => {
  const pixels = new Uint8ClampedArray([
    0, 0, 0, 255, 255, 255, 255, 255,
    255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255,
  ]);
  monochromePixels(pixels, { mode: "grayscale", threshold: 128 });
  assert.deepEqual([...pixels], [
    0, 0, 0, 255, 255, 255, 255, 255,
    76, 76, 76, 255, 150, 150, 150, 255, 29, 29, 29, 255,
  ]);
});

test("transparent colors composite onto white instead of making dark artifacts", () => {
  const pixels = new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 128]);
  monochromePixels(pixels, { mode: "grayscale", threshold: 128 });
  assert.deepEqual([...pixels], [255, 255, 255, 255, 127, 127, 127, 255]);
});

test("two-color conversion handles the threshold boundary and has no gray output", () => {
  const pixels = new Uint8ClampedArray([127, 127, 127, 255, 128, 128, 128, 255, 129, 129, 129, 255]);
  monochromePixels(pixels, { mode: "black-and-white", threshold: 128 });
  assert.deepEqual([...pixels], [0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
});

test("raising the threshold makes faint content black", () => {
  const sample = () => new Uint8ClampedArray([180, 180, 180, 255]);
  assert.equal(monochromePixels(sample(), { mode: "black-and-white", threshold: 128 })[0], 255);
  assert.equal(monochromePixels(sample(), { mode: "black-and-white", threshold: 200 })[0], 0);
});

test("grayscale is idempotent for existing gray pages", () => {
  const original = new Uint8ClampedArray([13, 13, 13, 255, 220, 220, 220, 255]);
  assert.deepEqual(monochromePixels(original.slice(), { mode: "grayscale", threshold: 128 }), original);
});
