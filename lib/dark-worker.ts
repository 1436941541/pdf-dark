/// <reference lib="webworker" />
//
// Web Worker that converts a color PDF-page bitmap into a dark-themed JPEG.
//
// Pixel algorithm (keep byte-for-byte identical to lib/pixel-dark.ts):
// - Near-grayscale pixels (regular text, white background) are pulled toward
//   the theme background by luminance — same as the original algorithm.
// - Chromatic pixels (colored headings, chart lines, highlights) keep their
//   hue and get their lightness flipped instead, so a dark-blue heading
//   becomes light-blue rather than monochrome gray.
// After darkening, the rects of raster images (computed on the main thread
// from pdf.js's operator list, see lib/image-regions.ts) are pasted back from
// the original bitmap with a mild dim, so photos stay photos, not negatives.

import type { ImageRect } from "./image-regions";

export type ThemeId = "midnight" | "sepia" | "solarized" | "oled";

const THEME_RGB: Record<ThemeId, { r: number; g: number; b: number }> = {
  midnight: { r: 25, g: 30, b: 45 },
  sepia: { r: 40, g: 35, b: 25 },
  solarized: { r: 0, g: 43, b: 54 },
  oled: { r: 0, g: 0, b: 0 },
};

/** Below this saturation a pixel counts as grayscale (fast path). */
const CHROMA_LO = 0.08;
/** Above this saturation the hue-preserving path fully takes over. */
const CHROMA_HI = 0.3;

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function applyDark(data: Uint8ClampedArray, theme: ThemeId, darkness = 1): void {
  // Darkness slider: lift the theme background toward white (keep in sync
  // with effectiveThemeBg in lib/dark-color.ts).
  const bg = THEME_RGB[theme];
  const lift = 1 - Math.min(1, Math.max(0.5, darkness));
  const bgR = bg.r + (255 - bg.r) * lift;
  const bgG = bg.g + (255 - bg.g) * lift;
  const bgB = bg.b + (255 - bg.b) * lift;
  const len = data.length;
  for (let j = 0; j < len; j += 4) {
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];

    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    const factor = 1 - brightness / 255;

    // Grayscale mapping: white → theme bg, black → white.
    const aR = bgR + (255 - bgR) * factor;
    const aG = bgG + (255 - bgG) * factor;
    const aB = bgB + (255 - bgB) * factor;

    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const sat = (mx - mn) / 255;

    if (sat <= CHROMA_LO) {
      data[j] = aR;
      data[j + 1] = aG;
      data[j + 2] = aB;
      continue;
    }

    // Hue-preserving flip: same hue/saturation, lightness remapped into a
    // range that reads well on all (dark) theme backgrounds. Dark saturated
    // colors become light; light ones settle in the middle.
    const l = (mx + mn) / 510;
    const d = (mx - mn) / 255;
    const s = d / (1 - Math.abs(2 * l - 1) || 1);
    let h: number;
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    if (mx === r) h = (((gn - bn) / d) % 6) / 6;
    else if (mx === g) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
    if (h < 0) h += 1;

    const l2 = 0.92 - 0.42 * l;
    const q = l2 < 0.5 ? l2 * (1 + s) : l2 + s - l2 * s;
    const p = 2 * l2 - q;
    const hR = hueToRgb(p, q, h + 1 / 3) * 255;
    const hG = hueToRgb(p, q, h) * 255;
    const hB = hueToRgb(p, q, h - 1 / 3) * 255;

    // Blend the two paths across the chroma band so anti-aliased edges of
    // colored text don't get a hard seam.
    const w = Math.min(1, Math.max(0, (sat - CHROMA_LO) / (CHROMA_HI - CHROMA_LO)));
    data[j] = aR + (hR - aR) * w;
    data[j + 1] = aG + (hG - aG) * w;
    data[j + 2] = aB + (hB - aB) * w;
  }
}

export type DarkifyRequest = {
  id: number;
  bitmap: ImageBitmap;
  width: number;
  height: number;
  theme: ThemeId;
  /** Darkness slider value 0.5–1; 1 (default) = the theme as designed. */
  darkness?: number;
  /** Canvas-space rects of raster images to restore from the original bitmap. */
  imageRects?: ImageRect[];
  /** Per-rect veil opacity (parallel to imageRects); 0 = keep the image
   *  fully original. Computed on the main thread so downloads reuse the
   *  exact same numbers. Missing → mild fixed veil. */
  imageDims?: number[];
};

export type DarkifyResponse = {
  id: number;
  blob: Blob;
};

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<DarkifyRequest>) => {
  const { id, bitmap, width, height, theme, darkness, imageRects, imageDims } =
    e.data;
  try {
    const canvas = new OffscreenCanvas(width, height);
    const c2d = canvas.getContext("2d");
    if (!c2d) throw new Error("OffscreenCanvas 2d context unavailable");

    c2d.drawImage(bitmap, 0, 0, width, height);

    const img = c2d.getImageData(0, 0, width, height);
    applyDark(img.data, theme, darkness ?? 1);
    c2d.putImageData(img, 0, 0);

    // Paste the original image regions back, then veil them. Circular /
    // rounded avatars (r.rounded) paste through an inscribed ellipse so the
    // clipped-away corners don't resurrect the light page background.
    // Rect pastes sharing an opacity are veiled through one combined path so
    // overlaps are only dimmed once.
    if (imageRects && imageRects.length > 0) {
      for (const r of imageRects) {
        if (r.rounded) {
          c2d.save();
          c2d.beginPath();
          c2d.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
          c2d.clip();
          c2d.drawImage(bitmap, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
          c2d.restore();
        } else {
          c2d.drawImage(bitmap, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
        }
      }
      const byAlpha = new Map<number, ImageRect[]>();
      imageRects.forEach((r, idx) => {
        const a = Math.round((imageDims?.[idx] ?? 0.16) * 100) / 100;
        if (a > 0.005) {
          const group = byAlpha.get(a);
          if (group) group.push(r);
          else byAlpha.set(a, [r]);
        }
      });
      for (const [a, group] of byAlpha) {
        c2d.fillStyle = `rgba(0, 0, 0, ${a})`;
        c2d.beginPath();
        for (const r of group) {
          if (r.rounded) {
            c2d.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
          } else {
            c2d.rect(r.x, r.y, r.w, r.h);
          }
        }
        c2d.fill();
      }
    }
    bitmap.close?.();

    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.88,
    });

    const res: DarkifyResponse = { id, blob };
    ctx.postMessage(res);
  } catch (err) {
    console.error("[dark-worker] failed", err);
  }
};
