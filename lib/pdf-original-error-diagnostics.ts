/** Fixed vocabulary and scalar summaries only. Never return document strings or URLs. */
export type DiagnosticScalar = string | number | boolean;
export type ScalarDiagnostic = Record<string, DiagnosticScalar>;

const MAX_MESSAGE_CHARS = 512;
const MAX_HEADER_CHARS = 96;
const MAX_SAMPLE_CHARS = 4096;
const ERROR_NAMES = new Set([
  "Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "NetworkError",
  "NotFoundError", "NotReadableError", "NotAllowedError", "UnknownError", "InvalidStateError",
  "AbortError", "EncodingError", "DataCloneError", "SecurityError", "QuotaExceededError",
  "UnknownErrorException", "MissingPDFException", "UnexpectedResponseException", "FormatError",
  "RenderingCancelledException",
]);
// Compare the complete bounded message. Prefixes/substrings could contain a
// filename or private text even when they resemble a browser's native error.
const MESSAGES = new Map([
  ["Load failed", "load_failed"],
  ["Failed to fetch", "failed_to_fetch"],
  ["NetworkError when attempting to fetch resource.", "network_error"],
  ["The operation was aborted.", "operation_aborted"],
  ["The operation is insecure.", "operation_insecure"],
  ["Out of memory", "out_of_memory_text"],
  ["out of memory", "out_of_memory_text"],
  ["Array buffer allocation failed", "buffer_allocation_failed_text"],
  ["The object is in an invalid state.", "invalid_state_text"],
  ["The source image could not be decoded.", "image_decode_failed_text"],
  ["The source image width is 0.", "image_width_zero"],
  ["The source image height is 0.", "image_height_zero"],
]);

function field(value: unknown, key: string): { value?: unknown; unavailable?: true } {
  try {
    if ((typeof value !== "object" || value === null) && typeof value !== "function") return {};
    return { value: (value as Record<string, unknown>)[key] };
  } catch { return { unavailable: true }; }
}

function errorFields(error: unknown, prefix: string, result: ScalarDiagnostic) {
  const name = field(error, "name");
  result[`${prefix}name`] = typeof name.value === "string" && name.value.length <= 80 && ERROR_NAMES.has(name.value)
    ? name.value : "Other";
  const message = typeof error === "string" ? { value: error } : field(error, "message");
  result[`${prefix}message_status`] = message.unavailable ? "unavailable"
    : typeof message.value !== "string" ? "missing" : "unrecognized";
  if (typeof message.value === "string") {
    result[`${prefix}message_length`] = message.value.length;
    const kind = message.value.length <= MAX_MESSAGE_CHARS ? MESSAGES.get(message.value) : undefined;
    if (kind) {
      result[`${prefix}message_status`] = "recognized";
      result[`${prefix}message_kind`] = kind;
      // This value must be an exact member of the fixed list above.
      result[`${prefix}message`] = message.value;
    }
  }
  const code = field(error, "code");
  result[`${prefix}code_status`] = code.unavailable ? "unavailable" : code.value === undefined ? "missing" : "unsupported";
  // Browser/DOM numeric codes, including 0 and signed/unsigned 32-bit codes.
  if (typeof code.value === "number" && Number.isInteger(code.value) && code.value >= -2147483648 && code.value <= 4294967295) {
    result[`${prefix}code_status`] = "numeric";
    result[`${prefix}code`] = code.value;
  }
}

/** Error identity and its fields are never changed. At most two flat cause summaries. */
export function summarizeOriginalError(error: unknown): ScalarDiagnostic {
  const result: ScalarDiagnostic = { cause_depth: 0, cause_status: "none" };
  try {
    errorFields(error, "", result);
    const seen = [error];
    let current = error;
    for (let depth = 1; depth <= 2; depth++) {
      const cause = field(current, "cause");
      if (cause.unavailable) { result.cause_status = "unavailable"; break; }
      if (cause.value === undefined || cause.value === null) break;
      if (seen.includes(cause.value)) { result.cause_status = "cycle"; break; }
      errorFields(cause.value, `cause_${depth}_`, result);
      result.cause_depth = depth;
      result.cause_status = depth === 2 ? "depth_limit" : "captured";
      if ((typeof cause.value !== "object" || cause.value === null) && typeof cause.value !== "function") {
        result.cause_status = "primitive";
        break;
      }
      seen.push(cause.value);
      current = cause.value;
    }
  } catch { result.summary_status = "partial"; }
  return result;
}

function imageMime(value: unknown): string {
  return value === "image/jpeg" ? "jpeg" : value === "image/png" ? "png" : "other";
}

/** Failure-only bounded sampling; this is not a second decoder or full validation. */
export function summarizeImageInput(source: string | Blob): ScalarDiagnostic {
  const result: ScalarDiagnostic = { input_kind: "unavailable", scan_coverage: "not_applicable", scanned_chars: 0 };
  try {
    if (typeof source !== "string") {
      result.input_kind = "blob";
      try { const size = source.size; if (Number.isSafeInteger(size) && size >= 0) result.input_length = size; } catch { /* optional field */ }
      try { result.input_mime = imageMime(source.type); } catch { /* optional field */ }
      return result;
    }
    result.input_length = source.length;
    if (!source.startsWith("data:")) {
      result.input_kind = source.startsWith("blob:") ? "blob_reference" : "other";
      return result;
    }
    result.input_kind = "data";
    const header = source.slice(0, MAX_HEADER_CHARS);
    const comma = header.indexOf(",");
    result.header_scan_chars = header.length;
    result.header_kind = "unrecognized";
    if (comma < 0) { result.encoding_marker = "unavailable"; return result; }
    const prefix = header.slice(0, comma);
    result.encoding_marker = prefix.endsWith(";base64") ? "base64" : "other";
    const mime = prefix === "data:image/jpeg;base64" ? "jpeg" : prefix === "data:image/png;base64" ? "png" : "other";
    result.input_mime = mime;
    if (mime === "other") return result;
    result.header_kind = "recognized_image";
    const start = comma + 1;
    const length = source.length - start;
    result.payload_length = length;
    result.length_mod4 = length % 4;
    const padding = source.endsWith("==") ? 2 : source.endsWith("=") ? 1 : 0;
    result.padding_kind = padding === 2 ? "two" : padding === 1 ? "one" : "none";
    let valid = true;
    let scanned = 0;
    const scan = (from: number, to: number) => {
      for (let index = from; index < to; index++) {
        const code = source.charCodeAt(start + index);
        const ordinary = (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 43 || code === 47;
        if (!ordinary && !(code === 61 && index >= length - padding)) valid = false;
        scanned++;
      }
    };
    if (length <= MAX_SAMPLE_CHARS) {
      scan(0, length);
      result.scan_coverage = "complete";
    } else {
      scan(0, MAX_SAMPLE_CHARS / 2);
      scan(length - MAX_SAMPLE_CHARS / 2, length);
      result.scan_coverage = "edges_only";
    }
    result.scanned_chars = scanned;
    result.sample_characters_valid = valid;
  } catch { result.scan_coverage = "unavailable"; }
  return result;
}

/** Read native Response metadata only, without consuming or inspecting content. */
export function summarizeImageResponse(response: unknown, received = response !== undefined): ScalarDiagnostic {
  const result: ScalarDiagnostic = { response_received: received };
  if (!received) return result;
  result.response_metadata_status = "not_native";
  try {
    if (typeof Response === "undefined" || !(response instanceof Response)) return result;
    result.response_metadata_status = "available";
    try {
      const status = response.status;
      if (Number.isInteger(status) && status >= 0 && status <= 599) result.response_status = status;
      else result.response_metadata_status = "partial";
    } catch { result.response_metadata_status = "partial"; }
    try {
      const type = response.type;
      if (["basic", "cors", "default", "error", "opaque", "opaqueredirect"].includes(type)) result.response_type = type;
      else result.response_metadata_status = "partial";
    } catch { result.response_metadata_status = "partial"; }
    try {
      const consumed = response.bodyUsed;
      if (typeof consumed === "boolean") result.response_consumed = consumed;
      else result.response_metadata_status = "partial";
    } catch { result.response_metadata_status = "partial"; }
  } catch { result.response_metadata_status = "unavailable"; }
  return result;
}
