/** Optional parallel diagnostics. The shared Pulse tracker owns transport and scrubbing. */
type CaptureOptions = {
  tags?: Record<string, string>;
  fingerprint?: string[];
  contexts?: Record<string, unknown>;
  breadcrumbs?: PulseBreadcrumb[];
  handled?: boolean;
};
type PulseBreadcrumb = { category: string; message: string; data?: Record<string, unknown>; timestamp?: number };
type PulseApi = { captureException: (error: unknown, options?: CaptureOptions) => unknown };

/** First opt-in must bypass an older cached tracker that has no error API. */
export function pulseTrackerSource(src: string, enabled: boolean): string {
  if (!enabled) return src;
  const hashIndex = src.indexOf("#");
  const hash = hashIndex >= 0 ? src.slice(hashIndex) : "";
  const source = hashIndex >= 0 ? src.slice(0, hashIndex) : src;
  const queryIndex = source.indexOf("?");
  const path = queryIndex >= 0 ? source.slice(0, queryIndex) : source;
  const query = new URLSearchParams(queryIndex >= 0 ? source.slice(queryIndex + 1) : "");
  query.set("pulse-errors", "0.1.1");
  return `${path}?${query.toString()}${hash}`;
}

export function createPulseErrorBridge(enabled: () => boolean, getApi: () => PulseApi | undefined) {
  const pending: { error: unknown; options: CaptureOptions }[] = [];
  const breadcrumbs: PulseBreadcrumb[] = [];
  function flush() {
    try {
      if (!enabled()) { pending.length = 0; breadcrumbs.length = 0; return; }
      const api = getApi();
      if (typeof api?.captureException !== "function") return;
      for (const item of pending.splice(0, 20)) {
        try { void Promise.resolve(api.captureException(item.error, item.options)).catch(() => {}); }
        catch { /* A reporting failure must not replace the PDF result. */ }
      }
    } catch { /* optional diagnostics */ }
  }
  function captureException(error: unknown, options: CaptureOptions = {}) {
    try {
      if (!enabled()) return;
      // Preserve all grouping dimensions inside the SDK's five-part public contract.
      const parts = options.fingerprint;
      const fingerprint = parts && parts.length > 5
        ? [...parts.slice(0, 4), parts.slice(4).join("|").slice(0, 200)] : parts;
      if (pending.length >= 20) pending.shift();
      pending.push({ error, options: { ...options, handled: true, fingerprint,
        breadcrumbs: [...breadcrumbs, ...(options.breadcrumbs ?? [])].slice(-30) } });
      flush();
    } catch { /* optional diagnostics */ }
  }
  return {
    captureException,
    addBreadcrumb(crumb: PulseBreadcrumb) {
      try {
        if (!enabled()) return;
        breadcrumbs.push({ ...crumb, timestamp: Date.now() });
        if (breadcrumbs.length > 30) breadcrumbs.shift();
      } catch { /* optional diagnostics */ }
    },
    flush,
  };
}

const bridge = createPulseErrorBridge(
  () => process.env.NEXT_PUBLIC_PULSE_ERRORS === "true",
  () => typeof window === "undefined" ? undefined : (window as unknown as { umami?: PulseApi }).umami,
);
export const capturePulseException = bridge.captureException;
export const addPulseBreadcrumb = bridge.addBreadcrumb;
export const flushPulseErrors = bridge.flush;

/** Framework boundaries do not emit an unhandled browser error. Do not send document text. */
export function capturePulseApplicationError(error: unknown) {
  try {
    const input = error as { name?: unknown; stack?: unknown } | undefined;
    const safe = new Error("Application failed");
    safe.name = typeof input?.name === "string" && /^[A-Za-z][A-Za-z0-9]{0,79}$/.test(input.name) ? input.name : "Error";
    const frames = typeof input?.stack === "string" ? input.stack.slice(0, 16000).split("\n").slice(1, 40)
      .flatMap(line => {
        // Multiline Error.message can resemble a frame. Retain coordinates,
        // never arbitrary function labels or text before/after the script URL.
        const match = line.match(/(https?:\/\/[^\s)]+\/(?:_next|assets)\/[^\s)]*?\.m?js(?:\?[^\s)]*?)?):(\d+):(\d+)/);
        if (!match) return [];
        try {
          const url = new URL(match[1]);
          return [`    at ${url.origin}${url.pathname}:${match[2]}:${match[3]}`];
        } catch { return []; }
      }) : [];
    safe.stack = `${safe.name}: ${safe.message}${frames.length ? `\n${frames.join("\n")}` : ""}`;
    capturePulseException(safe, { tags: { stage: "framework-boundary" } });
  } catch { /* optional diagnostics */ }
}
