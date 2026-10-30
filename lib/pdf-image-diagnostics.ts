import * as Sentry from "@sentry/nextjs";
import { darkWorkerFailure } from "./dark-worker-diagnostics";
import {
  imageReadErrorHint,
  readImageMemorySnapshot,
  type ImageReadStep,
  type ImageReadErrorHint,
  type ImageMemorySnapshot,
  type ImageCacheSummary,
} from "./pdf-image-resource-diagnostics";

type PageImageInfo = {
  pageNumber: number;
  width: number;
  height: number;
  imageRegionCount: number;
};

// Providers are evaluated only after an active read failure. They must return
// scalar summaries, never PDF contents; re-allowlist even these internal inputs.
export type ImageCacheSnapshotProvider = () => unknown;

type ImageFailureContext = Partial<ImageCacheSummary> & ImageMemorySnapshot & {
  step: ImageReadStep;
  error_hint: ImageReadErrorHint;
  page_number: number;
  width: number;
  height: number;
  image_region_count: number;
  source_kind: "data" | "blob" | "other";
  source_length: number;
  source_empty: boolean;
  image_format: "jpeg" | "png" | "other";
  blob_bytes?: number;
  elapsed_ms?: number;
  step_elapsed_ms?: number;
  visibility?: DocumentVisibilityState;
  document_focused?: boolean;
  online?: boolean;
  cache_snapshot_status: "captured" | "unavailable";
};

const CACHE_NUMBERS = [
  "total_pages", "cached_pages", "cached_original_chars", "cached_display_chars",
  "cached_variant_chars", "cached_variant_count", "cached_blob_bytes", "cached_data_url_chars",
] as const;

function clockNow(): number | undefined {
  try {
    const value = performance.now();
    if (Number.isFinite(value) && value >= 0) return value;
  } catch { /* Optional diagnostics must not affect image decoding. */ }
}

function cacheSnapshot(provider?: ImageCacheSnapshotProvider): Partial<ImageCacheSummary> & {
  cache_snapshot_status: "captured" | "unavailable";
} {
  const result: Partial<ImageCacheSummary> & { cache_snapshot_status: "captured" | "unavailable" } = {
    cache_snapshot_status: "unavailable",
  };
  try {
    const value = provider?.();
    if (!value || typeof value !== "object" || Array.isArray(value)) return result;
    const source = value as Record<string, unknown>;
    for (const key of CACHE_NUMBERS) {
      const n = source[key];
      if (typeof n === "number" && Number.isSafeInteger(n) && n >= 0) {
        result[key] = n;
        result.cache_snapshot_status = "captured";
      }
    }
    if (source.cache_incomplete === true) result.cache_incomplete = true;
  } catch { result.cache_incomplete = true; /* Keep partial counters explicitly marked. */ }
  return result;
}

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
  monochromeStep?: PdfMonochromeStep;
  monochromeMode?: "grayscale" | "black-and-white";
  threshold?: number;
  pageNumber?: number;
  pageWidth?: number;
  pageHeight?: number;
  totalPages?: number;
};

const MONOCHROME_STEPS = [
  "load_pdf_lib", "create_pdf", "embed_font", "get_page", "get_viewport", "create_canvas",
  "render_page", "encode_preview", "read_pixels", "process_pixels", "write_pixels",
  "encode_page", "embed_page", "add_page", "draw_page", "add_text_layer", "save_pdf", "download",
] as const;
export type PdfMonochromeStep = (typeof MONOCHROME_STEPS)[number];

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
  try {
    const name = (error as { name?: unknown } | null)?.name;
    return typeof name === "string" && SAFE_ERROR_NAMES.has(name) ? name : "Other";
  } catch { return "Other"; }
}

// Keep only fixed categories, never an arbitrary parser/browser message, which
// can include a file name, document text or a local media URL.
function safeErrorReason(error: unknown): string {
  try {
    const message = (error as { message?: unknown } | null)?.message;
    if (typeof message !== "string") return "other";
    const text = message.slice(0, 512).trim();
    if (text === "Load failed") return "load_failed";
    if (text === "Failed to fetch") return "failed_to_fetch";
    if (text === "NetworkError when attempting to fetch resource.") return "network_error";
    if (/^Failed to fetch dynamically imported module(?::|$)|^Importing a module script failed\.?$|^error loading dynamically imported module:/i.test(text)) return "module_load_failed";
    if (/out of memory|memory allocation|allocation failed|could not allocate|cannot be allocated/i.test(text)) return "out_of_memory_hint";
    if (/detached.{0,40}(?:buffer|arraybuffer)|(?:buffer|arraybuffer).{0,40}detached/i.test(text)) return "detached_buffer_hint";
    if (text === "Could not encode the converted page.") return "page_encoding_failed";
    if (text === "Your browser does not support PDF previews.") return "canvas_unavailable";
    if (text === "The color conversion worker could not start. Please reload and try again.") return "worker_start_failed";
  } catch { /* A diagnostic accessor must not affect error handling. */ }
  return "other";
}

function safeCodeStack(error: unknown): {
  frames: string[];
  status: "captured" | "filtered_out" | "unavailable";
  format: "v8" | "at_sign" | "mixed" | "other";
} {
  const frames: string[] = [];
  let v8 = false, webkit = false;
  try {
    const rawStack = (error as { stack?: unknown } | null)?.stack;
    if (typeof rawStack !== "string" || !rawStack) return { frames, status: "unavailable", format: "other" };
    let stack: string = rawStack;
    const message = (error as { message?: unknown } | null)?.message;
    const name = (error as { name?: unknown } | null)?.name;
    if (typeof message === "string" && typeof name === "string") {
      if (message.length > 32768 || name.length > 100) return { frames, status: "filtered_out", format: "other" };
      const header = name ? `${name}: ${message}` : message;
      // V8 includes the message, which can span several lines. Never mistake
      // document text that resembles a stack frame for an actual code frame.
      if (header && stack.startsWith(header)) stack = stack.slice(header.length);
    }
    for (const line of stack.slice(0, 32768).split("\n").slice(0, 100)) {
      if (/data:|blob:/i.test(line)) continue;
      const chrome = line.match(/^\s*at\s+(?:.*?\s+\()?((?:https?):\/\/\S+?):(\d+)(?::(\d+))?\)?\s*$/);
      const safari = line.match(/^\s*[^@\n]*@((?:https?):\/\/\S+?):(\d+)(?::(\d+))?\s*$/);
      const match = chrome ?? safari;
      if (!match) continue;
      v8 ||= !!chrome;
      webkit ||= !!safari;
      try {
        const url = new URL(match[1]);
        if (url.username || url.password || url.pathname.length > 1024) continue;
        if (!/^\/_next\/(?:static|server)\/.*\.(?:js|mjs|cjs)$/.test(url.pathname)) continue;
        const lineNumber = Number(match[2]);
        const columnNumber = match[3] === undefined ? undefined : Number(match[3]);
        if (!Number.isSafeInteger(lineNumber) || lineNumber < 1 || lineNumber > 1_000_000_000) continue;
        if (columnNumber !== undefined && (!Number.isSafeInteger(columnNumber) || columnNumber < 0 || columnNumber > 1_000_000_000)) continue;
        // Drop query strings, fragments and raw function names. Original code
        // locations remain available to Sentry's source-map symbolication.
        frames.push(`    at ${url.origin}${url.pathname}:${lineNumber}${columnNumber === undefined ? "" : `:${columnNumber}`}`);
        if (frames.length === 40) break;
      } catch { /* Ignore malformed/non-code locations. */ }
    }
    return { frames, status: frames.length ? "captured" : "filtered_out", format: v8 && webkit ? "mixed" : v8 ? "v8" : webkit ? "at_sign" : "other" };
  } catch {
    return { frames, status: "unavailable", format: "other" };
  }
}

function failureMetadata(diagnostic: PdfFailureDiagnostic): Record<string, number | string> {
  const result: Record<string, number | string> = {};
  for (const [source, target] of [
    ["pageNumber", "page_number"], ["pageWidth", "width"],
    ["pageHeight", "height"], ["totalPages", "total_pages"],
  ] as const) {
    const value = diagnostic[source];
    if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) result[target] = value;
  }
  if (diagnostic.monochromeMode === "grayscale" || diagnostic.monochromeMode === "black-and-white") {
    result.mode = diagnostic.monochromeMode;
    if (typeof diagnostic.threshold === "number" && Number.isInteger(diagnostic.threshold) && diagnostic.threshold >= 1 && diagnostic.threshold <= 254) result.threshold = diagnostic.threshold;
  }
  return result;
}

// Associate safe metadata with the original exception without replacing its
// stack, adding file contents to the error, or keeping document data alive.
const failures = new WeakMap<object, ImageFailureContext>();

export async function loadPageBitmap(
  source: string | Blob,
  page: PageImageInfo,
  checkCancelled: () => void,
  getCacheSnapshot?: ImageCacheSnapshotProvider,
): Promise<ImageBitmap> {
  const started = clockNow();
  let stepStarted = started;
  let step: ImageReadStep = "fetch_image_data";
  let blobBytes: number | undefined;
  let bitmap: ImageBitmap | undefined;

  try {
    checkCancelled();
    let blob: Blob;
    if (typeof source === "string") {
      const response = await fetch(source);
      checkCancelled();
      step = "read_image_blob";
      stepStarted = clockNow();
      blob = await response.blob();
    } else {
      blob = source;
    }
    blobBytes = blob.size;
    checkCancelled();
    step = "decode_image_bitmap";
    stepStarted = clockNow();
    bitmap = await createImageBitmap(blob);
    checkCancelled();
    return bitmap;
  } catch (error) {
    // A navigation can cancel after decoding has already allocated a bitmap.
    try { bitmap?.close(); } catch { /* Best-effort cleanup preserves cancellation/error semantics. */ }
    // Navigation may interrupt fetch/blob decoding with a TypeError rather
    // than AbortError. Prefer the caller's explicit cancellation state.
    checkCancelled();
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    try {
      const ended = clockNow();
      const context: ImageFailureContext = {
        ...readImageMemorySnapshot(),
        ...cacheSnapshot(getCacheSnapshot),
        step,
        error_hint: imageReadErrorHint(error, step),
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
        ...(ended !== undefined && started !== undefined && ended >= started ? { elapsed_ms: Math.round(ended - started) } : {}),
        ...(ended !== undefined && stepStarted !== undefined && ended >= stepStarted ? { step_elapsed_ms: Math.round(ended - stepStarted) } : {}),
      };
      try {
        const visibility = document.visibilityState;
        if (visibility === "visible" || visibility === "hidden") context.visibility = visibility;
      } catch { /* unavailable DOM signal */ }
      try {
        const focused = document.hasFocus();
        if (typeof focused === "boolean") context.document_focused = focused;
      } catch { /* unavailable DOM signal */ }
      try {
        const online = navigator.onLine;
        if (typeof online === "boolean") context.online = online;
      } catch { /* unavailable network signal */ }
      if (typeof error === "object" && error !== null) failures.set(error, context);
      // Never log the source URL, file name, PDF text, or image bytes.
      try { console.error("[pdf-dark] image processing diagnostic", context); } catch { /* unavailable console */ }
    } catch { /* Diagnostics must never replace a PDF failure with a probe failure. */ }
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
  try {
    const codeStack = safeCodeStack(error);
    if (codeStack.frames.length) safe.stack = `${safe.name}: ${safe.message}\n${codeStack.frames.join("\n")}`;
    const reason = safeErrorReason(error);
    const metadata = failureMetadata(diagnostic);
    const monochromeStep = MONOCHROME_STEPS.includes(diagnostic.monochromeStep as PdfMonochromeStep) ? diagnostic.monochromeStep : undefined;
    const originalErrorType = workerContext?.error_type ?? safeErrorName(error);
    const failureStep = diagnostic.readerStep ?? diagnostic.invertStep ?? monochromeStep ?? context?.step ?? "unknown";
    Sentry.captureException(safe, {
      fingerprint: ["pdf-processing", tags.tool ?? "unknown", stage, failureStep, originalErrorType,
        ...(context ? ["image-read", context.step, context.error_hint] : []),
        ...(workerContext ? ["dark-worker", workerContext.step, workerContext.error_hint] : []),
      ],
      tags: {
        ...tags,
        stage,
        original_error_type: originalErrorType,
        original_error_reason: reason,
        original_stack_status: codeStack.status,
        pdf_diagnostic_version: "2",
        ...(diagnostic.readerStep ? { reader_step: diagnostic.readerStep } : {}),
        ...(diagnostic.invertStep ? { invert_step: diagnostic.invertStep } : {}),
        ...(monochromeStep ? { monochrome_step: monochromeStep } : {}),
        ...(context ? { image_step: context.step, image_error_hint: context.error_hint } : {}),
        ...(workerContext ? {
          worker_step: workerContext.step,
          worker_error_type: workerContext.error_type,
          worker_error_hint: workerContext.error_hint,
        } : {}),
      },
      contexts: {
        pdf_exception: {
          version: 2,
          error_reason: reason,
          original_stack_status: codeStack.status,
          original_stack_format: codeStack.format,
          original_code_frames: codeStack.frames.length,
          ...readImageMemorySnapshot(),
        },
        ...(context ? { pdf_image_processing: context } : {}),
        ...(workerContext ? { pdf_dark_worker: { ...workerContext, ...workerEnvironment } } : {}),
        ...(Object.keys(metadata).length
          ? { pdf_failure: metadata }
          : {}),
      },
    });
  } catch {
    // Monitoring failures must not replace the PDF error shown to the user.
  }
}
