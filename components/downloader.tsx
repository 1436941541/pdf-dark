"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import "@/lib/map-polyfill";
import { THEMES, THEME_IDS, type ThemeId } from "@/lib/themes";
import type { DarkifyRequest, DarkifyResponse } from "@/lib/dark-worker";
import { getPageImageRects, type ImageRect } from "@/lib/image-regions";
import {
  buildDarkPdf,
  imageTreatment,
  RENDER_SCALE,
  type ImageMode,
  type PageRender,
} from "@/lib/build-dark-pdf";
import { effectiveThemeBg, imageDimAlpha } from "@/lib/dark-color";
import { DropZone } from "./drop-zone";

/** effectiveThemeBg result → CSS color. */
const bgCss = (c: { r: number; g: number; b: number }) =>
  `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

type Status =
  | { kind: "config" }
  | { kind: "processing"; phase: "render" | "build"; done: number; total: number }
  | { kind: "done"; filename: string }
  | { kind: "error" };

/**
 * The converter-page flow: pick theme/image/darkness/warmth up front, then
 * drop a PDF and the darkened file is built and downloaded straight away —
 * no in-browser reading step (that's the reader on the homepage).
 */
export function Downloader() {
  const [theme, setTheme] = useState<ThemeId>("midnight");
  const [imageMode, setImageMode] = useState<ImageMode>("smart");
  const [darkness, setDarkness] = useState(100);
  const [warmth, setWarmth] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "config" });

  const cancelledRef = useRef(false);

  // Worker setup — same darkify worker the reader uses.
  const workerRef = useRef<Worker | null>(null);
  const msgIdRef = useRef(0);
  const pendingRef = useRef(
    new Map<number, { resolve: (blob: Blob) => void; reject: (err: Error) => void }>(),
  );

  useEffect(() => {
    const w = new Worker(new URL("../lib/dark-worker.ts", import.meta.url), {
      type: "module",
    });
    w.onmessage = (e: MessageEvent<DarkifyResponse>) => {
      const { id } = e.data;
      const cb = pendingRef.current.get(id);
      if (!cb) return;
      pendingRef.current.delete(id);
      if ("error" in e.data) cb.reject(new Error(e.data.error));
      else cb.resolve(e.data.blob);
    };
    workerRef.current = w;
    return () => {
      cancelledRef.current = true;
      pendingRef.current.clear();
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  /** Darken one rendered page bitmap through the worker. */
  const darkify = useCallback(
    async (
      originalDataUrl: string,
      width: number,
      height: number,
      imageRects: ImageRect[],
    ): Promise<string> => {
      const w = workerRef.current;
      if (!w) throw new Error("worker not ready");
      const res = await fetch(originalDataUrl);
      const srcBlob = await res.blob();
      const bitmap = await createImageBitmap(srcBlob);

      const rects = imageRects.filter(
        (r) => imageTreatment(imageMode, r) !== "invert",
      );
      const id = ++msgIdRef.current;
      const outBlob = await new Promise<Blob>((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject });
        const req: DarkifyRequest = {
          id,
          bitmap,
          width,
          height,
          theme,
          darkness: darkness / 100,
          warmth: warmth / 100,
          imageRects: rects,
          imageDims: rects.map((r) =>
            imageTreatment(imageMode, r) === "dim"
              ? imageDimAlpha(r.brightness)
              : 0,
          ),
        };
        w.postMessage(req, [bitmap]);
      });

      return await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(new Error("FileReader failed"));
        fr.readAsDataURL(outBlob);
      });
    },
    [theme, imageMode, darkness, warmth],
  );

  /** Full pipeline: render every page, darken it, build the PDF, download. */
  const processFile = useCallback(
    async (file: File) => {
      cancelledRef.current = false;
      setStatus({ kind: "processing", phase: "render", done: 0, total: 0 });
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const srcBytes = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: srcBytes.slice(0) }).promise;
        if (cancelledRef.current) return;
        setStatus({
          kind: "processing",
          phase: "render",
          done: 0,
          total: pdf.numPages,
        });

        // Small scratch canvas for per-image brightness sampling.
        const scratch = document.createElement("canvas");
        scratch.width = 32;
        scratch.height = 32;
        const scratchCtx = scratch.getContext("2d", { willReadFrequently: true });

        const pages: PageRender[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelledRef.current) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });

          // Locate raster images before page.render() — see pdf-viewer.tsx.
          let imageRects: ImageRect[] = [];
          let scannedPage = false;
          try {
            const scan = await getPageImageRects(page, viewport);
            imageRects = scan.rects;
            scannedPage = scan.scanned;
          } catch (err) {
            console.warn("[pdf-dark] image-region scan failed", err);
          }

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("2D canvas not supported");
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;

          if (scratchCtx) {
            for (const r of imageRects) {
              try {
                scratchCtx.drawImage(canvas, r.x, r.y, r.w, r.h, 0, 0, 32, 32);
                const d = scratchCtx.getImageData(0, 0, 32, 32).data;
                let lumSum = 0;
                let satSum = 0;
                for (let j = 0; j < d.length; j += 4) {
                  lumSum += 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
                  const mx = Math.max(d[j], d[j + 1], d[j + 2]);
                  const mn = Math.min(d[j], d[j + 1], d[j + 2]);
                  satSum += (mx - mn) / 255;
                }
                const n = d.length / 4;
                r.brightness = lumSum / n;
                r.saturation = satSum / n;
              } catch {
                // leave features undefined → classifier falls back to a mild veil
              }
            }
          }

          const originalDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          // "Original" mode keeps scanned pages exactly as in the source.
          const displayDataUrl =
            imageMode === "original" && scannedPage
              ? originalDataUrl
              : await darkify(
                  originalDataUrl,
                  canvas.width,
                  canvas.height,
                  imageRects,
                );
          if (cancelledRef.current) return;

          pages.push({
            displayDataUrl,
            width: canvas.width,
            height: canvas.height,
            imageRects,
            scannedPage,
          });
          setStatus({
            kind: "processing",
            phase: "render",
            done: i,
            total: pdf.numPages,
          });
        }

        setStatus({
          kind: "processing",
          phase: "build",
          done: pdf.numPages,
          total: pdf.numPages,
        });
        const { bytes: outBytes, objectPages, rasterPages } = await buildDarkPdf(
          srcBytes,
          pages,
          theme,
          imageMode,
          pdf,
          darkness / 100,
          warmth / 100,
        );
        if (cancelledRef.current) return;
        console.info(
          `[pdf-dark] download built: ${objectPages} vector page(s), ${rasterPages} raster page(s)`,
        );

        const copy = new Uint8Array(outBytes.byteLength);
        copy.set(outBytes);
        const blob = new Blob([copy.buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const filename = file.name.replace(/\.pdf$/i, "") + `-${theme}.pdf`;
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setStatus({ kind: "done", filename });
      } catch (e) {
        console.error("[pdf-dark] convert failed", e);
        Sentry.captureException(e, { tags: { stage: "downloader" } });
        if (!cancelledRef.current) setStatus({ kind: "error" });
      }
    },
    [theme, imageMode, darkness, warmth, darkify],
  );

  // Slider tracks painted with the actual background colors each end of the
  // range produces — same trick as the reader toolbar.
  const darknessTrack = `linear-gradient(to right, ${bgCss(
    effectiveThemeBg(theme, 0.5, warmth / 100),
  )}, ${bgCss(effectiveThemeBg(theme, 1, warmth / 100))})`;
  const warmthTrack = `linear-gradient(to right, ${bgCss(
    effectiveThemeBg(theme, darkness / 100, 0),
  )}, ${bgCss(effectiveThemeBg(theme, darkness / 100, 1))})`;

  const processing = status.kind === "processing";

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step 1 — settings, chosen before the file is picked */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 text-left space-y-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          1 · Choose your dark theme
        </div>

        {/* Theme cards — live preview follows the sliders */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEME_IDS.map((id) => {
            const active = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                disabled={processing}
                className={`rounded-lg border overflow-hidden text-left transition-all disabled:opacity-50 ${
                  active
                    ? "border-amber-400 ring-1 ring-amber-400"
                    : "border-neutral-800 hover:border-neutral-600"
                }`}
                aria-pressed={active}
              >
                <div
                  className="p-3 space-y-1.5"
                  style={{
                    background: bgCss(
                      effectiveThemeBg(id, darkness / 100, warmth / 100),
                    ),
                  }}
                >
                  <div className="h-1.5 rounded-full bg-white/80 w-3/4" />
                  <div className="h-1.5 rounded-full bg-white/50 w-full" />
                  <div className="h-1.5 rounded-full bg-white/50 w-2/3" />
                </div>
                <div
                  className={`text-center text-xs py-1.5 bg-neutral-900 ${
                    active ? "text-amber-400 font-semibold" : "text-neutral-400"
                  }`}
                >
                  {THEMES[id].label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Image handling */}
        <div
          className="flex flex-wrap items-center gap-1 rounded-full border border-neutral-800 p-1 w-fit"
          title="How photos, figures and scanned pages are treated"
        >
          <span className="pl-2 pr-1 text-[11px] uppercase tracking-wide text-neutral-500">
            Images
          </span>
          {(
            [
              [
                "original",
                "Original",
                "Photos, figures and scanned pages stay exactly as in the source — only text and background are darkened",
              ],
              [
                "smart",
                "Auto",
                "Recommended: each image gets the best treatment — white screenshots/diagrams are inverted with the page, photos stay original, bright colorful images are gently dimmed",
              ],
              [
                "invert",
                "Invert",
                "Invert everything, images included — deepest dark, best for scanned documents",
              ],
            ] as [ImageMode, string, string][]
          ).map(([m, label, tip]) => {
            const active = imageMode === m;
            return (
              <button
                key={m}
                onClick={() => setImageMode(m)}
                disabled={processing}
                className={`px-3 py-1 rounded-full text-xs transition-colors disabled:opacity-50 ${
                  active
                    ? "bg-amber-400 text-neutral-950 font-semibold"
                    : "text-neutral-400 hover:text-neutral-100"
                }`}
                aria-pressed={active}
                title={tip}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Darkness + warmth */}
        <div className="flex flex-wrap gap-3">
          <div
            className="flex items-center gap-2 rounded-full border border-neutral-800 px-3 py-1.5"
            title="How dark the page gets — drag left for a softer, lighter background"
          >
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              Darkness
            </span>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={darkness}
              onChange={(e) => setDarkness(Number(e.target.value))}
              disabled={processing}
              className="slider-preview w-24 disabled:opacity-50"
              style={{ background: darknessTrack }}
              aria-label="Darkness"
            />
            <span className="w-9 text-right text-xs tabular-nums text-neutral-300">
              {darkness}%
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-full border border-neutral-800 px-3 py-1.5"
            title="Background color temperature — drag right for a warmer, candle-light tint"
          >
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              Warmth
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={warmth}
              onChange={(e) => setWarmth(Number(e.target.value))}
              disabled={processing}
              className="slider-preview w-24 disabled:opacity-50"
              style={{ background: warmthTrack }}
              aria-label="Warmth"
            />
            <span className="w-9 text-right text-xs tabular-nums text-neutral-300">
              {warmth}%
            </span>
          </div>
        </div>
      </div>

      {/* Step 2 — the file. Drop → convert → the download starts itself. */}
      <div className="mt-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500 text-left mb-3">
          2 · Drop your PDF — the dark copy downloads automatically
        </div>

        {status.kind === "config" && <DropZone onFile={processFile} />}

        {status.kind === "processing" && (
          <div className="rounded-2xl border-2 border-neutral-800 bg-neutral-900/90 p-10 text-center">
            <div className="text-lg text-neutral-200">
              {status.phase === "render"
                ? `Converting page ${status.done} / ${status.total || "?"}…`
                : "Building your dark PDF…"}
            </div>
            <div className="mt-4 w-64 mx-auto h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-[width]"
                style={{
                  width:
                    status.phase === "build"
                      ? "100%"
                      : status.total
                        ? `${(status.done / status.total) * 100}%`
                        : "0%",
                }}
              />
            </div>
            <div className="mt-3 text-xs text-neutral-500">
              Runs entirely in your browser — nothing is uploaded.
            </div>
          </div>
        )}

        {status.kind === "done" && (
          <div className="rounded-2xl border-2 border-neutral-800 bg-neutral-900/90 p-10 text-center">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-lg font-semibold text-neutral-50">
              Saved {status.filename}
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              Check your downloads folder — the dark theme is baked into the
              file.
            </div>
            <button
              onClick={() => setStatus({ kind: "config" })}
              className="mt-5 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-colors"
            >
              Convert another PDF
            </button>
          </div>
        )}

        {status.kind === "error" && (
          <div className="rounded-2xl border-2 border-neutral-800 bg-neutral-900/90 p-10 text-center">
            <div className="text-lg text-red-400">
              Couldn&apos;t convert that PDF. Try another file?
            </div>
            <button
              onClick={() => setStatus({ kind: "config" })}
              className="mt-5 px-4 py-1.5 rounded-full text-sm text-neutral-300 border border-neutral-800 hover:text-neutral-100 transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
