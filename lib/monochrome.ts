export type MonochromeMode = "grayscale" | "black-and-white";

export type MonochromeSettings = {
  mode: MonochromeMode;
  threshold: number;
};

/** Composite transparency onto white before removing color. */
export function monochromePixels(
  pixels: Uint8ClampedArray,
  { mode, threshold }: MonochromeSettings,
): Uint8ClampedArray {
  const cutoff = Math.min(255, Math.max(0, threshold));
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    const luminance = Math.round(
      (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]) * alpha +
      255 * (1 - alpha),
    );
    const value = mode === "grayscale" ? luminance : luminance < cutoff ? 0 : 255;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
    pixels[i + 3] = 255;
  }
  return pixels;
}

export type MonochromeRequest = {
  id: number;
  buffer: ArrayBuffer;
  settings: MonochromeSettings;
};
export type MonochromeResponse = { id: number; buffer: ArrayBuffer };
