import type { PDFDocumentProxy } from "pdfjs-dist";
import { monochromePixels, type MonochromeResponse, type MonochromeSettings } from "./monochrome";
import { drawInvisibleTextLayer } from "./text-layer";
import { yieldToMain } from "./main-thread";

export function checkCancelled(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Conversion cancelled", "AbortError");
}

export function createMonochromeProcessor() {
  let worker: Worker | null = null;
  let disposed = false;
  let workerUnavailable = false;
  let id = 0;
  const pending = new Map<number, { resolve: (data: Uint8ClampedArray<ArrayBuffer>) => void; reject: (error: Error) => void }>();
  const dispose = () => {
    disposed = true;
    worker?.terminate();
    worker = null;
    for (const task of pending.values()) task.reject(new DOMException("Conversion cancelled", "AbortError"));
    pending.clear();
  };
  function startWorker() {
    if (worker || workerUnavailable) return;
    try {
      // Start only when pixels are ready. A cancelled render never starts a
      // bootstrap request which would immediately be terminated again.
      const current = new Worker(new URL("./monochrome-worker.ts", import.meta.url), { type: "module" });
      worker = current;
      current.onmessage = ({ data }: MessageEvent<MonochromeResponse>) => {
        pending.get(data.id)?.resolve(new Uint8ClampedArray(data.buffer));
        pending.delete(data.id);
      };
      current.onerror = (event) => {
        if (disposed || worker !== current) {
          // Only intentional disposal is cancellation; genuine startup errors
          // below still reach the normal error UI and global monitoring.
          event.preventDefault();
          return;
        }
        for (const task of pending.values()) task.reject(new Error("The color conversion worker could not start. Please reload and try again."));
        pending.clear();
        worker = null;
        workerUnavailable = true;
        current.terminate();
      };
    } catch {
      // Browsers without module workers still support conversion on the main thread.
      workerUnavailable = true;
    }
  }
  return {
    async process(data: Uint8ClampedArray<ArrayBuffer>, settings: MonochromeSettings, signal?: AbortSignal) {
      const checkActive = () => {
        if (disposed) throw new DOMException("Conversion cancelled", "AbortError");
        if (signal) checkCancelled(signal);
      };
      checkActive();
      startWorker();
      if (!worker) {
        // Chunk the fallback so cancellation and other input can be handled.
        for (let offset = 0; offset < data.length; offset += 262144) {
          checkActive();
          monochromePixels(data.subarray(offset, offset + 262144), settings);
          await yieldToMain();
        }
        checkActive();
        return data;
      }
      const taskId = ++id;
      return new Promise<Uint8ClampedArray<ArrayBuffer>>((resolve, reject) => {
        const cleanup = () => signal?.removeEventListener("abort", cancel);
        const cancel = () => {
          pending.delete(taskId);
          cleanup();
          reject(new DOMException("Conversion cancelled", "AbortError"));
        };
        pending.set(taskId, {
          resolve: (pixels) => { cleanup(); resolve(pixels); },
          reject: (error) => { cleanup(); reject(error); },
        });
        // Cancelling one preview discards its response, preserving the worker
        // and any other tasks (including the current export).
        signal?.addEventListener("abort", cancel, { once: true });
        if (signal?.aborted) { cancel(); return; }
        try {
          worker!.postMessage({ id: taskId, buffer: data.buffer, settings }, [data.buffer]);
        } catch (error) {
          pending.delete(taskId);
          cleanup();
          reject(error);
        }
      });
    },
    dispose,
  };
}

export type MonochromeProcessor = ReturnType<typeof createMonochromeProcessor>;

export async function loadMonochromePdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url,
  ).toString();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    return await task.promise;
  } catch (error) {
    await task.destroy();
    throw error;
  }
}

async function renderPage(
  pdf: PDFDocumentProxy, pageNumber: number, settings: MonochromeSettings,
  processor: MonochromeProcessor, signal: AbortSignal, preview: boolean,
) {
  checkCancelled(signal);
  const page = await pdf.getPage(pageNumber);
  const size = page.getViewport({ scale: 1 });
  // Keep unusual page sizes within canvas and browser memory limits.
  const scale = preview
    ? Math.min(1.25, 1000 / Math.max(size.width, size.height))
    : Math.min(2, 8192 / Math.max(size.width, size.height), Math.sqrt(16000000 / (size.width * size.height)));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser does not support PDF previews.");
  const task = page.render({ canvas, canvasContext: ctx, viewport, background: "rgb(255,255,255)" });
  const cancel = () => task.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    checkCancelled(signal);
    await task.promise;
    checkCancelled(signal);
    const original = preview ? canvas.toDataURL("image/png") : "";
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = await processor.process(image.data, settings, signal);
    checkCancelled(signal);
    ctx.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);
    return { canvas, original, size, page };
  } catch (error) {
    canvas.width = canvas.height = 0;
    throw error;
  } finally {
    signal.removeEventListener("abort", cancel);
  }
}

export async function previewMonochromePdf(
  pdf: PDFDocumentProxy, pageNumber: number, settings: MonochromeSettings,
  processor: MonochromeProcessor, signal: AbortSignal,
) {
  const result = await renderPage(pdf, pageNumber, settings, processor, signal, true);
  try {
    return { original: result.original, converted: result.canvas.toDataURL("image/png") };
  } finally {
    result.canvas.width = result.canvas.height = 0;
  }
}

function pngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error("Could not encode the converted page.")); return; }
      try { resolve(new Uint8Array(await blob.arrayBuffer())); } catch (error) { reject(error); }
    }, "image/png");
  });
}

export async function exportMonochromePdf(
  pdf: PDFDocumentProxy, settings: MonochromeSettings, processor: MonochromeProcessor,
  signal: AbortSignal, onProgress: (done: number) => void,
) {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");
  const output = await PDFDocument.create();
  output.setCreator("PDF Dark — Black and White Converter");
  const font = await output.embedFont(StandardFonts.Helvetica);
  for (let index = 1; index <= pdf.numPages; index++) {
    const rendered = await renderPage(pdf, index, settings, processor, signal, false);
    try {
      const image = await output.embedPng(await pngBytes(rendered.canvas));
      checkCancelled(signal);
      // Use PDF points, not canvas pixels: retain physical page dimensions.
      const page = output.addPage([rendered.size.width, rendered.size.height]);
      page.drawImage(image, { x: 0, y: 0, width: rendered.size.width, height: rendered.size.height });
      await drawInvisibleTextLayer(page, font, rendered.page);
      checkCancelled(signal);
      onProgress(index);
    } finally {
      rendered.canvas.width = rendered.canvas.height = 0;
    }
    await yieldToMain();
  }
  checkCancelled(signal);
  const bytes = await output.save();
  checkCancelled(signal);
  return bytes;
}
