import { telemetryPage, trackPdfEvent, type PdfInput, type PdfStage, type PdfTool } from "./analytics-events";
import { capturePulseException } from "./pulse-error-monitoring";

// Operations that never reach success/cancel/failure are otherwise invisible:
// a closed tab sends nothing, and a tab killed by the OS (commonly iOS memory
// pressure) cannot run any code at all. Each running operation is mirrored to
// sessionStorage; pagehide reports it as "abandon" and clears the mirror, so a
// mirror that survives to the next load means the page ended without pagehide.
// Only the allowlisted metadata below is stored — never PDF data or names.
export type LifecycleBase = { tool: PdfTool; stage: PdfStage; input: PdfInput; size_bucket?: string; pages?: number };
export type LifecycleRecord = LifecycleBase & {
  id: number; page: string; started_at: number; updated_at: number;
  step?: string; at_page?: number; hidden: boolean; hidden_ms: number; hidden_since?: number;
};
export type LifecycleReport = { kind: "abandon"; record: LifecycleRecord; background: boolean; persisted: boolean; at: number }
  | { kind: "interrupted"; record: LifecycleRecord; at: number };
type Host = Pick<Window, "addEventListener"> & { document?: Pick<Document, "visibilityState">; sessionStorage?: Storage; location?: { pathname: string } };

const KEY = "pdfdark:active-operations";
const STEP = /^[a-z][a-z0-9_]{0,39}$/;
const MAX_ACTIVE = 4;

const TOOLS = new Set(["reader", "invert", "monochrome", "deskew", "whiten"]);
const STAGES = new Set(["prepare", "read", "preview", "export", "sample"]);

// Stored records are re-validated: they come back from storage, not from this page's code.
function isRecord(value: unknown): value is LifecycleRecord {
  const item = value as Partial<LifecycleRecord> | null;
  return !!item && TOOLS.has(item.tool as string) && STAGES.has(item.stage as string)
    && Number.isFinite(item.started_at) && Number.isFinite(item.updated_at) && typeof item.hidden_ms === "number"
    && (item.step === undefined || STEP.test(item.step));
}

export function createPdfLifecycle(report: (event: LifecycleReport) => void, now: () => number = Date.now) {
  const active = new Map<number, LifecycleRecord>();
  let host: Host | undefined;
  let sequence = 0;
  const guard = (run: () => void) => { try { run(); } catch { /* Lifecycle tracking must never affect a PDF operation. */ } };
  const hidden = () => host?.document?.visibilityState === "hidden";

  function persist() {
    guard(() => {
      const storage = host?.sessionStorage;
      if (!storage) return;
      if (active.size === 0) storage.removeItem(KEY);
      else storage.setItem(KEY, JSON.stringify([...active.values()]));
    });
  }
  function settleHidden(record: LifecycleRecord, at: number) {
    if (record.hidden_since !== undefined) record.hidden_ms += Math.max(0, at - record.hidden_since);
    record.hidden_since = undefined;
  }

  return {
    /** Must run before the first operation of a page load. Safe to call repeatedly. */
    install(target: Host) {
      if (host) return;
      host = target;
      guard(() => {
        const storage = target.sessionStorage;
        const raw = storage?.getItem(KEY);
        if (!raw) return;
        storage!.removeItem(KEY);
        const records = JSON.parse(raw) as unknown;
        if (!Array.isArray(records)) return;
        for (const record of records.slice(0, MAX_ACTIVE)) if (isRecord(record)) guard(() => report({ kind: "interrupted", record, at: now() }));
      });
      guard(() => target.addEventListener("pagehide", event => guard(() => {
        const at = now();
        for (const record of active.values()) {
          const background = record.hidden_since !== undefined;
          settleHidden(record, at);
          guard(() => report({ kind: "abandon", record: { ...record }, background, persisted: (event as PageTransitionEvent).persisted === true, at }));
        }
        // Reported here, so an unload is not misread as an interruption next load.
        active.clear();
        persist();
      })));
      guard(() => target.addEventListener("visibilitychange", () => guard(() => {
        const at = now();
        for (const record of active.values()) {
          if (hidden()) { record.hidden = true; record.hidden_since ??= at; } else settleHidden(record, at);
          record.updated_at = at;
        }
        persist();
      })));
    },
    begin(base: LifecycleBase) {
      let record: LifecycleRecord | undefined;
      guard(() => {
        const at = now();
        record = { ...base, id: ++sequence, page: telemetryPage(host?.location?.pathname ?? "/other"), started_at: at, updated_at: at,
          hidden: hidden(), hidden_ms: 0, ...(hidden() ? { hidden_since: at } : {}) };
        active.set(record.id, record);
        if (active.size > MAX_ACTIVE) active.delete(active.keys().next().value!);
        persist();
      });
      return {
        progress(step: string, atPage?: number, totalPages?: number) {
          guard(() => {
            if (!record || !active.has(record.id) || !STEP.test(step)) return;
            record.step = step;
            if (atPage !== undefined && Number.isFinite(atPage)) record.at_page = Math.max(0, Math.round(atPage));
            if (totalPages !== undefined && Number.isFinite(totalPages)) record.pages = Math.max(0, Math.round(totalPages));
            record.updated_at = now();
            persist();
          });
        },
        end() { guard(() => { if (record && active.delete(record.id)) persist(); }); },
      };
    },
  };
}

// background: the page was hidden when it ended (for interruptions, at the last recorded update).
function eventData(record: LifecycleRecord, durationMs: number, background: boolean) {
  return {
    background: background ? 1 : 0,
    tool: record.tool, stage: record.stage, page: record.page, input: record.input, size_bucket: record.size_bucket,
    pages: record.pages, duration_ms: durationMs, step: record.step, at_page: record.at_page,
    hidden: record.hidden ? 1 : 0, hidden_ms: record.hidden_ms,
  } as const;
}

export const pdfLifecycle = createPdfLifecycle(event => {
  const { record } = event;
  if (event.kind === "abandon") {
    trackPdfEvent("pdf_abandon", { ...eventData(record, event.at - record.started_at, event.background), persisted: event.persisted ? 1 : 0 });
    return;
  }
  // The crash time is unknown; the last recorded progress bounds the elapsed time.
  const data = eventData(record, record.updated_at - record.started_at, record.hidden_since !== undefined);
  trackPdfEvent("pdf_interrupted", data);
  const error = new Error("PDF operation ended without a result");
  error.name = "PdfOperationInterrupted";
  // There is no stack from the ended page. Do not attach this reporter's own frames.
  error.stack = `${error.name}: ${error.message}`;
  const step = record.step ?? "none";
  capturePulseException(error, {
    tags: { tool: record.tool, stage: record.stage, step },
    fingerprint: ["pdf-interrupted", record.tool, record.stage, step],
    contexts: { pdf_interrupted: { ...data, note: "Previous page load ended without pagehide while this operation was running." } },
  });
});
