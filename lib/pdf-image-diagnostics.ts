import * as Sentry from "@sentry/nextjs";
import { darkWorkerFailure } from "./dark-worker-diagnostics";

type PageImageInfo = {
  pageNumber: number;
  width: number;
  height: number;
  imageRegionCount: number;
};

type ImageStep = "fetch_image_data" | "read_image_blob" | "decode_image_bitmap";

type ImageFailureContext = {
  step: ImageStep;
  page_number: number;
  width: number;
  height: number;
  image_region_count: number;
  source_kind: "data" | "blob" | "other";
  source_length: number;
  source_empty: boolean;
  image_format: "jpeg" | "png" | "other";
  blob_bytes?: number;
  elapsed_ms: number;
  step_elapsed_ms: number;
  visibility: DocumentVisibilityState;
  document_focused: boolean;
};

export type PdfReaderStep =
  | "load_pdfjs"
  | "read_file"
  | "parse_pdf"
  | "first_page"
  | "get_page"
  | "render_page"
  | "encode_page"
  | "darkify_page"
  | "commit_page";

export type PdfInvertStep =
  | "load_pdfjs"
  | "read_file"
  | "parse_pdf"
  | "get_page"
  | "render_page"
  | "encode_page"
  | "darkify_page"
  | "build_pdf"
  | "download";

export type PdfFailureDiagnostic = {
  readerStep?: PdfReaderStep;
  invertStep?: PdfInvertStep;
  pageNumber?: number;
};

const SAFE_ERROR_NAMES = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "NetworkError",
  "NotFoundError",
  "InvalidStateError",
  "AbortError",
  "EncodingError",
  "DataCloneError",
  "SecurityError",
  "QuotaExceededError",
  "UnknownErrorException",
  "MissingPDFException",
  "UnexpectedResponseException",
  "FormatError",
  "RenderingCancelledException",
]);

function safeErrorName(error: unknown): string {
  const name = (error as { name?: unknown } | null)?.name;
  return typeof name === "string" && SAFE_ERROR_NAMES.has(name) ? name : "Other";
}

// Associate safe metadata with the original exception without replacing its
// stack, adding file contents to the error, or keeping document data alive.
const failures = new WeakMap<object, ImageFailureContext>();

export async function loadPageBitmap(
  source: string | Blob,
  page: PageImageInfo,
  checkCancelled: () => void,
): Promise<ImageBitmap> {
  const started = performance.now();
  let stepStarted = started;
  let step: ImageStep = "fetch_image_data";
  let blobBytes: number | undefined;
  let bitmap: ImageBitmap | undefined;

  try {
    checkCancelled();
    let blob: Blob;
    if (typeof source === "string") {
      const response = await fetch(source);
      checkCancelled();
      step = "read_image_blob";
      stepStarted = performance.now();
      blob = await response.blob();
    } else {
      blob = source;
    }
    blobBytes = blob.size;
    checkCancelled();
    step = "decode_image_bitmap";
    stepStarted = performance.now();
    bitmap = await createImageBitmap(blob);
    checkCancelled();
    return bitmap;
  } catch (error) {
    // A navigation can cancel after decoding has already allocated a bitmap.
    bitmap?.close();
    // Navigation may interrupt fetch/blob decoding with a TypeError rather
    // than AbortError. Prefer the caller's explicit cancellation state.
    checkCancelled();
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    const context: ImageFailureContext = {
      step,
      page_number: page.pageNumber,
      width: page.width,
      height: page.height,
      image_region_count: page.imageRegionCount,
      source_kind: typeof source !== "string" ? "blob" : source.startsWith("data:") ? "data" : source.startsWith("blob:") ? "blob" : "other",
      source_length: typeof source === "string" ? source.length : source.size,
      source_empty: typeof source === "string" ? source.length === 0 || source === "data:," : source.size === 0,
      image_format: typeof source === "string"
        ? source.startsWith("data:image/jpeg;") ? "jpeg" : source.startsWith("data:image/png;") ? "png" : "other"
        : source.type === "image/jpeg" ? "jpeg" : source.type === "image/png" ? "png" : "other",
      blob_bytes: blobBytes,
      elapsed_ms: Math.round(performance.now() - started),
      step_elapsed_ms: Math.round(performance.now() - stepStarted),
      visibility: document.visibilityState,
      document_focused: document.hasFocus(),
    };
    if (typeof error === "object" && error !== null) failures.set(error, context);
    // Never log the source URL, file name, PDF text, or image bytes.
    console.error("[pdf-dark] image processing diagnostic", context);
    throw error;
  }
}

export function capturePdfProcessingException(
  error: unknown,
  stage: string,
  tags: Record<string, string> = {},
  diagnostic: PdfFailureDiagnostic = {},
) {
  const context = typeof error === "object" && error !== null ? failures.get(error) : undefined;
  const workerContext = darkWorkerFailure(error);
  const workerEnvironment: Record<string, boolean | string> = {};
  if (workerContext) {
    try {
      const visibility = document.visibilityState;
      if (visibility === "visible" || visibility === "hidden") workerEnvironment.visibility = visibility;
      const focused = document.hasFocus();
      if (typeof focused === "boolean") workerEnvironment.document_focused = focused;
      if (typeof navigator.onLine === "boolean") workerEnvironment.online = navigator.onLine;
    } catch { /* missing browser signals must not prevent error reporting */ }
  }
  // PDF parser messages can contain document strings. Keep code frames but
  // replace the message and discard non-script/inline/local-media frames.
  const safe = new Error("PDF processing failed");
  safe.name = "PdfProcessingError";
  if (error instanceof Error && error.stack) {
    const frames = error.stack.split("\n").filter(line => /^\s*at /.test(line) && /https?:\/\/[^\s)]+\/_next\//.test(line) && !/data:|blob:/.test(line));
    if (frames.length) safe.stack = `${safe.name}: ${safe.message}\n${frames.join("\n")}`;
  }
  try {
    const pageNumber = diagnostic.pageNumber;
    const originalErrorType = workerContext?.error_type ?? safeErrorName(error);
    const failureStep = diagnostic.readerStep ?? diagnostic.invertStep ?? context?.step ?? "unknown";
    Sentry.captureException(safe, {
      fingerprint: ["pdf-processing", tags.tool ?? "unknown", stage, failureStep, originalErrorType,
        ...(workerContext ? ["dark-worker", workerContext.step, workerContext.error_hint] : []),
      ],
      tags: {
        ...tags,
        stage,
        original_error_type: originalErrorType,
        ...(diagnostic.readerStep ? { reader_step: diagnostic.readerStep } : {}),
        ...(diagnostic.invertStep ? { invert_step: diagnostic.invertStep } : {}),
        ...(context ? { image_step: context.step } : {}),
        ...(workerContext ? {
          worker_step: workerContext.step,
          worker_error_type: workerContext.error_type,
          worker_error_hint: workerContext.error_hint,
        } : {}),
      },
      contexts: {
        ...(context ? { pdf_image_processing: context } : {}),
        ...(workerContext ? { pdf_dark_worker: { ...workerContext, ...workerEnvironment } } : {}),
        ...(typeof pageNumber === "number" && Number.isInteger(pageNumber) && pageNumber > 0
          ? { pdf_failure: { page_number: pageNumber } }
          : {}),
      },
    });
  } catch {
    // Monitoring failures must not replace the PDF error shown to the user.
  }
}
