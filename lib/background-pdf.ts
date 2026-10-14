import type { PDFDocumentProxy } from "pdfjs-dist";
import type { BackgroundSettings } from "./background";
import { checkCancelled } from "./monochrome-pdf";
import { yieldToMain } from "./main-thread";
export { loadDeskewPdf as loadBackgroundPdf } from "./deskew-pdf";

export function createBackgroundProcessor() {
  const worker = new Worker(new URL("./background-worker.ts", import.meta.url), { type: "module" });
  let serial = 0, disposed = false;
  const pending = new Map<number, { resolve: (data: Uint8ClampedArray<ArrayBuffer>) => void; reject: (error: Error) => void }>();
  const dispose = () => {
    disposed = true; worker.terminate();
    for (const task of pending.values()) task.reject(new DOMException("Cleaning cancelled", "AbortError"));
    pending.clear();
  };
  worker.onmessage = ({ data }: MessageEvent<{ id: number; buffer?: ArrayBuffer; error?: string }>) => {
    const task = pending.get(data.id);
    if (data.error || !data.buffer) task?.reject(new Error(data.error ?? "Could not clean the page."));
    else task?.resolve(new Uint8ClampedArray(data.buffer));
    pending.delete(data.id);
  };
  worker.onerror = () => {
    for (const task of pending.values()) task.reject(new Error("Background cleaning could not start. Reload or try another browser."));
    pending.clear(); dispose();
  };
  return {
    process(data: Uint8ClampedArray<ArrayBuffer>, width: number, height: number, settings: BackgroundSettings) {
      if (disposed) return Promise.reject(new DOMException("Cleaning cancelled", "AbortError"));
      const id = ++serial;
      return new Promise<Uint8ClampedArray<ArrayBuffer>>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        try { worker.postMessage({ id, buffer: data.buffer, width, height, settings }, [data.buffer]); }
        catch (error) { pending.delete(id); reject(error); }
      });
    }, dispose,
  };
}

async function renderPage(pdf: PDFDocumentProxy, number: number, settings: BackgroundSettings, signal: AbortSignal, preview: boolean, quality: "standard" | "compact" = "standard") {
  checkCancelled(signal);
  const page = await pdf.getPage(number); checkCancelled(signal);
  const size = page.getViewport({ scale: 1 });
  const scale = preview ? Math.min(1.25, 1100 / Math.max(size.width, size.height)) : Math.min(quality === "compact" ? 1 : 2, 8192 / Math.max(size.width, size.height), Math.sqrt(15980000 / (size.width * size.height)));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser does not support PDF previews.");
  const task = page.render({ canvas, canvasContext: ctx, viewport, background: "rgb(255,255,255)" });
  const cancel = () => task.cancel(); signal.addEventListener("abort", cancel, { once: true });
  let processor: ReturnType<typeof createBackgroundProcessor> | null = null;
  try {
    checkCancelled(signal); await task.promise; checkCancelled(signal);
    const original = preview ? canvas.toDataURL("image/png") : "";
    if (settings.strength > 0) {
      processor = createBackgroundProcessor();
      const abortWorker = () => processor?.dispose(); signal.addEventListener("abort", abortWorker, { once: true });
      try {
        checkCancelled(signal);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const cleaned = await processor.process(pixels.data, canvas.width, canvas.height, settings);
        checkCancelled(signal); ctx.putImageData(new ImageData(cleaned, canvas.width, canvas.height), 0, 0);
      } finally { signal.removeEventListener("abort", abortWorker); processor.dispose(); }
    }
    checkCancelled(signal);
    return { canvas, original, width: size.width, height: size.height };
  } catch (error) { canvas.width = canvas.height = 0; throw error; }
  finally { signal.removeEventListener("abort", cancel); }
}
export async function previewBackgroundPdf(pdf: PDFDocumentProxy, page: number, settings: BackgroundSettings, signal: AbortSignal) {
  const result = await renderPage(pdf, page, settings, signal, true);
  try { checkCancelled(signal); return { original: result.original, converted: result.canvas.toDataURL("image/png") }; }
  finally { result.canvas.width = result.canvas.height = 0; }
}
async function pngBytes(canvas: HTMLCanvasElement) {
  return new Promise<Uint8Array>((resolve, reject) => canvas.toBlob(async (blob) => {
    if (!blob) { reject(new Error("Could not encode the cleaned page.")); return; }
    try { resolve(new Uint8Array(await blob.arrayBuffer())); } catch (error) { reject(error); }
  }, "image/png"));
}
export async function exportBackgroundPdf(pdf: PDFDocumentProxy, settings: BackgroundSettings, skipped: Set<number>, quality: "standard" | "compact", signal: AbortSignal, onProgress: (done: number) => void) {
  const { PDFDocument } = await import("pdf-lib");
  const output = await PDFDocument.create(); output.setCreator("PDF Dark — PDF Background Remover");
  for (let number = 1; number <= pdf.numPages; number++) {
    const result = await renderPage(pdf, number, skipped.has(number) ? { ...settings, strength: 0 } : settings, signal, false, quality);
    try {
      const bytes = await pngBytes(result.canvas); checkCancelled(signal);
      const image = await output.embedPng(bytes); checkCancelled(signal);
      output.addPage([result.width, result.height]).drawImage(image, { x: 0, y: 0, width: result.width, height: result.height });
      onProgress(number);
    } finally { result.canvas.width = result.canvas.height = 0; }
    await yieldToMain();
  }
  checkCancelled(signal); const bytes = await output.save(); checkCancelled(signal); return bytes;
}
