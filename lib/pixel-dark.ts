import { THEMES, type ThemeId } from "./themes";
import type { ImageRect } from "./image-regions";

/**
 * Pixel algorithm mirrored on the main thread for non-worker callers. Keep
 * byte-for-byte identical to lib/dark-worker.ts.
 *
 * - Near-grayscale pixels are pulled toward the theme background by
 *   luminance (the original Chizkiyahu-style mapping).
 * - Chromatic pixels keep their hue and get their lightness flipped, so
 *   colored headings/chart lines survive instead of going monochrome.
 */

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

export function applyDark(
  imageData: ImageData,
  theme: ThemeId,
  darkness = 1,
): void {
  // Darkness slider: lift the theme background toward white (keep in sync
  // with effectiveThemeBg in lib/dark-color.ts).
  const bg = THEMES[theme];
  const lift = 1 - Math.min(1, Math.max(0.5, darkness));
  const bgR = bg.r + (255 - bg.r) * lift;
  const bgG = bg.g + (255 - bg.g) * lift;
  const bgB = bg.b + (255 - bg.b) * lift;
  const data = imageData.data;
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

export async function darkifyDataUrl(
  originalDataUrl: string,
  width: number,
  height: number,
  theme: ThemeId,
  imageRects?: ImageRect[],
  imageDims?: number[],
  darkness = 1,
): Promise<string> {
  const img = await loadImage(originalDataUrl);
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
  const ctx = (canvas as HTMLCanvasElement).getContext("2d", {
    willReadFrequently: true,
  });
  if (!ctx) throw new Error("canvas 2d context unavailable");

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  applyDark(imageData, theme, darkness);
  ctx.putImageData(imageData, 0, 0);

  // Paste the original image regions back, then veil them. Circular /
  // rounded avatars (r.rounded) paste through an inscribed ellipse so the
  // clipped-away corners don't resurrect the light page background.
  // Rect pastes sharing an opacity are veiled through one combined path so
  // overlaps are only dimmed once.
  if (imageRects && imageRects.length > 0) {
    for (const r of imageRects) {
      if (r.rounded) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
        ctx.restore();
      } else {
        ctx.drawImage(img, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
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
      ctx.fillStyle = `rgba(0, 0, 0, ${a})`;
      ctx.beginPath();
      for (const r of group) {
        if (r.rounded) {
          ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
        } else {
          ctx.rect(r.x, r.y, r.w, r.h);
        }
      }
      ctx.fill();
    }
  }

  if (canvas instanceof HTMLCanvasElement) {
    return canvas.toDataURL("image/jpeg", 0.88);
  }
  const blob = await (canvas as OffscreenCanvas).convertToBlob({
    type: "image/jpeg",
    quality: 0.88,
  });
  return await blobToDataUrl(blob);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("blob read failed"));
    fr.readAsDataURL(blob);
  });
}
