export type PdfFileSelectionSource = "picker" | "drop" | "sample";

type FileReadErrorKind = "not_found" | "not_readable" | "not_allowed" | "security" | "abort" | "unknown";
type SafeFileType = "pdf" | "octet-stream" | "empty" | "other";
type LastModifiedAge = "under_1h" | "under_1d" | "under_30d" | "under_1y" | "over_1y" | "future" | "unknown";
type SafeDomExceptionName =
  | "NotFoundError" | "NotReadableError" | "NotAllowedError" | "SecurityError"
  | "AbortError" | "InvalidStateError" | "UnknownError" | "Other";

/** Scalar evidence about a failed native read; never document data or a cause diagnosis. */
export type PdfFileReadFailure = Readonly<{
  error_kind: FileReadErrorKind;
  dom_exception_name: SafeDomExceptionName;
  dom_exception_code?: number;
  selection_source: PdfFileSelectionSource | "unknown";
  file_bytes?: number;
  file_type?: SafeFileType;
  last_modified_age: LastModifiedAge;
  metadata_before_available: boolean;
  metadata_after_available: boolean;
  metadata_changed?: boolean;
  read_elapsed_ms?: number;
  visibility?: DocumentVisibilityState;
  document_focused?: boolean;
  online?: boolean;
}>;

type FileMetadata = {
  bytes?: number;
  type?: string;
  lastModified?: number;
  available: boolean;
};

const sources = new WeakMap<File, PdfFileSelectionSource>();
const failures = new WeakMap<object, PdfFileReadFailure>();
const ERROR_KINDS: Record<Exclude<SafeDomExceptionName, "Other">, FileReadErrorKind> = {
  NotFoundError: "not_found",
  NotReadableError: "not_readable",
  NotAllowedError: "not_allowed",
  SecurityError: "security",
  AbortError: "abort",
  InvalidStateError: "unknown",
  UnknownError: "unknown",
};

/** Record the selection mechanism only; it cannot identify a storage provider or file lifetime. */
export function markPdfFileSource(file: File, source: PdfFileSelectionSource): void {
  try {
    if (source === "picker" || source === "drop" || source === "sample") sources.set(file, source);
  } catch { /* Optional diagnostics must never interrupt selecting a file. */ }
}

export function getPdfFileReadFailure(error: unknown): PdfFileReadFailure | undefined {
  return isObject(error) ? failures.get(error) : undefined;
}

function isObject(value: unknown): value is object {
  return value !== null && (typeof value === "object" || typeof value === "function");
}

function metadata(file: File): FileMetadata {
  const result: FileMetadata = { available: false };
  try {
    const value = file.size;
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) result.bytes = value;
  } catch { /* A single unavailable getter must not hide the other safe fields. */ }
  try {
    const value = file.type;
    if (typeof value === "string") result.type = value;
  } catch { /* Optional metadata. */ }
  try {
    const value = file.lastModified;
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) result.lastModified = value;
  } catch { /* Optional metadata. */ }
  result.available = result.bytes !== undefined && result.type !== undefined && result.lastModified !== undefined;
  return result;
}

function fileType(value: string | undefined): SafeFileType | undefined {
  if (value === undefined) return;
  if (value === "") return "empty";
  if (value === "application/pdf") return "pdf";
  if (value === "application/octet-stream") return "octet-stream";
  return "other";
}

function lastModifiedAge(value: number | undefined): LastModifiedAge {
  if (value === undefined) return "unknown";
  try {
    const now = Date.now();
    if (!Number.isFinite(now) || now < 0) return "unknown";
    const age = now - value;
    if (age < 0) return "future";
    if (age < 3_600_000) return "under_1h";
    if (age < 86_400_000) return "under_1d";
    if (age < 30 * 86_400_000) return "under_30d";
    if (age < 365 * 86_400_000) return "under_1y";
    return "over_1y";
  } catch { return "unknown"; }
}

function clockNow(): number | undefined {
  try {
    const value = performance.now();
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  } catch { /* The native read must still run without a working clock. */ }
}

function errorMetadata(error: object): Pick<PdfFileReadFailure, "error_kind" | "dom_exception_name" | "dom_exception_code"> {
  let name: SafeDomExceptionName = "Other";
  let code: number | undefined;
  try {
    const value = (error as { name?: unknown }).name;
    if (typeof value === "string" && Object.prototype.hasOwnProperty.call(ERROR_KINDS, value)) name = value as SafeDomExceptionName;
  } catch { /* A rejection can have a throwing name getter. */ }
  try {
    const value = (error as { code?: unknown }).code;
    if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 25) code = value;
  } catch { /* A rejection can have a throwing code getter. */ }
  return {
    error_kind: name === "Other" ? "unknown" : ERROR_KINDS[name],
    dom_exception_name: name,
    ...(code === undefined ? {} : { dom_exception_code: code }),
  };
}

function environment(): Pick<PdfFileReadFailure, "visibility" | "document_focused" | "online"> {
  const result: { visibility?: DocumentVisibilityState; document_focused?: boolean; online?: boolean } = {};
  try {
    const value = document.visibilityState;
    if (value === "visible" || value === "hidden") result.visibility = value;
  } catch { /* No document in this environment. */ }
  try {
    const value = document.hasFocus();
    if (typeof value === "boolean") result.document_focused = value;
  } catch { /* Optional browser signal. */ }
  try {
    const value = navigator.onLine;
    if (typeof value === "boolean") result.online = value;
  } catch { /* Optional browser signal. */ }
  return result;
}

/**
 * Perform exactly the caller's native read, with no probe, copy, retry or report.
 * WeakMap metadata leaves the original rejection (including its stack) untouched.
 */
export async function readPdfFile(file: File): Promise<ArrayBuffer> {
  const before = metadata(file);
  const source = sources.get(file) ?? "unknown";
  const age = lastModifiedAge(before.lastModified);
  const started = clockNow();
  try {
    return await file.arrayBuffer();
  } catch (error) {
    const ended = clockNow();
    if (isObject(error)) {
      try {
        const after = metadata(file);
        const elapsed = started === undefined || ended === undefined ? undefined : Math.round(ended - started);
        const type = fileType(before.type);
        const failure: PdfFileReadFailure = {
          ...errorMetadata(error),
          selection_source: source,
          ...(before.bytes === undefined ? {} : { file_bytes: before.bytes }),
          ...(type === undefined ? {} : { file_type: type }),
          last_modified_age: age,
          metadata_before_available: before.available,
          metadata_after_available: after.available,
          ...(before.available && after.available ? {
            metadata_changed: before.bytes !== after.bytes || before.type !== after.type || before.lastModified !== after.lastModified,
          } : {}),
          ...(elapsed !== undefined && Number.isSafeInteger(elapsed) && elapsed >= 0 ? { read_elapsed_ms: elapsed } : {}),
          ...environment(),
        };
        failures.set(error, Object.freeze(failure));
      } catch { /* Diagnostics must never replace the original rejection. */ }
    }
    throw error;
  }
}
