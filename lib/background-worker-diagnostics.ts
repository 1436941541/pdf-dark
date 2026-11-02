import * as Sentry from "@sentry/nextjs";

export type BackgroundWorkerDiagnosticOptions = {
  pageNumber?: number;
  mode?: "preview" | "export";
};

type Scalar = string | number | boolean;
type FailureKind = "constructor" | "post_message" | "error_event" | "message_error" | "response_error" | "missing_buffer";
type DisposeReason = "cancelled" | "completed" | "worker_error";
type RequestContext = {
  request_id?: number;
  request_at_ms?: number;
  page_number?: number;
  mode?: "preview" | "export";
  width?: number;
  height?: number;
  strength?: number;
  preserve_colors?: boolean;
};
export type BackgroundWorkerFailure = RequestContext & {
  version: 1;
  worker_id: number;
  failure_kind: FailureKind;
  error_type: string;
  error_hint: "import_scripts" | "script_load" | "other";
  pending_count: number;
  disposed: boolean;
  disposed_before_error: boolean;
  cancelled_before_error: boolean;
  script_path?: string;
  imported_script_path?: string;
  online?: boolean;
  visibility?: "visible" | "hidden";
  created_at_ms?: number;
  first_request_at_ms?: number;
  last_request_at_ms?: number;
  response_at_ms?: number;
  failure_at_ms?: number;
  cancelled_at_ms?: number;
  disposed_at_ms?: number;
  elapsed_ms?: number;
  first_request_elapsed_ms?: number;
  response_elapsed_ms?: number;
  failure_elapsed_ms?: number;
  cancelled_elapsed_ms?: number;
  disposed_elapsed_ms?: number;
  request_elapsed_ms?: number;
};

const ERROR_TYPES = new Set([
  "Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "DOMException",
  "SecurityError", "NetworkError", "DataCloneError", "InvalidStateError", "NotSupportedError",
  "AbortError", "QuotaExceededError", "OperationError", "UnknownError", "ErrorEvent", "MessageEvent",
]);
const failures = new WeakMap<object, BackgroundWorkerFailure>();
// Scalar copies only: this list cannot retain errors, files, pixels or workers.
const recent: BackgroundWorkerFailure[] = [];
let workerSerial = 0;

function read(value: unknown, key: string): unknown {
  try { return value != null ? (value as Record<string, unknown>)[key] : undefined; }
  catch { return undefined; }
}
function dataProperty(value: unknown, key: string): unknown {
  try {
    if (!value || typeof value !== "object") return;
    // structured clone will read settings accessors itself. Diagnostics must not
    // invoke them an extra time before postMessage and change its result.
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && "value" in descriptor) return descriptor.value;
  } catch { /* non-standard settings cannot break the diagnostic */ }
}
function now(): number | undefined {
  try { const value = Date.now(); return Number.isSafeInteger(value) && value >= 0 ? value : undefined; }
  catch { return undefined; }
}
function duration(start: number | undefined, end: number | undefined) {
  return start !== undefined && end !== undefined && end >= start ? end - start : undefined;
}
function integer(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}
function requestOptions(options: unknown): RequestContext {
  const result: RequestContext = {};
  const page = integer(read(options, "pageNumber"));
  if (page !== undefined) result.page_number = page;
  const mode = read(options, "mode");
  if (mode === "preview" || mode === "export") result.mode = mode;
  return result;
}
function browserFlags(): { online?: boolean; visibility?: "visible" | "hidden" } {
  const result: { online?: boolean; visibility?: "visible" | "hidden" } = {};
  try { const online = navigator.onLine; if (typeof online === "boolean") result.online = online; } catch { /* optional signal */ }
  try {
    const visibility = document.visibilityState;
    if (visibility === "visible" || visibility === "hidden") result.visibility = visibility;
  } catch { /* optional signal */ }
  return result;
}

/** Only a same-origin, bounded Next.js static JS pathname may leave the browser. */
function scriptPath(value: unknown): string | undefined {
  try {
    if (typeof value !== "string" || value.length > 2048 || !/^(?:https?:\/\/|\/_next\/static\/)/i.test(value)) return;
    const origin = location.origin;
    const url = new URL(value, origin);
    if (url.origin !== origin || !/^https?:$/.test(url.protocol)) return;
    const path = url.pathname;
    if (path.length <= 240 && /^\/_next\/static\/(?:[A-Za-z0-9_~-]+\/){0,8}[A-Za-z0-9_~-][A-Za-z0-9_.~-]*\.js$/.test(path)) return path;
  } catch { /* missing location or a malformed URL */ }
}
function errorDescription(error: unknown, kind: FailureKind) {
  // ErrorEvent.error can be absent, null, or expose a throwing accessor.
  const underlying = read(error, "error");
  const name = read(underlying, "name") ?? read(error, "name");
  const errorType = typeof name === "string" && ERROR_TYPES.has(name)
    ? name : kind === "error_event" ? "ErrorEvent" : kind === "message_error" ? "MessageEvent" : "Other";
  const description: Pick<BackgroundWorkerFailure, "error_type" | "error_hint" | "script_path" | "imported_script_path"> = {
    error_type: errorType, error_hint: "other",
  };
  const path = scriptPath(read(error, "filename"));
  if (path) description.script_path = path;
  const message = read(underlying, "message") ?? read(error, "message");
  if (typeof message === "string") {
    // The message is inspected only to derive fixed categories and allowlisted paths.
    // Never persist a message, stack, arbitrary URL, filename, or event payload.
    const bounded = message.slice(0, 2048);
    if (/importScripts/.test(bounded)) {
      description.error_hint = "import_scripts";
      const candidates = bounded.matchAll(/(?:^|[\s'"(])((?:https?:\/\/|\/_next\/static\/)[^\s'"<>)]+)/g);
      let inspected = 0;
      for (const candidate of candidates) {
        if (++inspected > 4) break;
        const imported = scriptPath(candidate[1]);
        if (imported) { description.imported_script_path = imported; break; }
      }
    } else if (/failed to (?:load|fetch).{0,32}(?:script|module)|(?:script|module).{0,64}failed to load/i.test(bounded)) description.error_hint = "script_load";
  }
  return description;
}

/** Associate copies with the existing thrown/rejected object; never replace it. */
export function associateBackgroundWorkerFailure(error: unknown, failure: BackgroundWorkerFailure | undefined, request?: RequestContext) {
  try {
    if (failure && ((typeof error === "object" && error !== null) || typeof error === "function")) {
      const context = { ...failure, ...request };
      const elapsed = duration(context.request_at_ms, context.failure_at_ms);
      if (elapsed !== undefined) context.request_elapsed_ms = elapsed;
      failures.set(error, context);
    }
  } catch { /* diagnostics cannot change worker behavior */ }
}
export function getBackgroundWorkerFailure(error: unknown): BackgroundWorkerFailure | undefined {
  try {
    if ((typeof error === "object" && error !== null) || typeof error === "function") {
      const result = failures.get(error);
      if (result) return { ...result };
    }
  } catch { /* optional diagnostic */ }
}
/** Correlation aid only: these are recent observations, never a claimed cause. */
export function getRecentBackgroundWorkerFailures(): (BackgroundWorkerFailure & { relationship: "recent" })[] {
  try { return recent.map((failure) => ({ ...failure, relationship: "recent" as const })); }
  catch { return []; }
}

export function createBackgroundWorkerDiagnostics(options?: BackgroundWorkerDiagnosticOptions) {
  const workerId = ++workerSerial;
  const createdAt = now();
  const base = requestOptions(options);
  let request: RequestContext = { ...base };
  let firstRequestAt: number | undefined, lastRequestAt: number | undefined, responseAt: number | undefined;
  let failureAt: number | undefined, cancelledAt: number | undefined, disposedAt: number | undefined;
  let wasCancelled = false, wasDisposed = false;
  // No growing per-worker history. At most 12 breadcrumbs, 3 sends and 3 failures;
  // Sentry owns its separately bounded global breadcrumb ring.
  let breadcrumbCount = 0, sends = 0, failureBreadcrumbs = 0;
  function snapshot(pending: number, disposed: boolean): Record<string, Scalar> {
    const end = now();
    const values = {
      version: 1, worker_id: workerId, ...request, pending_count: pending, disposed,
      disposed_before_error: disposed, cancelled_before_error: wasCancelled,
      ...browserFlags(), created_at_ms: createdAt, first_request_at_ms: firstRequestAt,
      last_request_at_ms: lastRequestAt, response_at_ms: responseAt, failure_at_ms: failureAt,
      cancelled_at_ms: cancelledAt, disposed_at_ms: disposedAt, elapsed_ms: duration(createdAt, end),
      first_request_elapsed_ms: duration(createdAt, firstRequestAt), response_elapsed_ms: duration(createdAt, responseAt),
      failure_elapsed_ms: duration(createdAt, failureAt), cancelled_elapsed_ms: duration(createdAt, cancelledAt),
      disposed_elapsed_ms: duration(createdAt, disposedAt), request_elapsed_ms: duration(lastRequestAt, end),
    };
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as Record<string, Scalar>;
  }
  function breadcrumb(message: string, data: Record<string, Scalar>, failure = false) {
    try {
      if (breadcrumbCount >= 12) return;
      breadcrumbCount++;
      Sentry.addBreadcrumb({ category: "pdf.worker", type: "debug", level: failure ? "error" : "info", message, data });
    } catch { /* missing or failing SDK must not affect PDF processing */ }
  }
  return {
    created() {
      try { breadcrumb("background.created", snapshot(0, false)); } catch { /* diagnostic only */ }
    },
    request(id: number, width: number, height: number, settings: unknown, pending: number, options?: BackgroundWorkerDiagnosticOptions): RequestContext {
      try {
        lastRequestAt = now(); firstRequestAt ??= lastRequestAt;
        request = { ...base, ...requestOptions(options), request_id: integer(id) };
        if (lastRequestAt !== undefined) request.request_at_ms = lastRequestAt;
        const w = integer(width), h = integer(height), strength = dataProperty(settings, "strength"), preserve = dataProperty(settings, "preserveColors");
        if (w !== undefined) request.width = w;
        if (h !== undefined) request.height = h;
        if (typeof strength === "number" && Number.isFinite(strength) && strength >= 0 && strength <= 100) request.strength = strength;
        if (typeof preserve === "boolean") request.preserve_colors = preserve;
        if (sends++ < 3) breadcrumb("background.request", snapshot(pending, wasDisposed));
        return { ...request };
      } catch { return {}; }
    },
    response() {
      try { responseAt = now(); } catch { /* diagnostic only */ }
    },
    failed(kind: FailureKind, error: unknown, pending: number, disposed: boolean, task?: RequestContext): BackgroundWorkerFailure | undefined {
      try {
        failureAt = now();
        const failure = { ...snapshot(pending, disposed), ...task, ...errorDescription(error, kind), failure_kind: kind } as BackgroundWorkerFailure;
        const elapsed = duration(failure.request_at_ms, failure.failure_at_ms);
        if (elapsed !== undefined) failure.request_elapsed_ms = elapsed;
        associateBackgroundWorkerFailure(error, failure);
        associateBackgroundWorkerFailure(read(error, "error"), failure);
        recent.push({ ...failure }); if (recent.length > 4) recent.shift();
        if (failureBreadcrumbs++ < 3) breadcrumb("background.failed", failure as unknown as Record<string, Scalar>, true);
        return failure;
      } catch { /* diagnostic only */ }
    },
    dispose(reason: DisposeReason, pending: number) {
      try {
        if (reason === "cancelled" && !wasCancelled) { wasCancelled = true; cancelledAt = now(); }
        if (wasDisposed) return;
        wasDisposed = true; disposedAt = now();
        breadcrumb(reason === "cancelled" ? "background.cancelled" : "background.disposed", { ...snapshot(pending, true), dispose_reason: reason });
      } catch { /* diagnostic only */ }
    },
  };
}
