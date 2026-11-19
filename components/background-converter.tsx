"use client";

/* eslint-disable @next/next/no-img-element -- Previews are local canvas data URLs, not remote image assets. */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { DropZone } from "./drop-zone";
import { exportBackgroundPdf, previewBackgroundPdf, loadBackgroundPdf, type BackgroundExportSummary } from "@/lib/background-pdf";
import type { BackgroundOutcome, BackgroundSettings } from "@/lib/background";
import { classifyPdfLoadError, pdfLoadErrorText } from "@/lib/pdf-load-error";
import { yieldToMain } from "@/lib/main-thread";
import { beginPdfOperation, recordPdfFailure, trackPdfDownload } from "@/lib/pdf-monitoring";
import type { PdfInput } from "@/lib/analytics-events";

type Source = { file: File; pdf: PDFDocumentProxy; input: PdfInput };
type Preview = {
  original: string;
  converted: string;
  outcome: BackgroundOutcome;
  embeddedPhotos: number;
  key: string;
  loading: boolean;
  error: string | null;
};
const emptyPreview: Preview = {
  original: "",
  converted: "",
  outcome: "cleaned",
  embeddedPhotos: 0,
  key: "",
  loading: false,
  error: null,
};
const buttonClass = "rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-40";

function formatPageSample(pages: number[]) {
  if (pages.length <= 6) return `p. ${pages.join(", ")}`;
  return `p. ${pages.slice(0, 6).join(", ")} + ${pages.length - 6} more`;
}

export function BackgroundConverter({
  sample,
  onAutoSample,
}: {
  sample?: { url: string; name: string; id: number } | null;
  onAutoSample?: () => void;
}) {
  const [source, setSource] = useState<Source | null>(null);
  const [settings, setSettings] = useState<BackgroundSettings>({
    strength: 65,
    preserveColors: true,
    protectPhotos: true,
  });
  const [manualSkipped, setManualSkipped] = useState(new Set<number>());
  const [forcedClean, setForcedClean] = useState(new Set<number>());
  const [quality, setQuality] = useState<"standard" | "compact">("standard");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [activity, setActivity] = useState<{ kind: "loading" | "exporting"; done: number } | null>(null);
  const [preview, setPreview] = useState<Preview>(emptyPreview);
  const [error, setError] = useState<string | null>(null);
  const [exportSummary, setExportSummary] = useState<BackgroundExportSummary | null>(null);
  const [handledSampleId, setHandledSampleId] = useState<number | null>(null);
  const sampleFetch = useRef<AbortController | null>(null);
  const customized = useRef(false);
  const mounted = useRef(true);
  const loadId = useRef(0);
  const active = useRef<AbortController | null>(null);
  const downloadUrls = useRef(new Set<string>());

  const isManualSkip = manualSkipped.has(page);
  const isForcedClean = forcedClean.has(page);
  const previewKey = `${page}:${settings.strength}:${settings.preserveColors}:${settings.protectPhotos !== false}:${isManualSkip}:${isForcedClean}`;
  const pendingSample = Boolean(sample && handledSampleId !== sample.id);
  const busy = activity !== null || pendingSample;
  const previewReady = !preview.loading && preview.key === previewKey && Boolean(preview.converted);

  useEffect(() => {
    mounted.current = true;
    const urls = downloadUrls.current;
    return () => {
      mounted.current = false;
      active.current?.abort();
      sampleFetch.current?.abort();
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);
  useEffect(() => () => { void source?.pdf.destroy(); }, [source]);

  useEffect(() => {
    if (!source) return;
    const controller = new AbortController();
    async function update() {
      await yieldToMain();
      if (controller.signal.aborted) return;
      setPreview((current) => ({ ...current, loading: true, error: null }));
      const pageSettings: BackgroundSettings = isManualSkip
        ? { ...settings, strength: 0 }
        : isForcedClean
          ? { ...settings, protectPhotos: false }
          : settings;
      try {
        const result = await previewBackgroundPdf(source!.pdf, page, pageSettings, controller.signal);
        if (!controller.signal.aborted) {
          setPreview({ ...result, key: previewKey, loading: false, error: null });
        }
      } catch (failure) {
        if (!controller.signal.aborted) recordPdfFailure("whiten", "preview", failure, { input: source!.input });
        if (!controller.signal.aborted) {
          setPreview({
            ...emptyPreview,
            key: previewKey,
            error: failure instanceof Error ? failure.message : "Could not preview this page.",
          });
        }
      }
    }
    void update();
    return () => controller.abort();
  }, [source, page, settings, isManualSkip, isForcedClean, previewKey]);

  const selectFile = useCallback(async (file: File, input: PdfInput = "file") => {
    const id = ++loadId.current;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const operation = beginPdfOperation("whiten", "prepare", { bytes: file.size, input, signal: controller.signal });
    setSource(null);
    setManualSkipped(new Set());
    setForcedClean(new Set());
    setPreview(emptyPreview);
    setPage(1);
    setPageInput("1");
    setError(null);
    setExportSummary(null);
    setActivity({ kind: "loading", done: 0 });
    try {
      const pdf = await loadBackgroundPdf(file, controller.signal);
      if (id !== loadId.current || !mounted.current || controller.signal.aborted) { await pdf.destroy(); return; }
      setSource({ file, pdf, input });
      operation.success(pdf.numPages);
    } catch (failure) {
      if (id === loadId.current && mounted.current && !controller.signal.aborted) operation.failure(failure);
      if (id === loadId.current && mounted.current && !controller.signal.aborted) setError(pdfLoadErrorText(classifyPdfLoadError(failure)) ?? (failure instanceof Error ? failure.message : "Could not open this PDF."));
    } finally {
      operation.cancel();
      if (active.current === controller) {
        active.current = null;
        if (mounted.current) setActivity(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!sample) return;
    active.current?.abort();
    const currentLoad = loadId.current;
    const controller = new AbortController();
    sampleFetch.current = controller;
    async function openSample() {
      try {
        const response = await fetch(sample!.url, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load the sample PDF.");
        const blob = await response.blob();
        if (!controller.signal.aborted && currentLoad === loadId.current) {
          if (!customized.current) {
            setSettings({ strength: 65, preserveColors: true, protectPhotos: true });
            setQuality("standard");
          }
          await selectFile(new File([blob], sample!.name, { type: "application/pdf" }), "sample");
        }
      } catch (failure) {
        if (!controller.signal.aborted && currentLoad === loadId.current) recordPdfFailure("whiten", "sample", failure, { input: "sample" });
        if (!controller.signal.aborted && currentLoad === loadId.current) setError(failure instanceof Error ? failure.message : "Could not load the sample PDF.");
      } finally {
        if (!controller.signal.aborted && mounted.current) setHandledSampleId(sample!.id);
        if (sampleFetch.current === controller) sampleFetch.current = null;
      }
    }
    void openSample();
    return () => controller.abort();
  }, [sample, selectFile]);

  function cancel() {
    sampleFetch.current?.abort();
    setHandledSampleId(sample?.id ?? null);
    active.current?.abort();
    loadId.current++;
    active.current = null;
    setActivity(null);
  }
  function reset() {
    cancel();
    setSource(null);
    setManualSkipped(new Set());
    setForcedClean(new Set());
    setPage(1);
    setPageInput("1");
    setPreview(emptyPreview);
    setError(null);
    setExportSummary(null);
  }
  function updateSettings(next: BackgroundSettings, fromSlider = false) {
    customized.current = true;
    setSettings(next);
    setExportSummary(null);
    if (fromSlider && !source && !busy) {
      onAutoSample?.();
    }
  }
  function goToPage(nextPage: number) {
    setPage(nextPage);
    setPageInput(String(nextPage));
  }
  function keepCurrentPageOriginal() {
    const nextSkip = new Set(manualSkipped);
    nextSkip.add(page);
    const nextForce = new Set(forcedClean);
    nextForce.delete(page);
    setManualSkipped(nextSkip);
    setForcedClean(nextForce);
    setExportSummary(null);
  }
  function forceCleanCurrentPage() {
    const nextSkip = new Set(manualSkipped);
    nextSkip.delete(page);
    const nextForce = new Set(forcedClean);
    nextForce.add(page);
    setManualSkipped(nextSkip);
    setForcedClean(nextForce);
    setExportSummary(null);
  }
  function restoreAutoForCurrentPage() {
    const nextSkip = new Set(manualSkipped);
    nextSkip.delete(page);
    const nextForce = new Set(forcedClean);
    nextForce.delete(page);
    setManualSkipped(nextSkip);
    setForcedClean(nextForce);
    setExportSummary(null);
  }

  async function download() {
    if (!source || busy) return;
    const controller = new AbortController();
    const operation = beginPdfOperation("whiten", "export", { pages: source.pdf.numPages, bytes: source.file.size, input: source.input, signal: controller.signal });
    active.current = controller;
    setActivity({ kind: "exporting", done: 0 });
    setError(null);
    setExportSummary(null);
    try {
      const summary = await exportBackgroundPdf(source.pdf, settings, manualSkipped, forcedClean, quality, controller.signal, (done) => {
        if (mounted.current && !controller.signal.aborted) setActivity({ kind: "exporting", done });
      });
      if (controller.signal.aborted || !mounted.current) return;
      const url = URL.createObjectURL(new Blob([new Uint8Array(summary.bytes)], { type: "application/pdf" }));
      downloadUrls.current.add(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${source.file.name.replace(/\.pdf$/i, "")}-whitened.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => { URL.revokeObjectURL(url); downloadUrls.current.delete(url); }, 60000);
      operation.success();
      trackPdfDownload("whiten", source.pdf.numPages, summary.bytes.length, source.input);
      setExportSummary(summary);
    } catch (failure) {
      if (!controller.signal.aborted) operation.failure(failure);
      if (!controller.signal.aborted && mounted.current) setError(failure instanceof Error ? failure.message : "Could not export this PDF. Try a smaller file.");
    } finally {
      operation.cancel();
      if (active.current === controller) {
        active.current = null;
        if (mounted.current) setActivity(null);
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 text-left">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-8">
        <fieldset disabled={activity?.kind === "exporting"} className="mb-5 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
          <legend className="px-2 text-sm font-semibold text-neutral-100">Scan paper cleanup</legend>
          <div className="flex justify-between gap-3"><label htmlFor="background-strength" className="text-sm text-neutral-300">Cleaning strength · all cleaned pages</label><output htmlFor="background-strength" className="font-mono text-amber-300">{settings.strength}%</output></div>
          <input id="background-strength" type="range" min="0" max="100" step="5" value={settings.strength} onChange={(e) => updateSettings({ ...settings, strength: Number(e.target.value) }, true)} className="mt-3 w-full accent-amber-400" />
          <div className="flex justify-between text-xs text-neutral-500"><span>Gentle</span><span>Stronger cleaning</span></div>
          {!source && !busy && <p className="mt-2 text-xs text-neutral-400">Drag the slider to preview live on a sample scan, or drop your own PDF below.</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-start">
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm text-neutral-300"><input type="checkbox" checked={settings.preserveColors} onChange={(e) => updateSettings({ ...settings, preserveColors: e.target.checked })} className="size-4 accent-amber-400" />Protect colored text &amp; marks</label>
              <label className="flex items-center gap-2 text-sm text-neutral-300"><input type="checkbox" checked={settings.protectPhotos !== false} onChange={(e) => updateSettings({ ...settings, protectPhotos: e.target.checked })} className="size-4 accent-amber-400" />Protect photos &amp; covers automatically</label>
            </div>
            <div>
              <label htmlFor="background-quality" className="block text-xs text-neutral-400">Download quality</label>
              <select id="background-quality" value={quality} onChange={(e) => { customized.current = true; setQuality(e.target.value as "standard" | "compact"); setExportSummary(null); }} className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-300"><option value="standard">Sharper · up to 144 DPI</option><option value="compact">Compact · up to 72 DPI</option></select>
            </div>
          </div>
          <p className="mt-3 rounded-lg border border-neutral-800/80 bg-neutral-900/60 px-3 py-2 text-xs leading-relaxed text-neutral-400">
            <span className="font-medium text-neutral-300">Photo protection heads-up:</span>{" "}
            Full-page photos, dark covers, and embedded PDF photos stay untouched automatically. Heavily shaded or dense scans can occasionally trigger photo skip (use{" "}
            <span className="text-neutral-200">&ldquo;Clean page anyway&rdquo;</span>{" "}
            in preview), while small B&amp;W photos flattened onto a text scan may still lighten unless you keep that page original.
          </p>
        </fieldset>
        {!source && !busy && <DropZone onFile={selectFile} />}
        {source && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="break-all text-sm font-medium text-neutral-200">{source.file.name}</p>
                {source.input === "sample" && <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-300">Sample preview</span>}
              </div>
              <p className="mt-1 text-xs text-neutral-400">{source.pdf.numPages} {source.pdf.numPages === 1 ? "page" : "pages"}</p>
            </div>
            <button type="button" onClick={reset} disabled={busy} className={source.input === "sample" ? "rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium text-amber-400 hover:border-amber-400 disabled:opacity-40" : buttonClass}>
              {source.input === "sample" ? "Upload your own PDF" : "Choose another PDF"}
            </button>
          </div>
        )}
        {pendingSample && !activity && <div role="status" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"><p className="text-sm text-amber-200">Opening the sample PDF…</p><button type="button" onClick={cancel} className={buttonClass}>Cancel</button></div>}
        {activity && <div role="status" aria-live="polite" className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-amber-200">{activity.kind === "loading" ? "Opening your PDF…" : `Cleaning pages ${activity.done} / ${source?.pdf.numPages ?? "…"}`}</p><button type="button" onClick={cancel} className={buttonClass}>Cancel</button></div>{source && activity.kind !== "loading" && <progress aria-label="Export progress" value={activity.done} max={source.pdf.numPages} className="mt-3 h-2 w-full accent-amber-400" />}</div>}
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">{error}</p>}
        {source && <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <label htmlFor="background-page-jump">Page</label>
              <input
                id="background-page-jump"
                type="number"
                min={1}
                max={source.pdf.numPages}
                value={pageInput}
                disabled={busy || source.pdf.numPages <= 1}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageInput(val);
                  const num = Number(val);
                  if (Number.isInteger(num) && num >= 1 && num <= source.pdf.numPages) {
                    setPage(num);
                  }
                }}
                onBlur={() => setPageInput(String(page))}
                className="w-16 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-center font-mono text-sm text-neutral-100 focus:border-amber-400 focus:outline-none disabled:opacity-50"
              />
              <span>of {source.pdf.numPages}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {settings.strength > 0 && !isManualSkip && (!previewReady || preview.outcome === "cleaned") && (
                <button type="button" disabled={busy} onClick={keepCurrentPageOriginal} className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-500 disabled:opacity-40">
                  Keep page {page} original
                </button>
              )}
              <button type="button" disabled={busy || page <= 1} onClick={() => goToPage(page - 1)} className={buttonClass}>Previous</button>
              <button type="button" disabled={busy || page >= source.pdf.numPages} onClick={() => goToPage(page + 1)} className={buttonClass}>Next</button>
            </div>
          </div>

          {previewReady && isManualSkip && (
            <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-700 bg-neutral-950/70 px-4 py-3 text-xs text-neutral-300">
              <p>Page {page} is kept original (manual override).</p>
              <button type="button" onClick={restoreAutoForCurrentPage} disabled={busy} className="rounded-lg border border-neutral-600 px-3 py-1.5 font-medium text-amber-300 hover:border-amber-400 disabled:opacity-40">
                Restore cleaning on page {page}
              </button>
            </div>
          )}

          {previewReady && !isManualSkip && preview.outcome === "photo_page" && (
            <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
              <p className="max-w-xl">
                <strong className="font-semibold text-amber-300">Photo or cover page detected: kept original automatically.</strong>{" "}
                Highlights and grayscale tones on page {page} were left untouched so they do not wash out. If this page is actually a heavily shaded or dense text scan, force-clean it here.
              </p>
              <button type="button" onClick={forceCleanCurrentPage} disabled={busy} className="shrink-0 rounded-lg border border-amber-400/50 bg-neutral-950/70 px-3 py-1.5 font-medium text-amber-300 hover:border-amber-300 disabled:opacity-40">
                Clean page {page} anyway
              </button>
            </div>
          )}

          {previewReady && !isManualSkip && preview.outcome === "dark_page" && (
            <div role="status" className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
              <strong className="font-semibold text-amber-300">Dark-background page detected: kept original.</strong>{" "}
              Paper whitening targets gray or yellow scans (paper brightness 90+). To turn black coaching or lecture slides white for printing, open{" "}
              <Link href="/invert-pdf-colors" className="text-amber-300 underline underline-offset-4 hover:text-amber-200">
                Invert PDF Colors
              </Link>{" "}
              and choose Dark → Light (Print).
            </div>
          )}

          {previewReady && !isManualSkip && preview.outcome === "cleaned" && preview.embeddedPhotos > 0 && (
            <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-700 bg-neutral-950/70 px-4 py-3 text-xs leading-relaxed text-neutral-300">
              <p className="max-w-xl">
                <strong className="font-medium text-neutral-100">
                  Paper whitened · {preview.embeddedPhotos} embedded {preview.embeddedPhotos === 1 ? "photo" : "photos"} kept intact on page {page}.
                </strong>{" "}
                If an embedded gray scan snippet stayed uncleaned, force-clean the entire page.
              </p>
              <button type="button" onClick={forceCleanCurrentPage} disabled={busy} className="shrink-0 rounded-lg border border-neutral-600 px-3 py-1.5 font-medium text-amber-300 hover:border-amber-400 disabled:opacity-40">
                Clean full page {page}
              </button>
            </div>
          )}

          {previewReady && !isManualSkip && isForcedClean && preview.outcome === "cleaned" && preview.embeddedPhotos === 0 && (
            <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-700 bg-neutral-950/70 px-4 py-3 text-xs text-neutral-300">
              <p>Photo protection bypassed on page {page} (cleaning forced).</p>
              <button type="button" onClick={restoreAutoForCurrentPage} disabled={busy} className="rounded-lg border border-neutral-600 px-3 py-1.5 font-medium text-amber-300 hover:border-amber-400 disabled:opacity-40">
                Restore auto protection
              </button>
            </div>
          )}

          {preview.error && <p role="alert" className="mb-4 text-sm text-red-300">{preview.error}</p>}
          <div className="grid gap-4 sm:grid-cols-2" aria-busy={preview.loading || preview.key !== previewKey}>
            {([["Original", preview.original], ["Cleaned", preview.converted]] as const).map(([label, image]) => <figure key={label} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"><figcaption className="border-b border-neutral-800 px-4 py-2 text-sm text-neutral-300">{label}</figcaption><div className="flex h-80 items-center justify-center p-3 sm:h-[560px]">{image ? <img src={image} alt={`${label} preview of PDF page ${page}`} className={`h-full w-full object-contain ${preview.loading || preview.key !== previewKey ? "opacity-40" : ""}`} /> : <span className="text-sm text-neutral-500">Preparing preview…</span>}</div></figure>)}
          </div>
          {(preview.loading || preview.key !== previewKey) && <p role="status" className="mt-2 text-xs text-neutral-400">Updating preview…</p>}
          <div className="mt-6">
            <button type="button" onClick={download} disabled={busy || preview.loading || preview.key !== previewKey || !preview.converted || !!preview.error} className="w-full rounded-xl bg-amber-400 px-6 py-3 font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
              Download cleaned PDF
            </button>
            {exportSummary && (
              <div role="status" className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-200">
                <p className="font-medium text-amber-300">Your cleaned PDF is ready.</p>
                {exportSummary.autoSkippedPages.length > 0 && (
                  <p className="mt-1 text-neutral-300">
                    Automatically kept {exportSummary.autoSkippedPages.length} photo or dark {exportSummary.autoSkippedPages.length === 1 ? "page" : "pages"} original ({formatPageSample(exportSummary.autoSkippedPages)}). Jump to any listed page above and click <span className="text-amber-300">Clean page anyway</span> if a heavily shaded text scan was skipped.
                  </p>
                )}
                {exportSummary.embeddedPhotoPages > 0 && (
                  <p className="mt-1 text-neutral-300">
                    Kept embedded photos intact on {exportSummary.embeddedPhotoPages} {exportSummary.embeddedPhotoPages === 1 ? "page" : "pages"} while whitening surrounding paper.
                  </p>
                )}
              </div>
            )}
          </div>
        </>}
      </div>
    </div>
  );
}
