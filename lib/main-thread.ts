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

/** Export keeps encoded pages as Blobs instead of Base64 strings. */
export function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      // Preserve the existing encoder fallback without a data-URL fetch.
      try {
        const url = canvas.toDataURL("image/jpeg", quality);
        if (!url.startsWith("data:image/jpeg;base64,")) {
          throw new Error("JPEG encoding failed");
        }
        const binary = atob(url.slice(url.indexOf(",") + 1));
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        resolve(new Blob([bytes], { type: "image/jpeg" }));
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
 */
export function canvasToJpegDataUrl(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(canvas.toDataURL("image/jpeg", quality));
          return;
        }
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(new Error("FileReader failed"));
        fr.readAsDataURL(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}
