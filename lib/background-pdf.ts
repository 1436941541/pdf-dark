import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import type { BackgroundOutcome, BackgroundSettings, SimpleRect } from "./background";
import { checkCancelled } from "./monochrome-pdf";
import { yieldToMain } from "./main-thread";
import { associateBackgroundWorkerFailure, createBackgroundWorkerDiagnostics, type BackgroundWorkerDiagnosticOptions } from "./background-worker-diagnostics";
export { loadDeskewPdf as loadBackgroundPdf } from "./deskew-pdf";

type NormRect = { x0: number; y0: number; x1: number; y1: number };
type CachedImageScan = { normRects: NormRect[]; scanned: boolean };

const outcomes = new WeakMap<Uint8ClampedArray, BackgroundOutcome>();
const imageScanCache = new WeakMap<PDFDocumentProxy, Map<number, CachedImageScan>>();

async function getCachedPageImageScan(pdf: PDFDocumentProxy, page: PDFPageProxy, pageNumber: number, viewport: PageViewport): Promise<CachedImageScan> {
  let docMap = imageScanCache.get(pdf);
  if (!docMap) {
    docMap = new Map();
    imageScanCache.set(pdf, docMap);
  }
  const existing = docMap.get(pageNumber);
  if (existing) return existing;
  let result: CachedImageScan = { normRects: [], scanned: false };
  try {
    const { getPageImageRects } = await import("./image-regions");
    const scan = await getPageImageRects(page, viewport);
    const vw = Math.max(1, viewport.width), vh = Math.max(1, viewport.height);
    result = {
      scanned: scan.scanned,
      normRects: scan.rects.map((r) => ({
        x0: r.x / vw,
        y0: r.y / vh,
        x1: (r.x + r.w) / vw,
        y1: (r.y + r.h) / vh,
      })),
    };
  } catch {
    result = { normRects: [], scanned: false };
  }
  docMap.set(pageNumber, result);
  return result;
}

export function createBackgroundProcessor(options?: BackgroundWorkerDiagnosticOptions) {
  const diagnostic = createBackgroundWorkerDiagnostics(options);
  let worker: Worker;
  try { worker = new Worker(new URL("./background-worker.ts", import.meta.url), { type: "module" }); }
  catch (error) { diagnostic.failed("constructor", error, 0, false); throw error; }
  diagnostic.created();
  let serial = 0, disposed = false;
  let disposeReason: "cancelled" | "completed" | "worker_error" | undefined;
  const pending = new Map<number, { resolve: (data: Uint8ClampedArray<ArrayBuffer>) => void; reject: (error: Error) => void; diagnostic: ReturnType<typeof diagnostic.request> }>();
  const dispose = (reason: "cancelled" | "completed" | "worker_error" = "cancelled") => {
    diagnostic.dispose(reason, pending.size);
    disposeReason ??= reason;
    disposed = true; worker.terminate();
    for (const task of pending.values()) task.reject(new DOMException("Cleaning cancelled", "AbortError"));
    pending.clear();
  };
  worker.onmessage = ({ data }: MessageEvent<{ id: number; buffer?: ArrayBuffer; outcome?: BackgroundOutcome; error?: string }>) => {
    diagnostic.response();
    const task = pending.get(data.id);
    if (data.error || !data.buffer) {
      if (task) {
        const error = new Error(data.error ?? "Could not clean the page.");
        diagnostic.failed(data.error ? "response_error" : "missing_buffer", error, pending.size, disposed, task.diagnostic);
        task.reject(error);
      } else diagnostic.failed(data.error ? "response_error" : "missing_buffer", undefined, pending.size, disposed);
    } else if (task) {
      const output = new Uint8ClampedArray(data.buffer);
      if (data.outcome) outcomes.set(output, data.outcome);
      task.resolve(output);
    }
    pending.delete(data.id);
  };
  worker.onerror = (event) => {
    const failure = diagnostic.failed("error_event", event, pending.size, disposed);
    // A terminated preview can still dispatch a queued native error. Cancel its
    // default propagation only when this exact worker was disposed by cancellation.
    // Keep the first reason: finally's completed cleanup must not undo cancellation,
    // and a later cancellation must not hide an already completed/failed worker.
    if (disposed && disposeReason === "cancelled") {
      try { event.preventDefault(); } catch { /* Non-standard events retain their normal reporting. */ }
    }
    for (const task of pending.values()) {
      const error = new Error("Background cleaning could not start. Reload or try another browser.");
      associateBackgroundWorkerFailure(error, failure, task.diagnostic);
      task.reject(error);
    }
    pending.clear(); dispose("worker_error");
  };
  // Observe serialization failures without introducing a new business rejection.
  worker.onmessageerror = (event) => { diagnostic.failed("message_error", event, pending.size, disposed); };
  return {
    process(data: Uint8ClampedArray<ArrayBuffer>, width: number, height: number, settings: BackgroundSettings, options?: BackgroundWorkerDiagnosticOptions) {
      if (disposed) return Promise.reject(new DOMException("Cleaning cancelled", "AbortError"));
      const id = ++serial;
      return new Promise<Uint8ClampedArray<ArrayBuffer>>((resolve, reject) => {
        const taskDiagnostic = diagnostic.request(id, width, height, settings, pending.size + 1, options);
        pending.set(id, { resolve, reject, diagnostic: taskDiagnostic });
        try { worker.postMessage({ id, buffer: data.buffer, width, height, settings }, [data.buffer]); }
        catch (error) { diagnostic.failed("post_message", error, pending.size, disposed, taskDiagnostic); pending.delete(id); reject(error); }
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
  // Must run before the first page.render() so pdf.js path arrays are still intact.
  const imageScan = await getCachedPageImageScan(pdf, page, number, viewport);
  checkCancelled(signal);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser does not support PDF previews.");
  const task = page.render({ canvas, canvasContext: ctx, viewport, background: "rgb(255,255,255)" });
  const cancel = () => task.cancel(); signal.addEventListener("abort", cancel, { once: true });
  let processor: ReturnType<typeof createBackgroundProcessor> | null = null;
  let outcome: BackgroundOutcome = "cleaned";
  let embeddedPhotos = 0;
  try {
    checkCancelled(signal); await task.promise; checkCancelled(signal);
    const original = preview ? canvas.toDataURL("image/png") : "";
    if (settings.strength > 0) {
      processor = createBackgroundProcessor({ pageNumber: number, mode: preview ? "preview" : "export" });
      const abortWorker = () => processor?.dispose("cancelled"); signal.addEventListener("abort", abortWorker, { once: true });
      try {
        checkCancelled(signal);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let photoRects: SimpleRect[] = [];
        let originalCopy: Uint8ClampedArray | null = null;
        if (settings.protectPhotos !== false && !imageScan.scanned && imageScan.normRects.length > 0) {
          const { filterPhotoRects } = await import("./background");
          const scaledRects: SimpleRect[] = imageScan.normRects.map((r) => ({
            x: r.x0 * canvas.width,
            y: r.y0 * canvas.height,
            w: (r.x1 - r.x0) * canvas.width,
            h: (r.y1 - r.y0) * canvas.height,
          }));
          photoRects = filterPhotoRects(pixels.data, canvas.width, canvas.height, scaledRects);
          if (photoRects.length > 0) originalCopy = pixels.data.slice();
        }
        const cleaned = await processor.process(pixels.data, canvas.width, canvas.height, settings);
        checkCancelled(signal);
        outcome = outcomes.get(cleaned) ?? "cleaned";
        if (outcome === "cleaned" && photoRects.length > 0 && originalCopy) {
          const { restorePhotoRects } = await import("./background");
          restorePhotoRects(cleaned, originalCopy, canvas.width, canvas.height, photoRects);
          embeddedPhotos = photoRects.length;
        }
        ctx.putImageData(new ImageData(cleaned, canvas.width, canvas.height), 0, 0);
      } finally { signal.removeEventListener("abort", abortWorker); processor.dispose("completed"); }
    }
    checkCancelled(signal);
    return { canvas, original, width: size.width, height: size.height, outcome, embeddedPhotos };
  } catch (error) { canvas.width = canvas.height = 0; throw error; }
  finally { signal.removeEventListener("abort", cancel); }
}

export async function previewBackgroundPdf(pdf: PDFDocumentProxy, page: number, settings: BackgroundSettings, signal: AbortSignal) {
  const result = await renderPage(pdf, page, settings, signal, true);
  try {
    checkCancelled(signal);
    return {
      original: result.original,
      converted: result.canvas.toDataURL("image/png"),
      outcome: result.outcome,
      embeddedPhotos: result.embeddedPhotos,
    };
  } finally { result.canvas.width = result.canvas.height = 0; }
}

async function pngBytes(canvas: HTMLCanvasElement) {
  return new Promise<Uint8Array>((resolve, reject) => canvas.toBlob(async (blob) => {
    if (!blob) { reject(new Error("Could not encode the cleaned page.")); return; }
    try { resolve(new Uint8Array(await blob.arrayBuffer())); } catch (error) { reject(error); }
  }, "image/png"));
}

export type BackgroundExportSummary = {
  bytes: Uint8Array;
  autoSkippedPages: number[];
  embeddedPhotoPages: number;
  manualSkippedCount: number;
};

export async function exportBackgroundPdf(
  pdf: PDFDocumentProxy,
  settings: BackgroundSettings,
  manualSkipped: Set<number>,
  forcedClean: Set<number>,
  quality: "standard" | "compact",
  signal: AbortSignal,
  onProgress: (done: number) => void,
): Promise<BackgroundExportSummary> {
  const { PDFDocument } = await import("pdf-lib");
  const output = await PDFDocument.create(); output.setCreator("PDF Dark — PDF Whitener");
  const autoSkippedPages: number[] = [];
  let embeddedPhotoPages = 0;
  for (let number = 1; number <= pdf.numPages; number++) {
    const isManualSkip = manualSkipped.has(number);
    const pageSettings: BackgroundSettings = isManualSkip
      ? { ...settings, strength: 0 }
      : forcedClean.has(number)
        ? { ...settings, protectPhotos: false }
        : settings;
    const result = await renderPage(pdf, number, pageSettings, signal, false, quality);
    if (!isManualSkip && settings.strength > 0) {
      if (result.outcome === "photo_page" || result.outcome === "dark_page") {
        autoSkippedPages.push(number);
      } else if (result.embeddedPhotos > 0) {
        embeddedPhotoPages++;
      }
    }
    try {
      const bytes = await pngBytes(result.canvas); checkCancelled(signal);
      const image = await output.embedPng(bytes); checkCancelled(signal);
      output.addPage([result.width, result.height]).drawImage(image, { x: 0, y: 0, width: result.width, height: result.height });
      onProgress(number);
    } finally { result.canvas.width = result.canvas.height = 0; }
    await yieldToMain();
  }
  checkCancelled(signal); const bytes = await output.save(); checkCancelled(signal);
  return { bytes, autoSkippedPages, embeddedPhotoPages, manualSkippedCount: manualSkipped.size };
}
