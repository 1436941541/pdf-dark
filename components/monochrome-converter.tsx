"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { DropZone } from "./drop-zone";
import type { MonochromeMode } from "@/lib/monochrome";
import { createMonochromeProcessor, exportMonochromePdf, loadMonochromePdf, previewMonochromePdf } from "@/lib/monochrome-pdf";
import { classifyPdfLoadError, pdfLoadErrorText } from "@/lib/pdf-load-error";
import { yieldToMain } from "@/lib/main-thread";
import { beginPdfOperation, recordPdfFailure, trackPdfDownload } from "@/lib/pdf-monitoring";
import type { PdfInput } from "@/lib/analytics-events";
import type { MonochromeDiagnostic } from "@/lib/monochrome-pdf";

type Source = { file: File; pdf: PDFDocumentProxy; input: PdfInput };
type Preview = { original: string; converted: string; loading: boolean; error: string | null; key: string };

export function MonochromeConverter({ sample }: { sample?: { url: string; name: string; id: number } | null }) {
  const [source, setSource] = useState<Source | null>(null);
  const [mode, setMode] = useState<MonochromeMode>("grayscale");
  const [threshold, setThreshold] = useState(128);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Preview>({ original: "", converted: "", loading: false, error: null, key: "" });
  const [progress, setProgress] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadId = useRef(0);
  const preparation = useRef<ReturnType<typeof beginPdfOperation> | null>(null);
  const mounted = useRef(true);
  const exportController = useRef<AbortController | null>(null);
  const downloadUrls = useRef(new Set<string>());
  const processorRef = useRef<ReturnType<typeof createMonochromeProcessor> | null>(null);
  const busy = loading || progress !== null;
  const previewKey = `${page}:${mode}:${threshold}`;
  const previewReady = preview.key === previewKey && !preview.loading && !!preview.converted && !preview.error;

  useEffect(() => {
    mounted.current = true;
    const urls = downloadUrls.current;
    return () => {
      mounted.current = false;
      preparation.current?.cancel();
      exportController.current?.abort();
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    if (!source) return;
    // One processor for this PDF, shared by previews and export. Settings
    // changes cancel tasks, never the worker's in-flight script loading.
    const processor = createMonochromeProcessor();
    processorRef.current = processor;
    return () => {
      if (processorRef.current === processor) processorRef.current = null;
      processor.dispose();
      void source.pdf.destroy();
    };
  }, [source]);

  useEffect(() => {
    if (!source) return;
    const controller = new AbortController();
    const diagnostic: MonochromeDiagnostic = {};
    async function update() {
      await yieldToMain();
      if (controller.signal.aborted) return;
      setPreview((current) => ({ ...current, loading: true, error: null }));
      try {
        const processor = processorRef.current;
        if (!processor) return;
        const result = await previewMonochromePdf(source!.pdf, page, { mode, threshold }, processor, controller.signal, diagnostic);
        if (!controller.signal.aborted) setPreview({ ...result, loading: false, error: null, key: previewKey });
      } catch (failure) {
        if (!controller.signal.aborted) recordPdfFailure("monochrome", "preview", failure, { input: source!.input }, diagnostic);
        if (!controller.signal.aborted) setPreview({ original: "", converted: "", loading: false, error: failure instanceof Error ? failure.message : "Could not preview this page.", key: previewKey });
      }
    }
    const timer = setTimeout(() => { void update(); }, 120);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [source, page, mode, threshold, previewKey]);

  const selectFile = useCallback(async (file: File, input: PdfInput = "file") => {
    const id = ++loadId.current;
    exportController.current?.abort();
    preparation.current?.cancel();
    const operation = beginPdfOperation("monochrome", "prepare", { bytes: file.size, input });
    preparation.current = operation;
    setSource(null);
    setPreview({ original: "", converted: "", loading: false, error: null, key: "" });
    setLoading(true);
    setError(null);
    setDownloaded(false);
    setPage(1);
    try {
      const pdf = await loadMonochromePdf(file);
      if (id !== loadId.current || !mounted.current) { await pdf.destroy(); return; }
      setSource({ file, pdf, input });
      operation.success(pdf.numPages);
    } catch (failure) {
      if (id === loadId.current && mounted.current) operation.failure(failure);
      if (id === loadId.current && mounted.current) setError(pdfLoadErrorText(classifyPdfLoadError(failure)) ?? "We could not open this PDF. Try a different file or an updated browser.");
    } finally {
      operation.cancel();
      if (id === loadId.current && mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sample) return;
    const controller = new AbortController();
    async function openSample() {
      await yieldToMain();
      if (controller.signal.aborted) return;
      exportController.current?.abort();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(sample!.url, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load the sample PDF. Please try again.");
        const blob = await response.blob();
        if (!controller.signal.aborted) await selectFile(new File([blob], sample!.name, { type: "application/pdf" }), "sample");
      } catch (failure) {
        if (!controller.signal.aborted) recordPdfFailure("monochrome", "sample", failure, { input: "sample" });
        if (!controller.signal.aborted) {
          setError(failure instanceof Error ? failure.message : "Could not load the sample PDF.");
          setLoading(false);
        }
      }
    }
    void openSample();
    return () => controller.abort();
  }, [sample, selectFile]);

  function reset() {
    loadId.current++;
    preparation.current?.cancel();
    exportController.current?.abort();
    setSource(null);
    setLoading(false);
    setError(null);
    setDownloaded(false);
    setPreview({ original: "", converted: "", loading: false, error: null, key: "" });
  }

  async function download() {
    if (!source || progress !== null) return;
    const controller = new AbortController();
    const operation = beginPdfOperation("monochrome", "export", { pages: source.pdf.numPages, bytes: source.file.size, input: source.input, signal: controller.signal });
    const diagnostic: MonochromeDiagnostic = {};
    exportController.current = controller;
    setProgress(0);
    setDownloaded(false);
    setError(null);
    try {
      const processor = processorRef.current;
      if (!processor) throw new Error("The PDF is no longer open. Please choose it again.");
      const bytes = await exportMonochromePdf(source.pdf, { mode, threshold }, processor, controller.signal, setProgress, diagnostic);
      if (controller.signal.aborted) return;
      diagnostic.monochromeStep = "download";
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
      downloadUrls.current.add(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${source.file.name.replace(/\.pdf$/i, "")}-${mode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => { URL.revokeObjectURL(url); downloadUrls.current.delete(url); }, 60000);
      operation.success();
      trackPdfDownload("monochrome", source.pdf.numPages, bytes.length, source.input);
      setDownloaded(true);
    } catch (failure) {
      if (!controller.signal.aborted) operation.failure(failure, diagnostic);
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Conversion failed. Please try a smaller PDF.");
    } finally {
      operation.cancel();
      if (exportController.current === controller) {
        exportController.current = null;
        if (mounted.current) setProgress(null);
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl text-left">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-8">
        <fieldset disabled={busy}>
          <legend className="mb-3 text-sm font-medium text-neutral-300">Choose your conversion</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["grayscale", "Grayscale", "Keep the detail. Turn colors into shades of gray.", "Best for photos & reports"],
              ["black-and-white", "Pure black & white", "Only black or white. Adjust for text and line art.", "Best for scans & text"],
            ] as const).map(([value, title, description, badge]) => (
              <label key={value} className={`relative cursor-pointer rounded-xl border p-4 transition-colors ${mode === value ? "border-amber-400/60 bg-amber-400/5" : "border-neutral-700 hover:border-neutral-500"} ${busy ? "cursor-wait opacity-60" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-neutral-100">{title}</span>
                  <input type="radio" name="conversion-mode" value={value} checked={mode === value} onChange={() => { setMode(value); setDownloaded(false); }} className="h-4 w-4 accent-amber-400" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{description}</p>
                <span className="mt-3 inline-block text-xs text-amber-400/90">{badge}</span>
              </label>
            ))}
          </div>
          {mode === "black-and-white" && (
            <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950/50 p-4">
              <label htmlFor="bw-threshold" className="flex justify-between text-sm text-neutral-300"><span>Black &amp; white threshold</span><span>{threshold}</span></label>
              <input id="bw-threshold" type="range" min="1" max="254" value={threshold} onChange={(event) => { setThreshold(Number(event.target.value)); setDownloaded(false); }} className="slider-preview mt-4 w-full" style={{ background: "linear-gradient(to right, #fff, #000)" }} />
              <div className="mt-2 flex justify-between text-xs text-neutral-500"><span>Less black · lighter text</span><span>More black · darker text</span></div>
            </div>
          )}
        </fieldset>

        {!source && !loading && <div className="mt-6"><DropZone onFile={(file) => void selectFile(file)} /></div>}
        {loading && <p role="status" className="py-12 text-center text-neutral-300">Opening your PDF…</p>}
        {source && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 px-4 py-3">
              <div className="min-w-0"><p className="max-w-xs truncate text-sm font-medium text-neutral-200" title={source.file.name}>{source.file.name}</p><p className="mt-1 text-xs text-neutral-500">{source.pdf.numPages} {source.pdf.numPages === 1 ? "page" : "pages"} · {(source.file.size / 1024 / 1024).toFixed(2)} MB</p></div>
              <button onClick={reset} disabled={busy} className="text-sm text-neutral-400 hover:text-amber-400 disabled:opacity-40">Choose another PDF</button>
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-neutral-300">Preview your result</h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <button aria-label="Previous preview page" disabled={page <= 1 || busy} onClick={() => setPage(page - 1)} className="rounded border border-neutral-700 px-3 py-2 hover:border-amber-400 disabled:opacity-30">←</button>
                <span>Page {page} of {source.pdf.numPages}</span>
                <button aria-label="Next preview page" disabled={page >= source.pdf.numPages || busy} onClick={() => setPage(page + 1)} className="rounded border border-neutral-700 px-3 py-2 hover:border-amber-400 disabled:opacity-30">→</button>
              </div>
            </div>
            {preview.loading && <p role="status" className="mt-3 text-sm text-amber-400">Updating preview…</p>}
            {preview.error && <p role="alert" className="mt-4 text-sm text-red-300">{preview.error}</p>}
            {preview.converted && (
              <div className={`mt-4 grid grid-cols-2 gap-3 sm:gap-5 ${!previewReady ? "opacity-50" : ""}`}>
                {[["Original", preview.original], [mode === "grayscale" ? "Grayscale" : "Pure black & white", preview.converted]].map(([label, image]) => (
                  <figure key={label}>
                    <div className="overflow-hidden rounded-lg border border-neutral-700 bg-white">
                      {/* Local PDF previews are generated data URLs, not remote images. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={`${label} preview of page ${page}`} className="h-auto w-full" />
                    </div>
                    <figcaption className="mt-2 text-center text-xs text-neutral-400">{label}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              {progress === null ? <button onClick={() => void download()} disabled={busy || !previewReady} className="w-full rounded-xl bg-amber-400 px-6 py-3.5 font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">Convert &amp; download PDF</button> : (
                <div role="status">
                  <p className="text-sm text-neutral-300">{progress === source.pdf.numPages ? "Preparing your download…" : `Converting page ${Math.min(progress + 1, source.pdf.numPages)} of ${source.pdf.numPages}…`}</p>
                  <progress aria-label="PDF conversion progress" value={progress} max={source.pdf.numPages} className="mt-3 h-2 w-full accent-amber-400" />
                  <button onClick={() => exportController.current?.abort()} className="mt-3 text-sm text-neutral-400 hover:text-neutral-100">Cancel conversion</button>
                </div>
              )}
              {downloaded && <p role="status" className="mt-3 text-sm text-emerald-400">Your converted PDF is ready. Check your downloads.</p>}
            </div>
          </div>
        )}
        {error && <p role="alert" className="mt-5 rounded-lg border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">{error}</p>}
        <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500">Processed on your device. Your original PDF stays unchanged.</p>
      </div>
      <p className="mt-4 text-center text-xs leading-relaxed text-neutral-500">This version renders pages for conversion. Fine details may soften at high zoom, and links, forms and some searchable text may not carry over.</p>
    </div>
  );
}
