import type { ErrorEvent as SentryErrorEvent, EventHint } from "@sentry/nextjs";
import { readImageMemorySnapshot } from "./pdf-image-resource-diagnostics";
import { getBackgroundWorkerFailure, getRecentBackgroundWorkerFailures } from "./background-worker-diagnostics";

type Scalar = string | number | boolean;
type ScriptErrorKind = "syntax" | "module_load" | "import_scripts" | "script_load" | "runtime" | "unknown";
type SourceKind = "site_static" | "app_static" | "same_origin_other" | "external" | "blob" | "data" | "file" | "extension" | "other" | "unknown";
type CodeSource = { source_kind: SourceKind; filename?: string; script_path?: string };
type Observation = Record<string, Scalar> & CodeSource & { error_kind: ScriptErrorKind };

const ERROR_TYPES = new Set([
  "Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "DOMException",
  "SecurityError", "NetworkError", "DataCloneError", "InvalidStateError", "NotSupportedError",
  "AbortError", "QuotaExceededError", "OperationError", "UnknownError", "ErrorEvent", "MessageEvent",
]);
const WORKER_NUMBERS = [
  "version", "worker_id", "request_id", "request_at_ms", "page_number", "width", "height", "strength", "pending_count",
  "created_at_ms", "first_request_at_ms", "last_request_at_ms", "response_at_ms", "failure_at_ms",
  "cancelled_at_ms", "disposed_at_ms", "elapsed_ms", "first_request_elapsed_ms", "response_elapsed_ms",
  "failure_elapsed_ms", "cancelled_elapsed_ms", "disposed_elapsed_ms", "request_elapsed_ms",
] as const;
const WORKER_KINDS = new Set(["constructor", "post_message", "error_event", "message_error", "response_error", "missing_buffer"]);

function read(value: unknown, key: string): unknown {
  try { return value == null ? undefined : (value as Record<string, unknown>)[key]; }
  catch { return undefined; }
}
function object(value: unknown): value is object {
  return value !== null && (typeof value === "object" || typeof value === "function");
}
function number(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : undefined;
}
function integer(value: unknown): number | undefined {
  const result = number(value);
  return result !== undefined && Number.isInteger(result) ? result : undefined;
}
function now(): number | undefined {
  try { return integer(Date.now()); } catch { return undefined; }
}
function optionalNumber(target: Record<string, Scalar>, key: string, value: unknown, whole = false): void {
  const safe = whole ? integer(value) : number(value);
  if (safe !== undefined) target[key] = safe;
}
function flags(): Record<string, Scalar> {
  const result: Record<string, Scalar> = {};
  try {
    const value = document.readyState;
    if (value === "loading" || value === "interactive" || value === "complete") result.ready_state = value;
  } catch { /* Browser flags are optional. */ }
  try {
    const value = document.visibilityState;
    if (value === "visible" || value === "hidden") result.visibility = value;
  } catch { /* Browser flags are optional. */ }
  try { const value = document.hasFocus(); if (typeof value === "boolean") result.document_focused = value; } catch { /* optional */ }
  try { const value = navigator.onLine; if (typeof value === "boolean") result.online = value; } catch { /* optional */ }
  return result;
}
function errorKind(value: unknown): ScriptErrorKind {
  if (read(value, "name") === "SyntaxError" || read(value, "type") === "SyntaxError") return "syntax";
  const message = read(value, "message") ?? read(value, "value");
  if (typeof message === "string") {
    const bounded = message.slice(0, 2048);
    if (/^(?:Uncaught(?: \(in promise\))?\s+)?SyntaxError\b/.test(bounded)) return "syntax";
    if (/\bimportScripts\b/.test(bounded)) return "import_scripts";
    if (/failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script/i.test(bounded)) return "module_load";
    if (/failed to (?:load|fetch).{0,48}(?:script|module)|(?:script|module).{0,64}failed to load/i.test(bounded)) return "script_load";
  }
  return "unknown";
}
function relevant(kind: ScriptErrorKind): boolean { return kind !== "unknown" && kind !== "runtime"; }

function memory(): Record<string, Scalar> {
  const result: Record<string, Scalar> = {};
  try {
    const snapshot = readImageMemorySnapshot();
    const api = read(snapshot, "memory_api");
    if (api === "performance.memory" || api === "unavailable") result.memory_api = api;
    for (const key of ["js_heap_used_bytes", "js_heap_total_bytes", "js_heap_limit_bytes", "device_memory_gb"]) optionalNumber(result, key, read(snapshot, key));
  } catch { /* The memory API must not affect capture. */ }
  return result;
}

export function createBrowserScriptDiagnostics() {
  const observations: Observation[] = [];
  const associated = new WeakMap<object, Observation>();
  const observing = new WeakSet<object>();
  let pageOrigin: string | undefined;
  const lifecycle: Record<string, Scalar> = {};

  function source(value: unknown): CodeSource {
    if (typeof value !== "string" || value.length === 0) return { source_kind: "unknown" };
    // Never parse document-sized data URLs or retain private local-media URLs.
    if (/^blob:/i.test(value)) return { source_kind: "blob" };
    if (/^data:/i.test(value)) return { source_kind: "data" };
    if (/^file:/i.test(value)) return { source_kind: "file" };
    if (/^(?:chrome|moz|safari-web)-extension:/i.test(value)) return { source_kind: "extension" };
    if (value.length > 2048) return { source_kind: "other" };
    try {
      const url = new URL(value, pageOrigin);
      const app = url.protocol === "app:" && url.hostname === "";
      const site = /^https?:$/.test(url.protocol) && pageOrigin !== undefined && url.origin === pageOrigin;
      if (!app && !site) return { source_kind: /^https?:$/.test(url.protocol) ? "external" : "other" };
      const path = url.pathname;
      if (path.length > 240 || !/^\/_next\/static\/(?:[A-Za-z0-9_~-]+\/){0,10}[A-Za-z0-9_~-][A-Za-z0-9_~.-]*\.m?js$/.test(path)) {
        return { source_kind: site ? "same_origin_other" : "other" };
      }
      return { source_kind: app ? "app_static" : "site_static", filename: app ? `app://${path}` : `${url.origin}${path}`, script_path: path };
    } catch { return { source_kind: "other" }; }
  }

  function workerSnapshot(value: unknown, relationship: "exact" | "recent"): Record<string, Scalar> | undefined {
    if (!object(value)) return;
    const result: Record<string, Scalar> = { relationship };
    for (const key of WORKER_NUMBERS) optionalNumber(result, key, read(value, key));
    for (const key of ["preserve_colors", "disposed", "disposed_before_error", "cancelled_before_error", "online"]) {
      const flag = read(value, key); if (typeof flag === "boolean") result[key] = flag;
    }
    const kind = read(value, "failure_kind"), type = read(value, "error_type"), hint = read(value, "error_hint");
    if (typeof kind === "string" && WORKER_KINDS.has(kind)) result.failure_kind = kind;
    if (typeof type === "string" && ERROR_TYPES.has(type)) result.error_type = type;
    if (hint === "import_scripts" || hint === "script_load" || hint === "other") result.error_hint = hint;
    const mode = read(value, "mode"); if (mode === "preview" || mode === "export") result.mode = mode;
    const visibility = read(value, "visibility"); if (visibility === "visible" || visibility === "hidden") result.visibility = visibility;
    for (const key of ["script_path", "imported_script_path"]) {
      const safe = source(read(value, key)); if (safe.script_path) result[key] = safe.script_path;
    }
    return result;
  }

  function observe(nativeEvent: Event): void {
    const target = read(nativeEvent, "target");
    const isScript = read(target, "tagName") === "SCRIPT";
    const filename = read(nativeEvent, "filename");
    const underlying = read(nativeEvent, "error");
    // Resource errors from images, links and other DOM elements are unrelated.
    if (!isScript && typeof filename !== "string" && !object(underlying)) return;
    let kind = isScript ? "script_load" as const : errorKind(underlying);
    if (kind === "unknown") kind = errorKind(nativeEvent);
    const observation: Observation = {
      ...source(isScript ? read(target, "src") : filename),
      ...flags(), error_kind: kind === "unknown" ? "runtime" : kind,
      observation_kind: isScript ? "script_resource_error" : "native_error_event",
    };
    optionalNumber(observation, "observed_at_ms", now(), true);
    optionalNumber(observation, "event_timestamp_ms", read(nativeEvent, "timeStamp"));
    for (const key of ["lineno", "colno"]) optionalNumber(observation, key, read(nativeEvent, key), true);
    const trusted = read(nativeEvent, "isTrusted"); if (typeof trusted === "boolean") observation.event_trusted = trusted;
    const name = read(underlying, "name"); if (typeof name === "string" && ERROR_TYPES.has(name)) observation.error_type = name;
    observations.push(Object.freeze(observation));
    if (observations.length > 6) observations.shift();
    associated.set(nativeEvent, observation);
    if (object(underlying)) associated.set(underlying, observation);
  }

  function reportedFrames(event: SentryErrorEvent): Record<string, Scalar>[] {
    const result: Record<string, Scalar>[] = [];
    const values = read(read(event, "exception"), "values");
    if (!Array.isArray(values)) return result;
    for (let index = 0; index < Math.min(values.length, 8); index++) {
      const frames = read(read(read(values, String(index)), "stacktrace"), "frames");
      if (!Array.isArray(frames)) continue;
      for (let frameIndex = Math.max(0, frames.length - 40); frameIndex < frames.length && result.length < 6; frameIndex++) {
        const frame = read(frames, String(frameIndex));
        const safe = source(read(frame, "filename"));
        const summary: Record<string, Scalar> = { relationship: "reported_frame", ...safe };
        for (const key of ["lineno", "colno"]) optionalNumber(summary, key, read(frame, key), true);
        result.push(summary);
      }
    }
    return result;
  }

  function timings(paths: string[]): Record<string, Scalar>[] {
    if (!paths.length) return [];
    const matches = new Map<string, Record<string, Scalar>>();
    let entries: PerformanceEntry[];
    try {
      entries = performance.getEntriesByType("resource");
    } catch { return paths.map(script_path => ({ script_path, timing_status: "unavailable" })); }
    if (!Array.isArray(entries)) return paths.map(script_path => ({ script_path, timing_status: "unavailable" }));
    // Passive buffer inspection only, bounded even if the browser retains a large history.
    for (let index = entries.length - 1, end = Math.max(0, entries.length - 128); index >= end; index--) {
      const entry = read(entries, String(index));
      if (read(entry, "entryType") !== "resource") continue;
      const path = source(read(entry, "name")).script_path;
      if (!path || !paths.includes(path) || matches.has(path)) continue;
      const result: Record<string, Scalar> = { script_path: path, timing_status: "matched", match_basis: "sanitized_script_path" };
      for (const [from, to] of [["startTime", "start_time_ms"], ["duration", "duration_ms"], ["transferSize", "transfer_bytes"], ["encodedBodySize", "encoded_body_bytes"], ["decodedBodySize", "decoded_body_bytes"]]) {
        optionalNumber(result, to, read(entry, from), from !== "duration" && from !== "startTime");
      }
      const status = integer(read(entry, "responseStatus")); if (status !== undefined && status <= 599) result.response_status = status;
      matches.set(path, result);
    }
    return paths.map(script_path => matches.get(script_path) ?? { script_path, timing_status: "not_found" });
  }

  return {
    observeWindow(target: Window): void {
      try {
        if (observing.has(target)) return;
        observing.add(target);
        const candidate = read(read(target, "location"), "origin");
        if (typeof candidate === "string") {
          try { const url = new URL(candidate); if (/^https?:$/.test(url.protocol)) pageOrigin = url.origin; } catch { /* No usable origin. */ }
        }
        // Observe before Sentry's global handler; never prevent, stop or rethrow an event.
        try { target.addEventListener("error", nativeEvent => { try { observe(nativeEvent); } catch { /* diagnostic only */ } }, true); } catch { /* optional */ }
        for (const type of ["pagehide", "pageshow"] as const) {
          try { target.addEventListener(type, nativeEvent => {
            try {
              optionalNumber(lifecycle, `last_${type}_at_ms`, now(), true);
              const persisted = read(nativeEvent, "persisted");
              if (typeof persisted === "boolean") lifecycle[`last_${type}_persisted`] = persisted;
              else delete lifecycle[`last_${type}_persisted`];
            } catch { /* diagnostic only */ }
          }); } catch { /* optional */ }
        }
      } catch { /* Instrumentation must not block startup. */ }
    },
    enrich(event: SentryErrorEvent, hint: EventHint): SentryErrorEvent {
      try {
        const original = read(hint, "originalException");
        const exact = object(original) ? associated.get(original) : undefined;
        const worker = getBackgroundWorkerFailure(original);
        let kind = errorKind(original);
        if (!relevant(kind) && exact && relevant(exact.error_kind)) kind = exact.error_kind;
        if (!relevant(kind)) {
          const values = read(read(event, "exception"), "values");
          if (Array.isArray(values)) for (let index = 0; index < Math.min(values.length, 8); index++) {
            const candidate = errorKind(read(values, String(index)));
            if (relevant(candidate)) { kind = candidate; break; }
          }
        }
        if (!relevant(kind) && worker) {
          const type = read(worker, "error_type"), hint = read(worker, "error_hint");
          if (type === "SyntaxError") kind = "syntax";
          else if (hint === "import_scripts" || hint === "script_load") kind = hint;
        }
        if (!relevant(kind)) return event;
        const frames = reportedFrames(event);
        const recent = observations.map(observation => ({ ...observation, relationship: "recent" }));
        const exactWorker = workerSnapshot(worker, "exact");
        const recentWorkers = exactWorker ? [] : getRecentBackgroundWorkerFailures().slice(-4)
          .map(value => workerSnapshot(value, "recent")).filter(value => value !== undefined);
        const paths = new Set<string>();
        for (const observation of [exact, ...recent, ...frames, exactWorker, ...recentWorkers]) {
          const path = read(observation, "script_path"); if (typeof path === "string") paths.add(path);
          const imported = read(observation, "imported_script_path"); if (typeof imported === "string") paths.add(imported);
          if (paths.size >= 6) break;
        }
        const enrichedAt = now();
        const context = {
          version: 1, error_kind: kind,
          relationship: exact ? "exact_native" : exactWorker ? "exact_worker" : "recent",
          note: "Recent observations do not establish causation. Reported frames are not newly captured stacks. Timing absence and zero sizes are inconclusive.",
          ...flags(), ...memory(), ...lifecycle,
          ...(enrichedAt === undefined ? {} : { enriched_at_ms: enrichedAt }),
          ...(exact ? { native_observation: { ...exact, relationship: "exact" } } : {}),
          recent_observations: recent, reported_frames: frames,
          resource_timings: timings([...paths].slice(0, 6)),
          ...(exactWorker ? { background_worker: exactWorker } : {}),
          ...(recentWorkers.length ? { recent_background_workers: recentWorkers } : {}),
        };
        event.contexts = { ...event.contexts, browser_script: context };
        event.tags = { ...event.tags, browser_script_diagnostics: "v1", browser_script_kind: kind, browser_script_relationship: context.relationship };
      } catch { /* Preserve the Sentry event even if any optional diagnostic fails. */ }
      return event;
    },
  };
}

export const browserScriptDiagnostics = createBrowserScriptDiagnostics();
