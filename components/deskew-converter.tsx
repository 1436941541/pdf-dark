"use client";

/* eslint-disable @next/next/no-img-element -- Previews are local canvas data URLs, not remote image assets. */

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { DropZone } from "./drop-zone";
import { analyzeDeskewPage, createDeskewProcessor, exportDeskewPdf, previewDeskewPdf, loadDeskewPdf, type DeskewAnalysis } from "@/lib/deskew-pdf";
import { classifyPdfLoadError, pdfLoadErrorText } from "@/lib/pdf-load-error";
import { yieldToMain } from "@/lib/main-thread";

type Source = { file: File; pdf: PDFDocumentProxy };
type Correction = { angle: number; analysis: DeskewAnalysis | null; manual: boolean };
type Preview = { original: string; converted: string; key: string; loading: boolean; error: string | null };
const emptyPreview: Preview = { original: "", converted: "", key: "", loading: false, error: null };
const buttonClass = "rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-40";

export function DeskewConverter({ sample }: { sample?: { url: string; name: string; id: number } | null }) {
  const [source, setSource] = useState<Source | null>(null);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [page, setPage] = useState(1);
  const [activity, setActivity] = useState<{ kind: "loading" | "detecting" | "exporting"; done: number } | null>(null);
  const [preview, setPreview] = useState<Preview>(emptyPreview);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const mounted = useRef(true);
  const loadId = useRef(0);
  const active = useRef<AbortController | null>(null);
  const detector = useRef<ReturnType<typeof createDeskewProcessor> | null>(null);
  const downloadUrls = useRef(new Set<string>());
  const correction = corrections[page - 1];
  const angle = correction?.angle ?? 0;
  const previewKey = `${page}:${angle}`;
  const busy = activity !== null;

  useEffect(() => {
    mounted.current = true;
    const urls = downloadUrls.current;
    return () => {
      mounted.current = false;
      active.current?.abort();
      detector.current?.dispose();
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
      try {
        const result = await previewDeskewPdf(source!.pdf, page, angle, controller.signal);
        if (!controller.signal.aborted) setPreview({ ...result, key: previewKey, loading: false, error: null });
      } catch (failure) {
        if (!controller.signal.aborted) setPreview({ ...emptyPreview, key: previewKey, error: failure instanceof Error ? failure.message : "Could not preview this page." });
      }
    }
    void update();
    return () => controller.abort();
  }, [source, page, angle, previewKey]);

  const selectFile = useCallback(async (file: File) => {
    const id = ++loadId.current;
    active.current?.abort();
    detector.current?.dispose();
    const controller = new AbortController();
    active.current = controller;
    setSource(null);
    setCorrections([]);
    setPreview(emptyPreview);
    setPage(1);
    setError(null);
    setDownloaded(false);
    setActivity({ kind: "loading", done: 0 });
    let processor: ReturnType<typeof createDeskewProcessor> | null = null;
    try {
      const pdf = await loadDeskewPdf(file, controller.signal);
      if (id !== loadId.current || !mounted.current || controller.signal.aborted) { await pdf.destroy(); return; }
      setSource({ file, pdf });
      setCorrections(Array.from({ length: pdf.numPages }, () => ({ angle: 0, analysis: null, manual: false })));
      processor = createDeskewProcessor();
      detector.current = processor;
      setActivity({ kind: "detecting", done: 0 });
      for (let number = 1; number <= pdf.numPages; number++) {
        const result = await analyzeDeskewPage(pdf, number, processor, controller.signal);
        if (id !== loadId.current || !mounted.current || controller.signal.aborted) return;
        setCorrections((current) => current.map((item, index) => index === number - 1 ? { angle: result.angle, analysis: result, manual: false } : item));
        setActivity({ kind: "detecting", done: number });
        await yieldToMain();
      }
    } catch (failure) {
      if (id === loadId.current && mounted.current && !controller.signal.aborted) setError(pdfLoadErrorText(classifyPdfLoadError(failure)) ?? (failure instanceof Error ? failure.message : "Could not open this PDF."));
    } finally {
      processor?.dispose();
      if (active.current === controller) {
        active.current = null;
        detector.current = null;
        if (mounted.current) setActivity(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!sample) return;
    const currentLoad = loadId.current;
    const controller = new AbortController();
    async function openSample() {
      try {
        const response = await fetch(sample!.url, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load the sample PDF.");
        const blob = await response.blob();
        if (!controller.signal.aborted && currentLoad === loadId.current) await selectFile(new File([blob], sample!.name, { type: "application/pdf" }));
      } catch (failure) {
        if (!controller.signal.aborted && currentLoad === loadId.current) setError(failure instanceof Error ? failure.message : "Could not load the sample PDF.");
      }
    }
    void openSample();
    return () => controller.abort();
  }, [sample, selectFile]);

  function cancel() {
    active.current?.abort();
    detector.current?.dispose();
    loadId.current++;
    active.current = null;
    detector.current = null;
    setActivity(null);
  }
  function reset() {
    cancel();
    setSource(null);
    setCorrections([]);
    setPreview(emptyPreview);
    setError(null);
    setDownloaded(false);
  }
  function updateAngle(value: number, manual = true) {
    setCorrections((current) => current.map((item, index) => index === page - 1 ? { ...item, angle: value, manual } : item));
    setDownloaded(false);
  }
  async function download() {
    if (!source || busy) return;
    const controller = new AbortController();
    active.current = controller;
    setActivity({ kind: "exporting", done: 0 });
    setError(null);
    setDownloaded(false);
    try {
      const bytes = await exportDeskewPdf(source.pdf, corrections.map((item) => item.angle), controller.signal, (done) => {
        if (mounted.current && !controller.signal.aborted) setActivity({ kind: "exporting", done });
      });
      if (controller.signal.aborted || !mounted.current) return;
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
      downloadUrls.current.add(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${source.file.name.replace(/\.pdf$/i, "")}-deskewed.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => { URL.revokeObjectURL(url); downloadUrls.current.delete(url); }, 60000);
      setDownloaded(true);
    } catch (failure) {
      if (!controller.signal.aborted && mounted.current) setError(failure instanceof Error ? failure.message : "Could not export this PDF. Try a smaller file.");
    } finally {
      if (active.current === controller) {
        active.current = null;
        if (mounted.current) setActivity(null);
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 text-left">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-neutral-100">Straighten your scanned PDF</h2><p className="mt-1 text-sm text-neutral-400">Automatic detection, with manual control for every page.</p></div>
          <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs text-amber-300">Files stay in your browser</span>
        </div>
        {!source && !busy && <DropZone onFile={selectFile} />}
        {source && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"><div className="min-w-0"><p className="break-all text-sm font-medium text-neutral-200">{source.file.name}</p><p className="mt-1 text-xs text-neutral-400">{source.pdf.numPages} {source.pdf.numPages === 1 ? "page" : "pages"} · Check each preview before downloading</p></div><button type="button" onClick={reset} disabled={busy} className={buttonClass}>Choose another PDF</button></div>}
        {activity && <div role="status" aria-live="polite" className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-amber-200">{activity.kind === "loading" ? "Opening your PDF…" : `${activity.kind === "detecting" ? "Analyzing" : "Exporting"} pages ${activity.done} / ${source?.pdf.numPages ?? "…"}`}</p><button type="button" onClick={cancel} className={buttonClass}>Cancel</button></div>{source && activity.kind !== "loading" && <progress aria-label={activity.kind === "detecting" ? "Analysis progress" : "Export progress"} value={activity.done} max={source.pdf.numPages} className="mt-3 h-2 w-full accent-amber-400" />}</div>}
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">{error}</p>}
        {source && <>
          <fieldset disabled={busy} className="mb-5 rounded-xl border border-neutral-800 p-4">
            <legend className="px-2 text-sm font-medium text-neutral-200">Correction for page {page}</legend>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-neutral-300">{correction?.manual ? "Manual correction" : correction?.analysis?.status === "detected" ? "Tilt detected automatically" : correction?.analysis?.status === "straight" ? "Already straight" : "Manual adjustment recommended"}</p><output htmlFor="deskew-angle" className="font-mono text-lg text-amber-300">{angle > 0 ? "+" : ""}{angle.toFixed(1)}°</output></div>
            <label htmlFor="deskew-angle" className="sr-only">Correction angle for page {page}</label>
            <input id="deskew-angle" type="range" min="-10" max="10" step="0.1" value={angle} onChange={(event) => updateAngle(Number(event.target.value))} className="w-full accent-amber-400 disabled:opacity-40" />
            <div className="mt-1 flex justify-between text-xs text-neutral-500"><span>−10° counterclockwise</span><span>+10° clockwise</span></div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">{correction?.analysis?.reason ?? "This page has not been analyzed. Adjust the angle using the preview."}</p>
            <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => updateAngle(correction?.analysis?.angle ?? 0, false)}>Use automatic result</button><button type="button" className={buttonClass} onClick={() => updateAngle(0)}>Leave page unchanged</button></div>
          </fieldset>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-neutral-300">Page {page} of {source.pdf.numPages}</p><div className="flex gap-2"><button type="button" disabled={busy || page <= 1} onClick={() => setPage(page - 1)} className={buttonClass}>Previous</button><button type="button" disabled={busy || page >= source.pdf.numPages} onClick={() => setPage(page + 1)} className={buttonClass}>Next</button></div></div>
          {preview.error && <p role="alert" className="mb-4 text-sm text-red-300">{preview.error}</p>}
          <div className="grid gap-4 sm:grid-cols-2" aria-busy={preview.loading || preview.key !== previewKey}>
            {([["Original", preview.original], ["Straightened", preview.converted]] as const).map(([label, image]) => <figure key={label} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"><figcaption className="border-b border-neutral-800 px-4 py-2 text-sm text-neutral-300">{label}</figcaption><div className="flex min-h-48 items-center justify-center p-3">{image ? <img src={image} alt={`${label} preview of PDF page ${page}`} className={`max-h-[560px] w-full object-contain ${preview.loading || preview.key !== previewKey ? "opacity-40" : ""}`} /> : <span className="text-sm text-neutral-500">Preparing preview…</span>}</div></figure>)}
          </div>
          {(preview.loading || preview.key !== previewKey) && <p role="status" className="mt-2 text-xs text-neutral-400">Updating preview…</p>}
          <div className="mt-6"><button type="button" onClick={download} disabled={busy || preview.loading || preview.key !== previewKey || !preview.converted || !!preview.error} className="w-full rounded-xl bg-amber-400 px-6 py-3 font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">Download straightened PDF</button>{downloaded && <p role="status" className="mt-3 text-sm text-amber-300">Your straightened PDF is ready.</p>}</div>
        </>}
        <p className="mt-5 text-xs leading-relaxed text-neutral-500">Best for scanned text pages with a small tilt. Photos, diagrams and sparse pages may need manual adjustment. Output pages are flattened images, up to 144 dpi; searchable text, links and forms are not retained. White margins are added to preserve the full page, so page sizes can increase. No OCR.</p>
      </div>
    </div>
  );
}
