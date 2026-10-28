// Shared by the image worker and its callers. Never retain document data here.
export const DARK_WORKER_STEPS = [
  "create_canvas", "create_context", "draw_bitmap", "read_pixels", "apply_dark",
  "write_pixels", "restore_images", "close_bitmap", "encode_jpeg", "post_result",
] as const;
export type DarkWorkerStep = (typeof DARK_WORKER_STEPS)[number];

const ERROR_TYPES = [
  "Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError",
  "InvalidStateError", "IndexSizeError", "NotSupportedError", "EncodingError",
  "SecurityError", "QuotaExceededError", "DataCloneError", "AbortError",
  "OperationError", "UnknownError", "Other",
] as const;
const ERROR_HINTS = ["out_of_memory", "context_lost", "context_unavailable", "invalid_bitmap", "other"] as const;
const NUMBER_FIELDS = [
  "page_number", "width", "height", "pixel_count", "bitmap_width", "bitmap_height",
  "canvas_width", "canvas_height", "image_region_count", "source_bytes", "elapsed_ms", "step_elapsed_ms",
] as const;

type ErrorType = (typeof ERROR_TYPES)[number];
type ErrorHint = (typeof ERROR_HINTS)[number];
export type DarkWorkerFailure = {
  version: 1;
  step: DarkWorkerStep;
  error_type: ErrorType;
  error_hint: ErrorHint;
  context_lost?: boolean;
  theme?: "midnight" | "sepia" | "solarized" | "oled";
  image_mode?: "original" | "smart" | "invert";
} & Partial<Record<(typeof NUMBER_FIELDS)[number], number>>;

/** Re-allowlist messages on the main thread as well as inside the worker. */
export function sanitizeDarkWorkerFailure(value: unknown): DarkWorkerFailure | undefined {
  try {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    const v = value as Record<string, unknown>;
    if (v.version !== 1 || !DARK_WORKER_STEPS.includes(v.step as DarkWorkerStep)) return;
    const result: DarkWorkerFailure = {
      version: 1,
      step: v.step as DarkWorkerStep,
      error_type: ERROR_TYPES.includes(v.error_type as ErrorType) ? v.error_type as ErrorType : "Other",
      error_hint: ERROR_HINTS.includes(v.error_hint as ErrorHint) ? v.error_hint as ErrorHint : "other",
    };
    for (const key of NUMBER_FIELDS) {
      const n = v[key];
      if (typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= Number.MAX_SAFE_INTEGER) {
        result[key] = Math.round(n);
      }
    }
    if (typeof v.context_lost === "boolean") result.context_lost = v.context_lost;
    if (["midnight", "sepia", "solarized", "oled"].includes(v.theme as string)) result.theme = v.theme as DarkWorkerFailure["theme"];
    if (["original", "smart", "invert"].includes(v.image_mode as string)) result.image_mode = v.image_mode as DarkWorkerFailure["image_mode"];
    return result;
  } catch {
    // A diagnostic must never replace the processing result.
  }
}

/** Only a bounded category is derived from messages; no raw message/stack crosses the worker boundary. */
export function describeDarkWorkerFailure(
  error: unknown,
  metadata: Record<string, unknown>,
): DarkWorkerFailure | undefined {
  let name: unknown;
  let hint: ErrorHint = "other";
  try {
    name = (error as { name?: unknown } | null)?.name;
    const message = (error as { message?: unknown } | null)?.message;
    if (typeof message === "string") {
      const bounded = message.slice(0, 512);
      if (/out of memory|memory allocation|allocation failed|could not allocate|cannot be allocated/i.test(bounded)) hint = "out_of_memory";
      else if (/context.{0,40}lost/i.test(bounded)) hint = "context_lost";
      else if (/context.{0,40}unavailable/i.test(bounded)) hint = "context_unavailable";
      else if (/imagebitmap.{0,40}(?:closed|detached)|(?:closed|detached).{0,40}imagebitmap/i.test(bounded)) hint = "invalid_bitmap";
    }
  } catch {
    // Non-standard exceptions may expose throwing accessors.
  }
  try {
    return sanitizeDarkWorkerFailure({ ...metadata, version: 1, error_type: name, error_hint: hint });
  } catch { return undefined; }
}

const failures = new WeakMap<object, DarkWorkerFailure>();

export function restoreDarkWorkerError(response: { diagnostic?: unknown }): Error {
  // Preserve the existing Error/cancellation semantics, including for older cached workers.
  const error = new Error("PDF image worker failed");
  try {
    const diagnostic = sanitizeDarkWorkerFailure(response.diagnostic);
    if (diagnostic) failures.set(error, diagnostic);
  } catch { /* retain the normal error result even for malformed metadata */ }
  return error;
}

export function darkWorkerFailure(error: unknown): DarkWorkerFailure | undefined {
  return typeof error === "object" && error !== null ? failures.get(error) : undefined;
}
