// Helpers that keep the page responsive while PDFs render on the main thread.
// A tap that lands mid-render has to wait for whatever synchronous work is
// running; these shorten each such block so input gets handled in between.

/** Let pending input and paint run before continuing. */
export function yieldToMain(): Promise<void> {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } })
    .scheduler;
  if (s?.yield) return s.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function imageDataUrlParts(url: unknown): { type: string; base64: string } {
  if (typeof url !== "string") throw new Error("JPEG encoding failed");
  const comma = url.indexOf(",");
  const type = /^data:(image\/[a-z0-9.+-]+);base64$/i.exec(url.slice(0, comma))?.[1];
  const base64 = url.slice(comma + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  // Validate without decoding another full-size copy on the reader path.
  if (
    !type ||
    !/^[a-z0-9+/]+={0,2}$/i.test(base64) ||
    (base64.length - padding) % 4 === 1 ||
    (padding > 0 && base64.length % 4 !== 0)
  ) {
    throw new Error("JPEG encoding failed");
  }
  return { type, base64 };
}

/** Export keeps encoded pages as Blobs instead of Base64 strings. */
export function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      try {
        if (blob && blob.size > 0) {
          resolve(blob);
          return;
        }
        // Preserve the existing encoder fallback without a data-URL fetch.
        const url = canvas.toDataURL("image/jpeg", quality);
        const { type, base64 } = imageDataUrlParts(url);
        if (type.toLowerCase() !== "image/jpeg") throw new Error("JPEG encoding failed");
        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const encoded = new Blob([bytes], { type });
        if (encoded.size === 0) throw new Error("JPEG encoding failed");
        resolve(encoded);
      } catch (error) {
        reject(error);
      }
    }, "image/jpeg", quality);
  });
}

/**
 * Same result as `canvas.toDataURL("image/jpeg", quality)`, but the JPEG
 * encode runs off the main thread (`toBlob`) and the base64 step is async
 * (`FileReader`). Falls back to the sync call if `toBlob` gives nothing.
 * Browsers can return another image type, such as PNG, for either call.
 */
export function canvasToJpegDataUrl(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        try {
          if (!blob || blob.size === 0) {
            const url = canvas.toDataURL("image/jpeg", quality);
            imageDataUrlParts(url);
            resolve(url);
            return;
          }
          const fr = new FileReader();
          fr.onload = () => {
            try {
              imageDataUrlParts(fr.result);
              resolve(fr.result as string);
            } catch (error) {
              reject(error);
            }
          };
          fr.onerror = fr.onabort = () => reject(new Error("FileReader failed"));
          fr.readAsDataURL(blob);
        } catch (error) {
          // toBlob callbacks run asynchronously, outside the Promise executor.
          reject(error);
        }
      },
      "image/jpeg",
      quality,
    );
  });
}
