/// <reference lib="webworker" />
//
// Web Worker that converts a color PDF-page bitmap into a dark-themed JPEG.
//
// Pixel algorithm is kept byte-for-byte identical to
// https://github.com/Chizkiyahu/pdf-dark-mode-converter (index.html). Every
// pixel is pulled toward the theme background by its luminance — text and
// images alike. Simple, consistent, no edge artifacts on colored text.

export type ThemeId = "midnight" | "sepia" | "solarized" | "oled";

const THEME_RGB: Record<ThemeId, { r: number; g: number; b: number }> = {
  midnight: { r: 25, g: 30, b: 45 },
  sepia: { r: 40, g: 35, b: 25 },
  solarized: { r: 0, g: 43, b: 54 },
  oled: { r: 0, g: 0, b: 0 },
};

function applyDark(data: Uint8ClampedArray, theme: ThemeId): void {
  const { r: bgR, g: bgG, b: bgB } = THEME_RGB[theme];
  const len = data.length;
  for (let j = 0; j < len; j += 4) {
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];

    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    const factor = 1 - brightness / 255;

    data[j] = bgR + (255 - bgR) * factor;
    data[j + 1] = bgG + (255 - bgG) * factor;
    data[j + 2] = bgB + (255 - bgB) * factor;
  }
}

export type DarkifyRequest = {
  id: number;
  bitmap: ImageBitmap;
  width: number;
  height: number;
  theme: ThemeId;
};

export type DarkifyResponse = {
  id: number;
  blob: Blob;
};

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<DarkifyRequest>) => {
  const { id, bitmap, width, height, theme } = e.data;
  try {
    const canvas = new OffscreenCanvas(width, height);
    const c2d = canvas.getContext("2d");
    if (!c2d) throw new Error("OffscreenCanvas 2d context unavailable");

    c2d.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const img = c2d.getImageData(0, 0, width, height);
    applyDark(img.data, theme);
    c2d.putImageData(img, 0, 0);

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
