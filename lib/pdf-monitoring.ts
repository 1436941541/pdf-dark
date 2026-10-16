import { classifyPdfLoadError } from "./pdf-load-error";
import { capturePdfProcessingException } from "./pdf-image-diagnostics";
import { sizeBucket, trackPdfEvent, type PdfEventData, type PdfInput, type PdfStage, type PdfTool } from "./analytics-events";

export function recordPdfFailure(tool: PdfTool, stage: PdfStage, error: unknown, data: Partial<PdfEventData> = {}) {
  if ((error as { name?: string } | null)?.name === "AbortError") return;
  const kind = classifyPdfLoadError(error);
  trackPdfEvent("pdf_error", { ...data, tool, stage, reason: kind === "other" ? "processing" : kind });
  if (kind === "other") capturePdfProcessingException(error, stage, { tool });
}

export function beginPdfOperation(tool: PdfTool, stage: PdfStage, options: { bytes?: number; pages?: number; input?: PdfInput; signal?: AbortSignal } = {}) {
  const started = performance.now();
  const data: PdfEventData = {
    tool, stage, page: window.location.pathname, input: options.input ?? "file", pages: options.pages,
    ...(options.bytes === undefined ? {} : { size_bucket: sizeBucket(options.bytes) }),
  };
  let finished = false;
  function finish(event: "pdf_success" | "pdf_cancel", pages?: number) {
    if (finished) return;
    finished = true;
    options.signal?.removeEventListener("abort", cancel);
    trackPdfEvent(event, { ...data, pages: pages ?? data.pages, duration_ms: performance.now() - started });
  }
  function cancel() { finish("pdf_cancel"); }
  trackPdfEvent("pdf_start", data);
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) cancel();
  return {
    success(pages?: number) { finish("pdf_success", pages); },
    failure(error: unknown) {
      if (finished) return;
      if ((error as { name?: string } | null)?.name === "AbortError") { cancel(); return; }
      finished = true;
      options.signal?.removeEventListener("abort", cancel);
      recordPdfFailure(tool, stage, error, { ...data, duration_ms: performance.now() - started });
    },
    cancel,
  };
}

export function trackPdfDownload(tool: PdfTool, pages: number, bytes: number, input: PdfInput = "file") {
  // A browser download was requested; this does not prove it was saved to disk.
  trackPdfEvent("pdf_download", { tool, stage: "export", pages, input, output_size_bucket: sizeBucket(bytes) });
}
