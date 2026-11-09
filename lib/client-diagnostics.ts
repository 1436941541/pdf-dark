import type { Breadcrumb, ErrorEvent as SentryErrorEvent, EventHint } from "@sentry/nextjs";
import { telemetryPage, type PdfStage, type PdfTool } from "./analytics-events";

type CodeFrame = { filename: string; lineno?: number; colno?: number };
type RequestLog = {
  id: number; started: number; ended?: number; service: string; url: string; method: string;
  rsc: boolean; outcome: "pending" | "fulfilled" | "http_error" | "rejected" | "threw";
  status?: number; reason_type?: string; abort_requested?: boolean; initiator: CodeFrame[];
};
type OperationLog = {
  id: number; tool: string; stage: string; started: number; ended?: number;
  outcome: "pending" | "success" | "cancel" | "failure"; initiator: CodeFrame[];
};
const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const ERROR_NAMES = new Set(["Error", "TypeError", "RangeError", "SyntaxError", "AbortError", "NetworkError", "SecurityError", "InvalidStateError", "EncodingError"]);
const TOOLS = new Set(["reader", "invert", "monochrome", "deskew", "whiten"]);
const STAGES = new Set(["prepare", "read", "preview", "export", "sample"]);

function origin() {
  return typeof window === "undefined" ? "https://pdfdark.org" : window.location.origin;
}
function reasonType(value: unknown): string {
  if (value === null) return "null";
  try {
    if (typeof value === "object" && "name" in value && typeof value.name === "string" && ERROR_NAMES.has(value.name)) return value.name;
  } catch { /* Untrusted exception getters are not diagnostics. */ }
  return typeof value;
}
function safeMethod(method: unknown) {
  const value = typeof method === "string" ? method.toUpperCase() : "GET";
  return METHODS.has(value) ? value : "OTHER";
}

// No document URLs, arbitrary hosts/paths, query values or tracker IDs survive.
export function diagnosticTarget(input: string) {
  // PDF bitmaps can be multi-megabyte data URLs. Do not parse or retain them.
  if (!input || input.length > 4096 || /^(?:data|blob):/i.test(input)) return null;
  try {
    const url = new URL(input, origin());
    if (!/^https?:$/.test(url.protocol)) return null;
    const host = url.hostname;
    if (host === "sentry.io" || host.endsWith(".sentry.io") || host.endsWith(".getsentry.com")) return null;
    if (url.origin === origin() || host === "pdfdark.org" || host === "www.pdfdark.org") {
      const path = url.pathname.startsWith("/_next/") ? "/_next/asset"
        : url.pathname.startsWith("/examples/") ? "/examples/sample" : telemetryPage(url.pathname);
      return { service: "site", url: `site:${path}`, rsc: url.searchParams.has("_rsc") };
    }
    if (host === "google-analytics.com" || host.endsWith(".google-analytics.com")) return { service: "google_analytics", url: "google_analytics:collect", rsc: false };
    if (host === "googletagmanager.com" || host.endsWith(".googletagmanager.com")) return { service: "google_tag_manager", url: "google_tag_manager:script", rsc: false };
    if (host === "clarity.ms" || host.endsWith(".clarity.ms")) return { service: "clarity", url: "clarity:resource", rsc: false };
    if (host === "yj-pulse.vercel.app") return { service: "umami", url: "umami:resource", rsc: false };
    return { service: "external", url: "external:resource", rsc: false };
  } catch { return null; }
}

// These are explicitly request/task INITIATION frames, never a fabricated
// rejection stack. Only deployed application code locations are retained.
export function diagnosticCodeFrames(stack: unknown): CodeFrame[] {
  if (typeof stack !== "string") return [];
  const frames: CodeFrame[] = [];
  for (const line of stack.split("\n").slice(1, 20)) {
    const match = line.match(/(https?:\/\/[^\s@()]+?\/_next\/static\/[a-zA-Z0-9_~./-]+\.m?js)(?::(\d+))?(?::(\d+))?/);
    if (!match) continue;
    try {
      const url = new URL(match[1]);
      if (url.origin !== origin() && url.origin !== "https://pdfdark.org" && url.origin !== "https://www.pdfdark.org") continue;
      if (url.pathname.length > 220) continue;
      frames.push({ filename: `${url.origin}${url.pathname}`, ...(match[2] ? { lineno: Number(match[2]) } : {}), ...(match[3] ? { colno: Number(match[3]) } : {}) });
      if (frames.length === 5) break;
    } catch { /* Ignore malformed frames. */ }
  }
  return frames;
}

export function createClientDiagnostics() {
  const requests: RequestLog[] = [];
  const operations: OperationLog[] = [];
  const rejections: { time: number; reason_type: string; returned_fetch_request_id?: number }[] = [];
  const promises = new WeakMap<Promise<Response>, number>();
  let sequence = 0;
  let leaving = false;
  let navigation: { time: number; page: string } | undefined;
  let observing = false;
  let instrumented = false;
  const guard = (run: () => void) => { try { run(); } catch { /* Diagnostics must never affect the application. */ } };

  function wrapFetch(fetcher: typeof fetch): typeof fetch {
    return function (this: unknown, ...args: Parameters<typeof fetch>) {
      let log: RequestLog | undefined;
      guard(() => {
        const input = args[0];
        const request = typeof Request !== "undefined" && input instanceof Request ? input : undefined;
        const target = diagnosticTarget(typeof input === "string" ? input : input instanceof URL ? input.href : request?.url ?? "");
        if (!target) return;
        log = { id: ++sequence, started: Date.now(), ...target, method: safeMethod(args[1]?.method ?? request?.method), outcome: "pending", initiator: diagnosticCodeFrames(new Error("Fetch initiation").stack) };
        requests.push(log);
        if (requests.length > 10) requests.shift();
      });
      const finish = (outcome: RequestLog["outcome"], error?: unknown, response?: Response) => guard(() => {
        if (!log) return;
        log.ended = Date.now(); log.outcome = outcome;
        if (response) log.status = response.status;
        if (outcome === "rejected" || outcome === "threw") log.reason_type = reasonType(error);
        const input = args[0];
        const signal = args[1]?.signal ?? (typeof Request !== "undefined" && input instanceof Request ? input.signal : undefined);
        log.abort_requested = signal?.aborted === true;
      });
      let result: Promise<Response>;
      try { result = Reflect.apply(fetcher, this, args); }
      catch (error) { finish("threw", error); throw error; }
      if (!log) return result;
      // Propagate the original response/rejection unchanged. This returned
      // promise, not a detached observer promise, retains unhandled semantics.
      const observed = result.then(response => { finish(response.ok ? "fulfilled" : "http_error", undefined, response); return response; },
        error => { finish("rejected", error); throw error; });
      guard(() => { promises.set(observed, log!.id); });
      return observed;
    };
  }

  return {
    wrapFetch,
    observeWindow(target: Window) {
      if (observing) return;
      observing = true;
      // Register BEFORE Sentry global handlers so beforeSend can see this
      // native observation. No rejection is prevented, swallowed or re-thrown.
      guard(() => target.addEventListener("unhandledrejection", event => guard(() => {
        const id = promises.get(event.promise);
        rejections.push({ time: Date.now(), reason_type: reasonType(event.reason), ...(id === undefined ? {} : { returned_fetch_request_id: id }) });
        if (rejections.length > 3) rejections.shift();
      })));
      guard(() => target.addEventListener("pagehide", () => { leaving = true; }));
      guard(() => target.addEventListener("pageshow", () => { leaving = false; }));
    },
    instrumentFetch(target: Window) {
      if (instrumented) return;
      instrumented = true;
      guard(() => { target.fetch = wrapFetch(target.fetch); });
    },
    beginOperation(tool: PdfTool, stage: PdfStage) {
      let operation: OperationLog | undefined;
      guard(() => {
        operation = { id: ++sequence, tool: TOOLS.has(tool) ? tool : "other", stage: STAGES.has(stage) ? stage : "other", started: Date.now(), outcome: "pending", initiator: diagnosticCodeFrames(new Error("PDF operation initiation").stack) };
        operations.push(operation);
        if (operations.length > 8) operations.shift();
      });
      return { finish(outcome: "success" | "cancel" | "failure") { guard(() => {
        if (operation?.outcome === "pending") { operation.outcome = outcome; operation.ended = Date.now(); }
      }); } };
    },
    navigation(path: string) { guard(() => { navigation = { time: Date.now(), page: telemetryPage(new URL(path, origin()).pathname) }; }); },
    networkBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
      const target = typeof breadcrumb.data?.url === "string" ? diagnosticTarget(breadcrumb.data.url) : null;
      if (!target) return null;
      return { ...breadcrumb, data: { ...target, method: safeMethod(breadcrumb.data?.method),
        ...(typeof breadcrumb.data?.status_code === "number" ? { status_code: breadcrumb.data.status_code } : {}),
        ...(typeof breadcrumb.data?.__span === "string" && /^[a-f0-9]{16}$/i.test(breadcrumb.data.__span) ? { __span: breadcrumb.data.__span } : {}) } };
    },
    enrich(event: SentryErrorEvent, hint: EventHint) {
      guard(() => {
        const hasStack = event.exception?.values?.some(value => !!value.stacktrace?.frames?.length) === true;
        const hasOriginal = Object.prototype.hasOwnProperty.call(hint, "originalException");
        event.tags = { ...event.tags, client_diagnostics: "v1", reported_stack: hasStack ? "present" : "missing" };
        event.contexts = { ...event.contexts, client_diagnostics: {
          note: "Recent observations are not proof of causation. Initiator frames are not rejection stacks.",
          observed_at: Date.now(),
          page: typeof window === "undefined" ? "/other" : telemetryPage(window.location.pathname),
          ready_state: typeof document === "undefined" ? "unknown" : document.readyState,
          visibility: typeof document === "undefined" ? "unknown" : document.visibilityState,
          online: typeof navigator === "undefined" ? null : navigator.onLine,
          leaving, navigation,
          captured_value_type: hasOriginal ? reasonType(hint.originalException) : "not_provided",
          requests: requests.map(request => ({ ...request, initiator: [...request.initiator] })),
          operations: operations.map(operation => ({ ...operation, initiator: [...operation.initiator] })),
          rejections: rejections.map(rejection => ({ ...rejection })),
        } };
      });
      return event;
    },
  };
}

export const clientDiagnostics = createClientDiagnostics();
