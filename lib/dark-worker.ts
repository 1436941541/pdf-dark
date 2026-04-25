/// <reference lib="webworker" />
//
// Web Worker that converts a color PDF-page bitmap into a dark-themed JPEG,
// while preserving pixels that look like photos/graphics (high saturation).
//
// Self-contained on purpose — worker modules can be tricky to share code with
// the main bundle. Keep the pixel algorithm in sync with any server/main-thread
// reference implementation.

export type ThemeId = "midnight" | "sepia" | "solarized" | "oled";

const SAT_THRESHOLD = 0.18;

function colorize(v: number, theme: ThemeId): [number, number, number] {
  switch (theme) {
    case "midnight":
      return [v, v, v];
    case "sepia":
      return [
        Math.round(v * 1.0),
        Math.round(v * 0.93),
        Math.round(v * 0.78),
      ];
    case "solarized":
      return [
        Math.round(v * 0.86),
        Math.round(v * 0.95),
        Math.round(v * 0.95),
      ];
    case "oled": {
      const boosted = v < 20 ? 0 : Math.min(255, Math.round(v * 1.08));
      return [boosted, boosted, boosted];
    }
  }
}

function applySmartDark(data: Uint8ClampedArray, theme: ThemeId): void {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const mx = r > g ? (r > b ? r : b) : g > b ? g : b;
    const mn = r < g ? (r < b ? r : b) : g < b ? g : b;
    const sat = mx === 0 ? 0 : (mx - mn) / mx;

    if (sat < SAT_THRESHOLD) {
      const v = 255 - mx;
      const [nr, ng, nb] = colorize(v, theme);
      data[i] = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
    }
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
    // Release bitmap early — main thread already transferred ownership.
    bitmap.close?.();

    const img = c2d.getImageData(0, 0, width, height);
    applySmartDark(img.data, theme);
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
