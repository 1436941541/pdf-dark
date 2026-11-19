import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanBackground, cleanBackgroundWithMeta, filterPhotoRects, restorePhotoRects } from '../lib/background.ts';

const options = { strength: 65, preserveColors: true };
function fixture(paper = [220, 220, 220], w = 160, h = 120) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) data.set([...paper, 255], i);
  return { data, w, h };
}
const at = (data, w, x, y) => Array.from(data.subarray((y * w + x) * 4, (y * w + x) * 4 + 3));
function patch(f, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) f.data.set([...color, 255], ((y + dy) * f.w + x + dx) * 4);
}

test('whitens gray paper and keeps dark text', () => {
  const f = fixture();
  patch(f, 30, 30, 60, 5, [30, 30, 30]);
  const res = cleanBackgroundWithMeta(f.data, f.w, f.h, options);
  assert.equal(res.outcome, 'cleaned');
  assert(at(f.data, f.w, 10, 10)[0] > 240);
  assert.deepEqual(at(f.data, f.w, 50, 32), [30, 30, 30]);
});

test('neutralizes yellow paper instead of merely removing all color', () => {
  const f = fixture([235, 220, 175]);
  cleanBackground(f.data, f.w, f.h, { ...options, strength: 100 });
  const p = at(f.data, f.w, 20, 20);
  assert(p.every((v) => v >= 253), String(p));
});

test('faint strokes retain and gain contrast', () => {
  const f = fixture();
  patch(f, 30, 30, 60, 3, [200, 200, 200]);
  cleanBackground(f.data, f.w, f.h, options);
  assert(at(f.data, f.w, 20, 20)[0] - at(f.data, f.w, 50, 31)[0] > 25);
});

test('color protection keeps a blue stamp and yellow highlight', () => {
  const f = fixture();
  patch(f, 20, 20, 35, 30, [35, 65, 185]);
  patch(f, 85, 20, 45, 30, [250, 230, 70]);
  cleanBackground(f.data, f.w, f.h, options);
  assert.deepEqual(at(f.data, f.w, 30, 30), [35, 65, 185]);
  assert.deepEqual(at(f.data, f.w, 100, 30), [250, 230, 70]);
});

test('zero strength preserves every pixel and opaque white remains white', () => {
  const f = fixture();
  const before = f.data.slice();
  cleanBackground(f.data, f.w, f.h, { ...options, strength: 0 });
  assert.deepEqual(f.data, before);
  const white = fixture([255, 255, 255]);
  cleanBackground(white.data, white.w, white.h, options);
  assert.deepEqual(at(white.data, white.w, 10, 10), [255, 255, 255]);
});

test('mild uneven illumination improves without making binary pixels', () => {
  const f = fixture();
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      const v = 160 + Math.round((x / f.w) * 60);
      f.data.set([v, v, v, 255], (y * f.w + x) * 4);
    }
  }
  const res = cleanBackgroundWithMeta(f.data, f.w, f.h, { ...options, strength: 100 });
  assert.equal(res.outcome, 'cleaned');
  assert(at(f.data, f.w, 20, 20)[0] > 210);
  assert(new Set(f.data.filter((_, i) => i % 4 === 0)).size > 2);
});

test('dark pages report dark_page and stay unchanged; invalid sizes are rejected', () => {
  const f = fixture([40, 40, 40]);
  const before = f.data.slice();
  const res = cleanBackgroundWithMeta(f.data, f.w, f.h, options);
  assert.equal(res.outcome, 'dark_page');
  assert.deepEqual(f.data, before);
  assert.throws(() => cleanBackground(f.data, 0, 1, options));
});

test('auto-protects full-page grayscale and color photos unless forced clean', () => {
  // Grayscale landscape photo: bright sky on top + textured dark/midtone hills below
  const bwPhoto = fixture([200, 200, 200], 200, 240);
  for (let y = 0; y < bwPhoto.h; y++) {
    for (let x = 0; x < bwPhoto.w; x++) {
      const sky = y < 100
        ? 215 - y * 0.35 + 22 * Math.sin(x / 18)
        : 92 + 45 * Math.sin(x / 11) * Math.cos(y / 14);
      const v = Math.max(20, Math.min(248, Math.round(sky)));
      bwPhoto.data.set([v, v, v, 255], (y * bwPhoto.w + x) * 4);
    }
  }
  const beforeBw = bwPhoto.data.slice();
  const autoRes = cleanBackgroundWithMeta(bwPhoto.data, bwPhoto.w, bwPhoto.h, options);
  assert.equal(autoRes.outcome, 'photo_page');
  assert.deepEqual(bwPhoto.data, beforeBw);

  // Forcing clean (protectPhotos: false) overrides auto-skip on that page
  const forcedRes = cleanBackgroundWithMeta(bwPhoto.data, bwPhoto.w, bwPhoto.h, { ...options, protectPhotos: false });
  assert.equal(forcedRes.outcome, 'cleaned');
  assert.notDeepEqual(bwPhoto.data, beforeBw);
});

test('dense noisy scan paper is cleaned rather than misclassified as a photo', () => {
  const scan = fixture([210, 206, 198], 220, 280);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < scan.h; y++) {
    for (let x = 0; x < scan.w; x++) {
      const isText = y > 20 && y < 260 && y % 12 < 2 && x > 20 && x < 200 && (x * 5 + y) % 17 > 3;
      const v = isText ? 42 : Math.round(208 + (rnd() - 0.5) * 28);
      scan.data.set([v, v - 3, v - 7, 255], (y * scan.w + x) * 4);
    }
  }
  let sumBefore = 0, sumAfter = 0;
  for (let x = 10; x < 110; x++) sumBefore += at(scan.data, scan.w, x, 8)[0];
  const res = cleanBackgroundWithMeta(scan.data, scan.w, scan.h, options);
  for (let x = 10; x < 110; x++) sumAfter += at(scan.data, scan.w, x, 8)[0];
  assert.equal(res.outcome, 'cleaned');
  assert(sumAfter / 100 >= sumBefore / 100 + 14, `${sumBefore / 100} -> ${sumAfter / 100}`);
});

test('filterPhotoRects keeps embedded photos intact while letting gray scan snippets whiten', () => {
  const page = fixture([222, 220, 214], 240, 300);
  // Embedded photo rect at (20, 20, 80, 90): rich darks, midtones, and color
  const photoRect = { x: 20, y: 20, w: 80, h: 90 };
  for (let dy = 0; dy < photoRect.h; dy++) {
    for (let dx = 0; dx < photoRect.w; dx++) {
      const r = Math.round(70 + 110 * (dx / photoRect.w));
      const g = Math.round(90 + 80 * (dy / photoRect.h));
      const b = 155;
      page.data.set([r, g, b, 255], ((photoRect.y + dy) * page.w + (photoRect.x + dx)) * 4);
    }
  }
  // Embedded gray-paper signature snippet at (130, 180, 90, 60): flat gray paper + thin dark ink
  const snippetRect = { x: 130, y: 180, w: 90, h: 60 };
  patch(page, snippetRect.x, snippetRect.y, snippetRect.w, snippetRect.h, [218, 218, 218]);
  patch(page, snippetRect.x + 10, snippetRect.y + 28, 70, 3, [35, 35, 35]);

  const original = page.data.slice();
  const kept = filterPhotoRects(original, page.w, page.h, [photoRect, snippetRect]);
  assert.equal(kept.length, 1);
  assert.deepEqual(kept[0], photoRect);

  const res = cleanBackgroundWithMeta(page.data, page.w, page.h, options);
  assert.equal(res.outcome, 'cleaned');
  restorePhotoRects(page.data, original, page.w, page.h, kept);

  // Embedded photo pixel restored byte-for-byte
  assert.deepEqual(at(page.data, page.w, 60, 65), at(original, page.w, 60, 65));
  // Embedded gray snippet paper (218) was whitened along with the page (~238 at 65% strength)
  assert(at(page.data, page.w, 140, 190)[0] >= 235);
});
