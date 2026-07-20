// The single source of truth for the dark-mode color mapping, in scalar form.
// lib/dark-worker.ts and lib/pixel-dark.ts keep an inlined per-pixel copy of
// this exact math for speed (allocating a tuple per pixel would thrash GC) —
// if you change the formula here, change it there too.
//
// Mapping policy:
// - Near-grayscale colors are pulled toward the theme background by
//   luminance: white → theme bg, black → white.
// - Chromatic colors keep their hue and get their lightness flipped, so a
//   dark-blue heading becomes light-blue instead of monochrome gray.

import type { ThemeId } from "./themes";

export const THEME_RGB: Record<ThemeId, { r: number; g: number; b: number }> = {
  midnight: { r: 25, g: 30, b: 45 },
  sepia: { r: 40, g: 35, b: 25 },
  solarized: { r: 0, g: 43, b: 54 },
  oled: { r: 0, g: 0, b: 0 },
};

/** Darkness slider floor — below ~50% the page stops reading as dark mode. */
export const DARKNESS_MIN = 0.5;

/**
 * Theme background lifted toward white as darkness drops below 1. This is
 * what the Darkness slider controls: 1 = the theme as designed, lower =
 * a softer, lighter page for users who find full dark too harsh.
 */
export function effectiveThemeBg(
  theme: ThemeId,
  darkness = 1,
): { r: number; g: number; b: number } {
  const { r, g, b } = THEME_RGB[theme];
  const lift = 1 - Math.min(1, Math.max(DARKNESS_MIN, darkness));
  return {
    r: r + (255 - r) * lift,
    g: g + (255 - g) * lift,
    b: b + (255 - b) * lift,
  };
}

/** Below this saturation a color counts as grayscale. */
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

/** Maps one 0-255 RGB color to its dark-theme counterpart (0-255). */
export function mapColor(
  r: number,
  g: number,
  b: number,
  theme: ThemeId,
  darkness = 1,
): [number, number, number] {
  const { r: bgR, g: bgG, b: bgB } = effectiveThemeBg(theme, darkness);

  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  const factor = 1 - brightness / 255;

  const aR = bgR + (255 - bgR) * factor;
  const aG = bgG + (255 - bgG) * factor;
  const aB = bgB + (255 - bgB) * factor;

  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const sat = (mx - mn) / 255;

  if (sat <= CHROMA_LO) return [aR, aG, aB];

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

  const w = Math.min(1, Math.max(0, (sat - CHROMA_LO) / (CHROMA_HI - CHROMA_LO)));
  return [aR + (hR - aR) * w, aG + (hG - aG) * w, aB + (hB - aB) * w];
}

/** Strongest veil the smart image dimmer will apply. */
export const IMAGE_DIM_MAX = 0.18;

/**
 * Smart-dim curve for preserved images: how much black veil (0..IMAGE_DIM_MAX)
 * an image gets on a dark page, from its average luminance (0-255).
 * White-background figures (bright) get the full veil so they don't glare at
 * night; photos (mid/dark) stay essentially untouched. Unknown brightness
 * falls back to a mild fixed veil.
 */
export function imageDimAlpha(brightness?: number): number {
  if (brightness === undefined) return 0.16;
  const t = (brightness - 120) / (230 - 120);
  return Math.min(1, Math.max(0, t)) * IMAGE_DIM_MAX;
}

/** What the Auto mode decides to do with one image. */
export type ImageTreatment = "keep" | "dim" | "invert";

/**
 * The Auto classifier: picks the best of the three manual treatments per
 * image from its measured features.
 * - bright AND essentially colorless → a document-like figure (screenshot,
 *   table, diagram exported as an image): invert it with the page — a veil
 *   would only turn the glare gray, inversion makes it blend in.
 * - bright but colorful → veil (brightness-based, see imageDimAlpha).
 * - mid/dark → a photo: keep as-is.
 * Unknown features (measurement failed) → mild veil, the safe middle.
 */
export function classifyImage(
  brightness?: number,
  saturation?: number,
): ImageTreatment {
  if (brightness === undefined) return "dim";
  if (brightness >= 190 && (saturation ?? 1) < 0.12) return "invert";
  if (brightness < 150) return "keep";
  return "dim";
}
