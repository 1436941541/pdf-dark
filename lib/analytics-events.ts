// Only aggregate, explicitly selected metadata belongs in analytics. Never pass
// File objects, names, PDF text, error messages, URLs or performance entries.
export type PdfTool = "reader" | "invert" | "monochrome" | "deskew" | "whiten";
export type PdfStage = "prepare" | "read" | "preview" | "export" | "sample";
export type PdfInput = "file" | "sample";
export type PdfEvent = "pdf_start" | "pdf_success" | "pdf_error" | "pdf_cancel" | "pdf_download";
export type PdfEventData = {
  tool: PdfTool;
  stage: PdfStage;
  page?: string;
  input?: PdfInput;
  size_bucket?: string;
  output_size_bucket?: string;
  pages?: number;
  duration_ms?: number;
  reason?: "invalid" | "password" | "processing";
};
type Data = Record<string, string | number>;
type Event = { name: string; data: Data };
declare global {
  interface Window {
    umami?: { track: (name: string, data: Data) => unknown };
  }
}
const queue: Event[] = [];
const MAX_PENDING = 50;

export function telemetryPage(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0];
  if (/^\/(?:((es|pt|de)\/?)?|(es\/|pt\/|de\/)?invert-pdf-colors|pdf-to-black-and-white|deskew-pdf|whiten-pdf|about|privacy|terms|changelog)$/.test(pathname)) return pathname;
  return pathname.startsWith("/blog") ? "/blog" : "/other";
}

function send(event: Event) {
  // Analytics must never block a PDF operation or create unhandled rejections.
  try { void Promise.resolve(window.umami!.track(event.name, event.data)).catch(() => {}); } catch {}
}
export function flushAnalyticsEvents() {
  if (typeof window === "undefined" || typeof window.umami?.track !== "function") return;
  for (const event of queue.splice(0)) send(event);
}
function track(name: string, data: Data) {
  if (typeof window === "undefined") return;
  if (typeof window.umami?.track === "function") {
    flushAnalyticsEvents();
    send({ name, data });
  } else {
    if (queue.length >= MAX_PENDING) queue.shift();
    queue.push({ name, data });
  }
}
export function sizeBucket(bytes: number): string {
  if (bytes < 1024 * 1024) return "under-1mb";
  if (bytes < 10 * 1024 * 1024) return "1-10mb";
  if (bytes < 50 * 1024 * 1024) return "10-50mb";
  return "50mb-plus";
}
export function trackPdfEvent(name: PdfEvent, data: PdfEventData) {
  if (typeof window === "undefined") return;
  const safe: Data = { tool: data.tool, stage: data.stage, page: telemetryPage(data.page ?? window.location.pathname) };
  if (data.input) safe.input = data.input;
  if (data.size_bucket) safe.size_bucket = data.size_bucket;
  if (data.output_size_bucket) safe.output_size_bucket = data.output_size_bucket;
  if (data.pages !== undefined && Number.isFinite(data.pages)) safe.pages = Math.max(0, Math.round(data.pages));
  if (data.duration_ms !== undefined && Number.isFinite(data.duration_ms)) safe.duration_ms = Math.max(0, Math.round(data.duration_ms));
  if (data.reason) safe.reason = data.reason;
  track(name, safe);
}
