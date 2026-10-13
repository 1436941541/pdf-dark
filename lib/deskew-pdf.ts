import type { PDFDocumentProxy } from "pdfjs-dist";
import { detectDeskew } from "./deskew";
import { checkCancelled } from "./monochrome-pdf";
import { yieldToMain } from "./main-thread";

export type DeskewAnalysis = ReturnType<typeof detectDeskew>;

/** Destroy the PDF.js loading task immediately when an upload is cancelled. */
export async function loadDeskewPdf(file: File, signal: AbortSignal) {
  checkCancelled(signal);
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const bytes = new Uint8Array(await file.arrayBuffer());
  checkCancelled(signal);
  const task = pdfjs.getDocument({ data: bytes });
  const cancel = () => { void task.destroy(); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    checkCancelled(signal);
    const pdf = await task.promise;
    if (signal.aborted) { await pdf.destroy(); checkCancelled(signal); }
    return pdf;
  } catch (error) {
    await task.destroy();
    throw error;
  } finally { signal.removeEventListener("abort", cancel); }
}

export function createDeskewProcessor() {
  let worker: Worker | null = null;
  let serial = 0;
  const pending = new Map<number, { resolve: (result: DeskewAnalysis) => void; reject: (error: Error) => void }>();
  const dispose = () => {
    worker?.terminate();
    worker = null;
    for (const task of pending.values()) task.reject(new DOMException("Analysis cancelled", "AbortError"));
    pending.clear();
  };
  try {
    worker = new Worker(new URL("./deskew-worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }: MessageEvent<{ id: number; result: DeskewAnalysis; error?: string }>) => {
      const task = pending.get(data.id);
      if (data.error) task?.reject(new Error(data.error));
      else task?.resolve(data.result);
      pending.delete(data.id);
    };
    worker.onerror = () => {
      for (const task of pending.values()) task.reject(new Error("Page analysis could not start. Reload and try again."));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  } catch { /* A main-thread fallback supports browsers without module workers. */ }
  return {
    async process(pixels: Uint8ClampedArray<ArrayBuffer>, width: number, height: number) {
      if (!worker) { await yieldToMain(); return detectDeskew(pixels, width, height); }
      const id = ++serial;
      return new Promise<DeskewAnalysis>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        try { worker!.postMessage({ id, buffer: pixels.buffer, width, height }, [pixels.buffer]); }
        catch (error) { pending.delete(id); reject(error); }
      });
    },
    dispose,
  };
}

async function renderPage(pdf: PDFDocumentProxy, pageNumber: number, signal: AbortSignal, purpose: "analyze" | "preview" | "export", angle = 0) {
  checkCancelled(signal);
  const page = await pdf.getPage(pageNumber);
  checkCancelled(signal);
  const size = page.getViewport({ scale: 1 });
  const radians = angle * Math.PI / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const outputWidth = size.width * cosine + size.height * sine;
  const outputHeight = size.height * cosine + size.width * sine;
  const longest = Math.max(outputWidth, outputHeight);
  const scale = purpose === "analyze" ? Math.min(1, 700 / Math.max(size.width, size.height))
    : purpose === "preview" ? Math.min(1.25, 1000 / longest)
    : Math.min(2, 8192 / longest, Math.sqrt(16000000 / (outputWidth * outputHeight)));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: purpose === "analyze" });
  if (!ctx) throw new Error("Your browser does not support PDF previews.");
  const task = page.render({ canvas, canvasContext: ctx, viewport, background: "rgb(255,255,255)" });
  const cancel = () => task.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    checkCancelled(signal);
    await task.promise;
    checkCancelled(signal);
    return { canvas, ctx, width: size.width, height: size.height };
  } catch (error) {
    canvas.width = canvas.height = 0;
    throw error;
  } finally { signal.removeEventListener("abort", cancel); }
}

export async function analyzeDeskewPage(pdf: PDFDocumentProxy, pageNumber: number, processor: ReturnType<typeof createDeskewProcessor>, signal: AbortSignal) {
  const rendered = await renderPage(pdf, pageNumber, signal, "analyze");
  try {
    const image = rendered.ctx.getImageData(0, 0, rendered.canvas.width, rendered.canvas.height);
    const result = await processor.process(image.data, rendered.canvas.width, rendered.canvas.height);
    checkCancelled(signal);
    return result;
  } finally { rendered.canvas.width = rendered.canvas.height = 0; }
}

/** Expand the canvas to retain every corner rather than crop a rotated scan. */
function rotateCanvas(source: HTMLCanvasElement, angle: number) {
  const radians = angle * Math.PI / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(source.width * cosine + source.height * sine);
  canvas.height = Math.ceil(source.height * cosine + source.width * sine);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser does not support PDF conversion.");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

export async function previewDeskewPdf(pdf: PDFDocumentProxy, pageNumber: number, angle: number, signal: AbortSignal) {
  const rendered = await renderPage(pdf, pageNumber, signal, "preview", angle);
  let corrected: HTMLCanvasElement | null = null;
  try {
    corrected = rotateCanvas(rendered.canvas, angle);
    checkCancelled(signal);
    return { original: rendered.canvas.toDataURL("image/png"), converted: corrected.toDataURL("image/png") };
  } finally {
    rendered.canvas.width = rendered.canvas.height = 0;
    if (corrected) corrected.width = corrected.height = 0;
  }
}

function pngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error("Could not encode the corrected page.")); return; }
      try { resolve(new Uint8Array(await blob.arrayBuffer())); } catch (error) { reject(error); }
    }, "image/png");
  });
}

export async function exportDeskewPdf(pdf: PDFDocumentProxy, angles: number[], signal: AbortSignal, onProgress: (done: number) => void) {
  const { PDFDocument } = await import("pdf-lib");
  const output = await PDFDocument.create();
  output.setCreator("PDF Dark — Deskew PDF");
  for (let number = 1; number <= pdf.numPages; number++) {
    const angle = angles[number - 1] ?? 0;
    const rendered = await renderPage(pdf, number, signal, "export", angle);
    let corrected: HTMLCanvasElement | null = null;
    try {
      corrected = rotateCanvas(rendered.canvas, angle);
      const image = await output.embedPng(await pngBytes(corrected));
      checkCancelled(signal);
      const radians = angle * Math.PI / 180;
      const cosine = Math.abs(Math.cos(radians));
      const sine = Math.abs(Math.sin(radians));
      const width = rendered.width * cosine + rendered.height * sine;
      const height = rendered.height * cosine + rendered.width * sine;
      const page = output.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
      onProgress(number);
    } finally {
      rendered.canvas.width = rendered.canvas.height = 0;
      if (corrected) corrected.width = corrected.height = 0;
    }
    await yieldToMain();
  }
  checkCancelled(signal);
  const bytes = await output.save();
  checkCancelled(signal);
  return bytes;
}
