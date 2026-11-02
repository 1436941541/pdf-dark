/** Scalar-only details for a failed canvas encode; never retain image content. */
export type CanvasEncodingApi = "blob" | "data_url";
export type CanvasEncodingPhase =
  | "to_blob"
  | "inspect_blob"
  | "to_data_url"
  | "validate_data_url"
  | "validate_jpeg_type"
  | "decode_base64"
  | "build_blob"
  | "validate_blob"
  | "create_file_reader"
  | "read_blob_as_data_url";
export type CanvasEncodingFailureKind =
  | "to_blob_threw"
  | "blob_metadata_threw"
  | "to_data_url_threw"
  | "validate_data_url_threw"
  | "data_url_not_string"
  | "empty_data_url_sentinel"
  | "invalid_data_url_header"
  | "empty_base64"
  | "invalid_base64_characters"
  | "invalid_base64_length"
  | "invalid_base64_padding"
  | "unsupported_jpeg_fallback"
  | "decode_base64_threw"
  | "build_blob_threw"
  | "empty_encoded_blob"
  | "file_reader_constructor_threw"
  | "file_reader_read_threw"
  | "file_reader_error"
  | "file_reader_abort"
  | "file_reader_result_threw";
export type CanvasEncodingMime =
  | "jpeg" | "png" | "webp" | "avif" | "gif" | "other_image" | "other" | "empty";

export interface CanvasEncodingFailure {
  api: CanvasEncodingApi;
  phase: CanvasEncodingPhase;
  failure_kind: CanvasEncodingFailureKind;
  to_blob_result: "unavailable" | "null" | "empty" | "nonempty";
  canvas_start_width?: number;
  canvas_start_height?: number;
  canvas_start_pixels?: number;
  canvas_failure_width?: number;
  canvas_failure_height?: number;
  canvas_failure_pixels?: number;
  canvas_changed?: boolean;
  quality?: number;
  blob_present?: boolean;
  blob_bytes?: number;
  blob_type?: CanvasEncodingMime;
  data_url_chars?: number;
  data_url_header_mime?: CanvasEncodingMime;
  data_url_has_comma?: boolean;
  data_url_empty_sentinel?: boolean;
  base64_chars?: number;
  base64_padding_chars?: number;
  base64_length_mod4?: number;
  base64_characters_valid?: boolean;
  elapsed_ms?: number;
}

export interface CanvasEncodingStart {
  width?: number;
  height?: number;
  pixels?: number;
  time?: number;
  quality?: number;
}

const failures = new WeakMap<object, CanvasEncodingFailure>();
const phases: CanvasEncodingPhase[] = [
  "to_blob", "inspect_blob", "to_data_url", "validate_data_url",
  "validate_jpeg_type", "decode_base64", "build_blob", "validate_blob",
  "create_file_reader", "read_blob_as_data_url",
];
const kinds: CanvasEncodingFailureKind[] = [
  "to_blob_threw", "blob_metadata_threw", "to_data_url_threw", "validate_data_url_threw", "data_url_not_string",
  "empty_data_url_sentinel", "invalid_data_url_header", "empty_base64",
  "invalid_base64_characters", "invalid_base64_length", "invalid_base64_padding",
  "unsupported_jpeg_fallback", "decode_base64_threw", "build_blob_threw",
  "empty_encoded_blob", "file_reader_constructor_threw", "file_reader_read_threw",
  "file_reader_error", "file_reader_abort", "file_reader_result_threw",
];
const mimes: CanvasEncodingMime[] = ["jpeg", "png", "webp", "avif", "gif", "other_image", "other", "empty"];

function attempt<T>(read: () => T): T | undefined {
  try { return read(); } catch { return undefined; }
}

function count(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

function finite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function dimensions(canvas: HTMLCanvasElement) {
  const width = count(attempt(() => canvas.width));
  const height = count(attempt(() => canvas.height));
  return { width, height, pixels: width === undefined || height === undefined ? undefined : count(width * height) };
}

function now(): number | undefined {
  return finite(attempt(() => globalThis.performance.now()));
}

/** The only success-path probes are small numeric baselines for later comparison. */
export function startCanvasEncodingDiagnostics(canvas: HTMLCanvasElement, quality: number): CanvasEncodingStart {
  try {
    return { ...dimensions(canvas), time: now(), quality: finite(quality) };
  } catch {
    return {};
  }
}

function mime(value: unknown): CanvasEncodingMime | undefined {
  if (typeof value !== "string") return undefined;
  // Browser MIME values are short. Never copy an arbitrary supplied string.
  if (value.length > 128) return "other";
  const normalized = value.toLowerCase();
  if (normalized === "") return "empty";
  if (normalized === "image/jpeg") return "jpeg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/avif") return "avif";
  if (normalized === "image/gif") return "gif";
  return normalized.startsWith("image/") ? "other_image" : "other";
}

/** Called only after a failure. This does not scan or copy the Base64 body. */
function dataUrlDetails(url: unknown): Partial<CanvasEncodingFailure> {
  if (typeof url !== "string") return {};
  const comma = url.indexOf(",");
  const header = url.slice(0, comma < 0 ? Math.min(url.length, 128) : Math.min(comma, 128));
  const headerType = /^data:([^;]*)(?:;|$)/i.exec(header)?.[1];
  const base64Chars = comma < 0 ? undefined : url.length - comma - 1;
  return {
    data_url_chars: url.length,
    data_url_header_mime: mime(headerType),
    data_url_has_comma: comma >= 0,
    data_url_empty_sentinel: url === "data:,",
    base64_chars: base64Chars,
    base64_padding_chars: base64Chars === undefined ? undefined : url.endsWith("==") ? 2 : url.endsWith("=") ? 1 : 0,
    base64_length_mod4: base64Chars === undefined ? undefined : base64Chars % 4,
  };
}

function safeDetails(input: CanvasEncodingFailure): CanvasEncodingFailure | undefined {
  const api = attempt(() => input.api);
  const phase = attempt(() => input.phase);
  const failureKind = attempt(() => input.failure_kind);
  const result = attempt(() => input.to_blob_result);
  if ((api !== "blob" && api !== "data_url") || !phases.includes(phase!) || !kinds.includes(failureKind!) ||
    !["unavailable", "null", "empty", "nonempty"].includes(result!)) return undefined;
  const safe: CanvasEncodingFailure = { api, phase: phase!, failure_kind: failureKind!, to_blob_result: result! };
  const numbers = [
    "canvas_start_width", "canvas_start_height", "canvas_start_pixels", "canvas_failure_width",
    "canvas_failure_height", "canvas_failure_pixels", "blob_bytes", "data_url_chars", "base64_chars",
    "base64_padding_chars", "base64_length_mod4", "elapsed_ms",
  ] as const;
  for (const key of numbers) {
    const value = count(attempt(() => input[key]));
    if (value !== undefined) safe[key] = value;
  }
  const quality = finite(attempt(() => input.quality));
  if (quality !== undefined) safe.quality = quality;
  for (const key of ["canvas_changed", "blob_present", "data_url_has_comma", "data_url_empty_sentinel", "base64_characters_valid"] as const) {
    const value = attempt(() => input[key]);
    if (typeof value === "boolean") safe[key] = value;
  }
  for (const key of ["blob_type", "data_url_header_mime"] as const) {
    const value = attempt(() => input[key]);
    if (mimes.includes(value!)) safe[key] = value;
  }
  return safe;
}

/** Attach safe scalars without changing, wrapping, or extending the thrown object. */
export function recordCanvasEncodingFailure(
  error: unknown,
  canvas: HTMLCanvasElement,
  start: CanvasEncodingStart,
  details: CanvasEncodingFailure,
  blob?: Blob | null,
  url?: unknown,
): void {
  try {
    if ((typeof error !== "object" || error === null) && typeof error !== "function") return;
    const end = dimensions(canvas);
    const time = now();
    const safe = safeDetails(details);
    if (!safe) return;
    const complete: CanvasEncodingFailure = {
      ...dataUrlDetails(url),
      ...safe,
      canvas_start_width: count(attempt(() => start.width)),
      canvas_start_height: count(attempt(() => start.height)),
      canvas_start_pixels: count(attempt(() => start.pixels)),
      canvas_failure_width: end.width,
      canvas_failure_height: end.height,
      canvas_failure_pixels: end.pixels,
      quality: finite(attempt(() => start.quality)),
      blob_present: blob !== undefined && blob !== null,
      blob_bytes: count(attempt(() => blob?.size)),
      blob_type: mime(attempt(() => blob?.type)),
    };
    if (complete.canvas_start_width !== undefined && complete.canvas_start_height !== undefined && end.width !== undefined && end.height !== undefined) {
      complete.canvas_changed = complete.canvas_start_width !== end.width || complete.canvas_start_height !== end.height;
    }
    const began = finite(attempt(() => start.time));
    if (time !== undefined && began !== undefined) complete.elapsed_ms = Math.round(Math.max(0, time - began));
    failures.set(error as object, complete);
  } catch {
    // Diagnostics must never replace or prevent the original rejection.
  }
}

export function getCanvasEncodingFailure(error: unknown): CanvasEncodingFailure | undefined {
  try {
    if ((typeof error !== "object" || error === null) && typeof error !== "function") return undefined;
    const details = failures.get(error as object);
    return details ? { ...details } : undefined;
  } catch {
    return undefined;
  }
}
