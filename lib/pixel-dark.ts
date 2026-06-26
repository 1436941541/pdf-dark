import { THEMES, type ThemeId } from "./themes";

/**
 * Pixel algorithm mirrored on the main thread for non-worker callers. Kept
 * byte-for-byte identical to lib/dark-worker.ts and to
 * https://github.com/Chizkiyahu/pdf-dark-mode-converter.
 */
export function applyDark(imageData: ImageData, theme: ThemeId): void {
  const { r: bgR, g: bgG, b: bgB } = THEMES[theme];
  const data = imageData.data;
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

export async function darkifyDataUrl(
  originalDataUrl: string,
  width: number,
  height: number,
  theme: ThemeId,
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
  applyDark(imageData, theme);
  ctx.putImageData(imageData, 0, 0);

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
