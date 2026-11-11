"use client";

import { readPdfFile } from "@/lib/pdf-file-read-diagnostics";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadPageBitmap, type PdfFailureDiagnostic, type PdfReaderStep, type ImageCacheSnapshotProvider } from "@/lib/pdf-image-diagnostics";
import { summarizeImageCache } from "@/lib/pdf-image-resource-diagnostics";
import { restoreDarkWorkerError } from "@/lib/dark-worker-diagnostics";
import { THEMES, THEME_IDS, type ThemeId } from "@/lib/themes";
import type {
  DarkifyRequest,
  DarkifyResponse,
} from "@/lib/dark-worker";
import { getPageImageRects, type ImageRect } from "@/lib/image-regions";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { canvasToJpegBlob, yieldToMain } from "@/lib/main-thread";
import { getPdfRenderScale } from "@/lib/pdf-render-limits";
import {
  imageTreatment,
  RENDER_SCALE,
  type ImageMode,
} from "@/lib/build-dark-pdf";
import { effectiveThemeBg, imageDimAlpha } from "@/lib/dark-color";
import { pdfOpenErrorText } from "@/lib/pdf-load-error";
import { T, type Locale } from "@/lib/i18n";
import { beginPdfOperation, recordPdfFailure } from "@/lib/pdf-monitoring";

/** Rendered images for one page. Only pages near the reader's view keep one. */
type PageRender = {
  pageNumber: number;
  /** Full-color rendered PDF page JPEG (source of truth, never modified). */
  originalBlob: Blob;
  width: number;
  height: number;
  /** Current dark-themed version shown to the user, and its object URL.
   *  Blobs rather than Base64 strings keep page images out of the JS heap. */
  displayBlob: Blob;
  displayUrl: string;
  /** variantKey the display version was rendered with. */
  displayKey: string;
  /** Cache of already-darkified versions keyed by variantKey — lets
   *  re-applying a recent combination skip the worker. */
  byTheme: Partial<Record<string, Blob>>;
  /**
   * Canvas-space rects of raster images on this page (photos, figures). The
   * worker restores these from the original after darkening so they don't
   * turn into negatives. Empty for scanned-looking pages.
   */
  imageRects: ImageRect[];
  /** True when the page is one full-page image (a scan) — such pages must
   *  take the raster download path, not the object-recolor one. */
  scannedPage: boolean;
};

type PageImage = {
  pageNumber: number;
  /** Reading layout stays at the original zoom even if the bitmap is reduced.
   *  Known for every page, so unrendered pages hold their exact space. */
  layoutWidth: number;
  layoutHeight: number;
  /** Absent for pages away from the view: a long PDF can't keep every page's
   *  images (2,500 pages crashed iOS Safari), so they're re-rendered on return. */
  image?: PageRender;
  /** Variant whose rendering failed, so the page isn't retried in a loop. */
  failedKey?: string;
};

/** Pages within this distance of the viewed page are rendered… */
const RENDER_RADIUS = 5;
/** …and released once farther than this (the gap avoids re-rendering pages
 *  that hover at the edge while scrolling back and forth). */
const KEEP_RADIUS = 8;
/** Darkified variants kept per page, so toggling between recent themes stays instant. */
const MAX_VARIANTS = 3;

type Props = {
  file: File;
  onReset: () => void;
  locale?: Locale;
};

/** Cache key for one theme + image-mode + darkness + warmth combination. */
const variantKey = (t: ThemeId, m: ImageMode, d: number, w: number) =>
  `${t}:${m}:${d}:${w}`;

/** effectiveThemeBg result → CSS color. */
const bgCss = (c: { r: number; g: number; b: number }) =>
  `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

function cancelledError() {
  return new DOMException("PDF rendering was cancelled", "AbortError");
}

function throwIfCancelled(cancelled: () => boolean) {
  if (cancelled()) throw cancelledError();
}

function isCancellationError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function PdfViewer({ file, onReset, locale = "en" }: Props) {
  const t = T[locale];
  const [pages, setPages] = useState<PageImage[]>([]);
  const [theme, setTheme] = useState<ThemeId>("midnight");
  // How preserved images are shown: smart auto-dim (default) or untouched.
  const [imageMode, setImageMode] = useState<ImageMode>("smart");
  // Darkness slider, in percent (50–100). `darkness` follows the thumb live;
  // `appliedDarkness` is the debounced value the pages are actually rendered
  // with, so dragging doesn't re-darkify the whole document at every step.
  const [darkness, setDarkness] = useState(100);
  const [appliedDarkness, setAppliedDarkness] = useState(100);
  // Warmth slider, in percent (0–100): color-temperature shift of the
  // background toward candle-light. Same live/debounced split as darkness.
  const [warmth, setWarmth] = useState(0);
  const [appliedWarmth, setAppliedWarmth] = useState(0);

  useEffect(() => {
    if (darkness === appliedDarkness && warmth === appliedWarmth) return;
    const t = setTimeout(() => {
      setAppliedDarkness(darkness);
      setAppliedWarmth(warmth);
    }, 250);
    return () => clearTimeout(t);
  }, [darkness, appliedDarkness, warmth, appliedWarmth]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const [themeApplying, setThemeApplying] = useState(false);
  const [themeProgress, setThemeProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });
  // Theme/image/slider controls live in a slide-in sidebar so the sticky top
  // bar stays slim and never covers the page while reading.
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Reader controls — current page tracked from scroll, zoom factor applied
  // to each page's display width, pageInput is the controlled value of the
  // "jump to page" text field.
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  // Page 1's rendered size, known as soon as the PDF parses — long before the
  // first page finishes. The loading box takes this size so the page drops
  // into the same space instead of pushing the rest of the page down.
  const [firstPageSize, setFirstPageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [pageInput, setPageInput] = useState("1");
  // The open document stays loaded so released pages can be re-rendered.
  // `cancelled` is set when it's replaced, closed or navigated away from.
  const docRef = useRef<{ pdf?: PDFDocumentProxy; cancelled: boolean } | null>(null);
  // In-flight page renders keyed by `${pageIndex}:${variantKey}`. A render
  // keeps going while its page is still wanted, so pages aren't restarted
  // whenever the window recomputes; it stops once the view moves away.
  const renderJobsRef = useRef(new Map<string, Promise<PageRender>>());
  // Latest window, read by renders finishing after the view has moved.
  const windowRef = useRef({ center: 0, key: "" });
  // Source of truth for page slots between awaits; `pages` is its published copy.
  const slotsRef = useRef<PageImage[]>([]);
  // Page index the rendered window is centered on — follows currentPage with
  // a short delay so a fast scroll doesn't start a render for every page passed.
  const [viewCenter, setViewCenter] = useState(0);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const cancelOperationsRef = useRef(new Set<() => void>());

  const cancelForNavigation = useCallback(() => {
    // A document navigation can reject blob reads before React unmounts.
    // Settle both render loops before starting the navigation instead.
    for (const cancel of cancelOperationsRef.current) cancel();
  }, []);

  // Worker setup
  const workerRef = useRef<Worker | null>(null);
  const msgIdRef = useRef(0);
  const pendingRef = useRef(
    new Map<number, { resolve: (blob: Blob) => void; reject: (err: Error) => void }>(),
  );

  useEffect(() => {
    const pending = pendingRef.current;
    let disposed = false;
    const w = new Worker(new URL("../lib/dark-worker.ts", import.meta.url), {
      type: "module",
    });
    w.onerror = (event) => {
      // Only this effect's intentionally terminated worker is cancellation.
      // Active worker failures must still reach the global error monitor.
      if (disposed) {
        try { event.preventDefault(); } catch { /* Preserve reporting for non-standard events. */ }
      }
    };
    w.onmessage = (e: MessageEvent<DarkifyResponse>) => {
      const { id } = e.data;
      const cb = pending.get(id);
      if (!cb) return;
      pending.delete(id);
      if ("error" in e.data) cb.reject(restoreDarkWorkerError(e.data));
      else cb.resolve(e.data.blob);
    };
    workerRef.current = w;
    return () => {
      disposed = true;
      for (const { reject } of pending.values()) reject(cancelledError());
      pending.clear();
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  // Track which page is currently in view. We pick the entry with the largest
  // intersection ratio so a long page in the middle "wins" over a tiny sliver
  // of the next one.
  useEffect(() => {
    if (status !== "ready" || pages.length === 0) return;
    const visible = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.pageIndex);
          if (e.isIntersecting) {
            visible.set(idx, e.intersectionRatio);
          } else {
            visible.delete(idx);
          }
        }
        if (visible.size === 0) return;
        let bestIdx = 0;
        let bestRatio = -1;
        visible.forEach((ratio, idx) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = idx;
          }
        });
        setCurrentPage(bestIdx + 1);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    pageRefs.current.forEach((el) => {
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [status, pages.length]);

  // Keep the jump-to-page input synced when scroll changes currentPage.
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    const t = setTimeout(() => setViewCenter(currentPage - 1), 150);
    return () => clearTimeout(t);
  }, [currentPage]);

  const scrollToPage = useCallback((target: number) => {
    const clamped = Math.max(1, Math.min(pageRefs.current.length, target));
    const el = pageRefs.current[clamped - 1];
    if (!el) return;
    // A long smooth scroll sweeps every page in between through the viewport,
    // so lazy images decode all of them at once (crashed iOS Safari on a
    // 1→400 jump). Jump instantly when the target is more than a few screens away.
    const far = Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 3;
    el.scrollIntoView({ behavior: far ? "auto" : "smooth", block: "start" });
  }, []);

  // Keyboard navigation. Skip when focus is inside a text input so the user
  // can type page numbers without triggering arrow-key page jumps.
  useEffect(() => {
    if (status !== "ready") return;
    const isTypingTarget = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case "j":
          e.preventDefault();
          scrollToPage(currentPage + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
        case "k":
          e.preventDefault();
          scrollToPage(currentPage - 1);
          break;
        case "Home":
          e.preventDefault();
          scrollToPage(1);
          break;
        case "End":
          e.preventDefault();
          scrollToPage(pageRefs.current.length);
          break;
        case "+":
        case "=":
          e.preventDefault();
          setZoom((z) => Math.min(2, Math.round((z + 0.25) * 100) / 100));
          break;
        case "-":
          e.preventDefault();
          setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100));
          break;
        case "0":
          e.preventDefault();
          setZoom(1);
          break;
        case "Escape":
          setSettingsOpen(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, currentPage, scrollToPage]);

  const submitJumpInput = useCallback(() => {
    const n = parseInt(pageInput, 10);
    if (Number.isFinite(n)) scrollToPage(n);
    else setPageInput(String(currentPage));
  }, [pageInput, currentPage, scrollToPage]);

  // One object URL per displayed Blob for the current document. They are all
  // revoked together when the document is closed or replaced.
  const objectUrlsRef = useRef(new Map<Blob, string>());
  const objectUrl = useCallback((blob: Blob) => {
    const urls = objectUrlsRef.current;
    let url = urls.get(blob);
    if (url === undefined) {
      url = URL.createObjectURL(blob);
      urls.set(blob, url);
    }
    return url;
  }, []);
  const revokeObjectUrls = useCallback(() => {
    const urls = objectUrlsRef.current;
    for (const url of urls.values()) URL.revokeObjectURL(url);
    urls.clear();
  }, []);
  const revokeObjectUrl = useCallback((blob: Blob) => {
    const urls = objectUrlsRef.current;
    const url = urls.get(blob);
    if (url === undefined) return;
    URL.revokeObjectURL(url);
    urls.delete(blob);
  }, []);
  /** Drop a page's images; the map would otherwise keep every Blob alive. */
  const releasePageRender = useCallback((image: PageRender) => {
    revokeObjectUrl(image.displayBlob);
    for (const blob of Object.values(image.byTheme)) if (blob) revokeObjectUrl(blob);
  }, [revokeObjectUrl]);

  /** Convert an original page JPEG → worker-processed themed JPEG. */
  const darkifyViaWorker = useCallback(
    async (
      p: PageRender,
      nextTheme: ThemeId,
      nextMode: ImageMode,
      nextDarkness: number,
      nextWarmth: number,
      cancelled: () => boolean,
      getCacheSnapshot?: ImageCacheSnapshotProvider,
    ): Promise<Blob> => {
      throwIfCancelled(cancelled);
      // "Original" mode treats a scanned page (page == one big image) as an
      // image: the page stays exactly as in the source, no darkening at all.
      if (nextMode === "original" && p.scannedPage) return p.originalBlob;

      const w = workerRef.current;
      if (!w) throw new Error("worker not ready");
      const bitmap = await loadPageBitmap(p.originalBlob, {
        pageNumber: p.pageNumber,
        width: p.width,
        height: p.height,
        imageRegionCount: p.imageRects.length,
      }, () => throwIfCancelled(cancelled), getCacheSnapshot);

      // Per-image treatment (keep / dim / invert) — images slated for
      // inversion simply aren't pasted back, the dark mapping handles them.
      const rects = p.imageRects.filter(
        (r) => imageTreatment(nextMode, r) !== "invert",
      );
      const id = ++msgIdRef.current;
      try {
        return await new Promise<Blob>((resolve, reject) => {
          pendingRef.current.set(id, { resolve, reject });
          const req: DarkifyRequest = {
            id,
            bitmap,
            width: p.width,
            height: p.height,
            theme: nextTheme,
            pageNumber: p.pageNumber,
            sourceBytes: p.originalBlob.size,
            imageMode: nextMode,
            darkness: nextDarkness / 100,
            warmth: nextWarmth / 100,
            imageRects: rects,
            imageDims: rects.map((r) =>
              imageTreatment(nextMode, r) === "dim"
                ? imageDimAlpha(r.brightness)
                : 0,
            ),
            releaseResources: true,
          };
          try {
            w.postMessage(req, [bitmap]);
          } catch (error) {
            pendingRef.current.delete(id);
            reject(error);
          }
        });
      } finally {
        // Transferred bitmaps are detached here; close also covers a failed send.
        bitmap.close();
      }
    },
    [],
  );

  /** Build a processing order that starts from `focused` and expands outward. */
  const expandingOrder = useCallback((focused: number, total: number): number[] => {
    const out: number[] = [focused];
    for (let delta = 1; delta < total; delta++) {
      const after = focused + delta;
      const before = focused - delta;
      if (after < total) out.push(after);
      if (before >= 0) out.push(before);
    }
    return out;
  }, []);

  /**
   * Render one page to its original JPEG plus the image data the worker needs.
   * `trace` lets the initial pass report its step and page geometry.
   */
  const renderPageImage = useCallback(
    async (
      pdf: PDFDocumentProxy,
      pageNumber: number,
      cancelled: () => boolean,
      trace?: {
        markStep: (step: PdfReaderStep) => void;
        geometry: (g: PdfFailureDiagnostic) => void;
      },
    ): Promise<Omit<PageRender, "displayBlob" | "displayUrl" | "displayKey" | "byTheme">> => {
      trace?.markStep("get_page");
      const page = await pdf.getPage(pageNumber);
      try {
        throwIfCancelled(cancelled);
        const baseViewport = page.getViewport({ scale: 1 });
        const renderScale = getPdfRenderScale(
          baseViewport.width,
          baseViewport.height,
          RENDER_SCALE,
        );
        const viewport = page.getViewport({ scale: renderScale });
        trace?.geometry({
          pageWidth: Math.max(1, Math.floor(viewport.width)),
          pageHeight: Math.max(1, Math.floor(viewport.height)), baseWidth: baseViewport.width,
          baseHeight: baseViewport.height, renderScale, renderScaleLimited: renderScale < RENDER_SCALE,
        });

        // Locate raster images so the worker can keep them full-color.
        // MUST run before page.render(): rendering converts the operator
        // list's path payloads to Path2D in place, and the scan needs the
        // raw path data to recognize circular clips. Non-fatal: on any
        // hiccup we fall back to darkening everything (the old behavior).
        let imageRects: ImageRect[] = [];
        let scannedPage = false;
        try {
          const scan = await getPageImageRects(page, viewport);
          imageRects = scan.rects;
          scannedPage = scan.scanned;
        } catch (err) {
          console.warn("[pdf-dark] image-region scan failed", err);
        }
        trace?.geometry({ imageRegionCount: imageRects.length });
        await yieldToMain();
        throwIfCancelled(cancelled);

        trace?.markStep("render_page");
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        try {
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("2D canvas not supported");
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          throwIfCancelled(cancelled);
          await yieldToMain();

          // Average luminance + saturation per image (drives the Auto
          // classifier): squash the region into a 32×32 scratch canvas
          // and read that.
          if (imageRects.length > 0) {
            const scratch = document.createElement("canvas");
            scratch.width = 32;
            scratch.height = 32;
            const scratchCtx = scratch.getContext("2d", { willReadFrequently: true });
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
            scratch.width = 0;
            scratch.height = 0;
          }

          await yieldToMain();
          trace?.markStep("encode_page");
          const originalBlob = await canvasToJpegBlob(canvas, 0.88);
          return {
            pageNumber,
            originalBlob,
            width: canvas.width,
            height: canvas.height,
            imageRects,
            scannedPage,
          };
        } finally {
          // The JPEG is the page's source of truth now; release the full-size
          // backing store instead of waiting for GC (iOS caps canvas memory).
          canvas.width = 0;
          canvas.height = 0;
        }
      } finally {
        // PDF.js otherwise keeps every rendered page's operator list and
        // decoded images for the life of the document.
        page.cleanup();
      }
    },
    [],
  );

  /** Darkify a rendered page for one variant (reusing a cached one). Object
   *  URLs are only created when the result is committed (commitPage), so a
   *  result that's no longer wanted can simply be dropped. */
  const showVariant = useCallback(
    async (
      image: Omit<PageRender, "displayBlob" | "displayUrl" | "displayKey" | "byTheme"> &
        Partial<Pick<PageRender, "byTheme">>,
      nextTheme: ThemeId,
      nextMode: ImageMode,
      nextDarkness: number,
      nextWarmth: number,
      cancelled: () => boolean,
      getCacheSnapshot: ImageCacheSnapshotProvider,
    ): Promise<PageRender> => {
      const key = variantKey(nextTheme, nextMode, nextDarkness, nextWarmth);
      const byTheme = image.byTheme ?? {};
      const display =
        byTheme[key] ??
        (await darkifyViaWorker(
          { ...image, displayBlob: image.originalBlob, displayUrl: "", displayKey: "", byTheme },
          nextTheme,
          nextMode,
          nextDarkness,
          nextWarmth,
          cancelled,
          getCacheSnapshot,
        ));
      throwIfCancelled(cancelled);
      // Most recent last; drop the oldest variants beyond the cap.
      const entries = Object.entries(byTheme).filter(([k]) => k !== key);
      entries.push([key, display]);
      return {
        ...image,
        displayBlob: display,
        displayUrl: "",
        displayKey: key,
        byTheme: Object.fromEntries(entries.slice(-MAX_VARIANTS)),
      };
    },
    [darkifyViaWorker],
  );

  /** Show a page's new render, revoking URLs of variants it no longer keeps. */
  const commitPage = useCallback(
    (slots: PageImage[], idx: number, result: PageRender) => {
      const prev = slots[idx].image;
      if (prev) {
        const kept = new Set<Blob>([result.displayBlob]);
        for (const blob of Object.values(result.byTheme)) if (blob) kept.add(blob);
        for (const blob of [prev.displayBlob, ...Object.values(prev.byTheme)]) {
          if (blob && !kept.has(blob)) revokeObjectUrl(blob);
        }
      }
      slots[idx] = {
        ...slots[idx],
        image: { ...result, displayUrl: objectUrl(result.displayBlob) },
        failedKey: undefined,
      };
    },
    [objectUrl, revokeObjectUrl],
  );

  /** Rendered pages only, for failure diagnostics. */
  const residentImages = useCallback(
    () => slotsRef.current.flatMap((s) => (s.image ? [s.image] : [])),
    [],
  );

  // Initial pass: load the PDF and size every page (cheap — no rendering), so
  // the whole document can be scrolled and jumped through. Page 1 is rendered
  // here; the window effect below renders whatever is near the view.
  useEffect(() => {
    let cancelled = false;
    let readerStep: PdfReaderStep = "load_pdfjs";
    let pageNumber = 0;
    let totalPages: number | undefined;
    let failureGeometry: PdfFailureDiagnostic = { inputBytes: file.size };
    let loadingTask: PDFDocumentLoadingTask | undefined;
    const operation = beginPdfOperation("reader", "read", { bytes: file.size });
    // Mirrors the step so an unfinished read (closed or killed tab) still reports where it stopped.
    const markStep = (next: PdfReaderStep) => {
      readerStep = next;
      operation.progress(next, pageNumber || undefined, totalPages);
    };
    markStep("load_pdfjs");
    const doc: { pdf?: PDFDocumentProxy; cancelled: boolean } = { cancelled: false };
    docRef.current = doc;
    const cancel = () => {
      cancelled = true;
      doc.cancelled = true;
      operation.cancel();
    };
    const cancellations = cancelOperationsRef.current;
    cancellations.add(cancel);
    const renderJobs = renderJobsRef.current;
    slotsRef.current = [];
    setStatus("loading");
    setErrorText(null);
    setPages([]);
    setFirstPageSize(null);
    setProgress({ done: 0, total: 0 });
    setCurrentPage(1);
    setViewCenter(0);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        markStep("read_file");
        const arrayBuffer = await readPdfFile(file);
        markStep("parse_pdf");
        loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        doc.pdf = pdf;
        totalPages = pdf.numPages;
        setProgress({ done: 0, total: pdf.numPages });

        const slots: PageImage[] = [];
        slotsRef.current = slots;
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          pageNumber = i;
          failureGeometry = { inputBytes: file.size, totalPages: pdf.numPages };
          markStep(i === 1 ? "first_page" : "get_page");
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          page.cleanup();
          if (cancelled) return;
          const layoutWidth = Math.max(1, Math.floor(base.width * RENDER_SCALE));
          const layoutHeight = Math.max(1, Math.floor(base.height * RENDER_SCALE));
          slots.push({ pageNumber: i, layoutWidth, layoutHeight });

          if (i === 1) {
            setFirstPageSize({ width: layoutWidth, height: layoutHeight });
            const rendered = await renderPageImage(pdf, 1, () => cancelled, {
              markStep,
              geometry: (g) => { failureGeometry = { ...failureGeometry, ...g }; },
            });
            markStep("darkify_page");
            const image = await showVariant(
              rendered,
              theme,
              imageMode,
              appliedDarkness,
              appliedWarmth,
              () => cancelled,
              () => summarizeImageCache(residentImages(), pdf.numPages),
            );
            if (cancelled) return;
            markStep("commit_page");
            commitPage(slots, 0, image);
          }
          // Publish in batches: thousands of single-page updates would
          // re-render the list for every page sized.
          if (i === 1 || i % 50 === 0 || i === pdf.numPages) {
            setPages([...slots]);
            setProgress({ done: i, total: pdf.numPages });
            if (i === 1) setStatus("ready");
            await yieldToMain();
          }
        }
        operation.success(pdf.numPages);
      } catch (e) {
        if (!cancelled && !isCancellationError(e)) {
          console.error("[pdf-dark] render failed", e);
        }
        // Encrypted / empty / corrupt uploads are user input, not bugs —
        // keep them out of Sentry error alerts.
        if (!cancelled && !isCancellationError(e)) {
          operation.failure(e, { ...failureGeometry, readerStep, pageNumber, totalPages, getCacheSnapshot: () => summarizeImageCache(residentImages(), totalPages) });
        }
        if (!cancelled) {
          setErrorText(pdfOpenErrorText(e, locale));
          setStatus("error");
        }
      } finally {
        operation.cancel();
      }
    })();

    return () => {
      // Settle every render loop (this pass and the window effect) before the
      // document goes away, so a destroyed PDF doesn't surface as a failure.
      for (const c of cancellations) c();
      cancellations.delete(cancel);
      renderJobs.clear();
      void loadingTask?.destroy().catch(() => {
        console.warn("[pdf-dark] PDF cleanup failed");
      });
      // This document's pages are discarded with this pass (replaced file,
      // locale change or unmount), so release every page image URL.
      slotsRef.current = [];
      revokeObjectUrls();
    };
    // theme intentionally omitted — initial pass uses whatever theme is live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, renderPageImage, showVariant, commitPage, locale]);

  // Rendered window: keep pages near the view rendered in the current variant
  // (theme, image mode, sliders), starting from the viewed page, and release
  // pages that have scrolled far away. Theme switches re-darkify the window.
  useEffect(() => {
    if (status !== "ready" || pages.length === 0) return;
    const doc = docRef.current;
    const pdf = doc?.pdf;
    if (!doc || !pdf || doc.cancelled) return;
    const key = variantKey(theme, imageMode, appliedDarkness, appliedWarmth);
    const slots = slotsRef.current;
    const center = Math.min(viewCenter, slots.length - 1);
    windowRef.current = { center, key };

    let released = false;
    slots.forEach((slot, idx) => {
      if (slot.image && Math.abs(idx - center) > KEEP_RADIUS) {
        releasePageRender(slot.image);
        slots[idx] = { ...slot, image: undefined };
        released = true;
      }
    });
    if (released) setPages([...slots]);

    const todo = expandingOrder(center, slots.length).filter(
      (idx) =>
        Math.abs(idx - center) <= RENDER_RADIUS &&
        slots[idx].image?.displayKey !== key &&
        slots[idx].failedKey !== key,
    );
    // Only a variant change on rendered pages is "applying a theme"; pages
    // rendered for the first time on scroll show their placeholder instead.
    const retheming = todo.filter((idx) => slots[idx].image).length;
    setThemeApplying(retheming > 0);
    setThemeProgress({ current: 0, total: retheming });
    if (todo.length === 0) return;

    let aborted = false;
    const cancel = () => { aborted = true; };
    const cancellations = cancelOperationsRef.current;
    cancellations.add(cancel);
    const jobs = renderJobsRef.current;
    const stillWanted = (idx: number) => {
      const view = windowRef.current;
      return !doc.cancelled && slotsRef.current === slots && view.key === key &&
        Math.abs(idx - view.center) <= KEEP_RADIUS;
    };

    (async () => {
      let rethemed = 0;
      for (const idx of todo) {
        if (aborted) return;
        const base = slots[idx].image;
        const jobKey = `${idx}:${key}`;
        let job = jobs.get(jobKey);
        if (!job) {
          // Stop between steps once the page has scrolled away or the
          // settings changed; renders still wanted always run to completion.
          const unwanted = () => !stillWanted(idx);
          const started = (async () => {
            const rendered = base ?? (await renderPageImage(pdf, idx + 1, unwanted));
            return showVariant(
              rendered,
              theme,
              imageMode,
              appliedDarkness,
              appliedWarmth,
              unwanted,
              () => summarizeImageCache(residentImages(), slots.length),
            );
          })();
          job = started;
          jobs.set(jobKey, started);
          started
            .then(
              (result) => {
                if (!stillWanted(idx)) return;
                commitPage(slots, idx, result);
                setPages([...slots]);
              },
              (err) => {
                if (doc.cancelled || isCancellationError(err) || slotsRef.current !== slots) return;
                console.error("[pdf-dark] darkify failed", err);
                recordPdfFailure("reader", "preview", err);
                slots[idx] = { ...slots[idx], failedKey: key };
                setPages([...slots]);
              },
            )
            .finally(() => {
              if (jobs.get(jobKey) === started) jobs.delete(jobKey);
            });
        }
        try {
          await job;
        } catch {
          // Reported by the job's own handler above.
        }
        if (aborted) return;
        if (base) setThemeProgress({ current: ++rethemed, total: retheming });
      }
      if (!aborted) {
        setThemeApplying(false);
        setThemeProgress({ current: 0, total: 0 });
      }
    })();

    return () => {
      cancel();
      cancellations.delete(cancel);
    };
  }, [
    status,
    pages.length,
    viewCenter,
    theme,
    imageMode,
    appliedDarkness,
    appliedWarmth,
    expandingOrder,
    renderPageImage,
    showVariant,
    commitPage,
    releasePageRender,
    residentImages,
  ]);

  // Page-frame background follows the sliders so the frame never mismatches
  // the darkened bitmaps it surrounds.
  // Until page 1 has been measured, assume US Letter (612×792 pt), the most
  // common page size, so the placeholder starts close to the final height.
  const placeholderSize = firstPageSize ?? {
    width: 612 * RENDER_SCALE,
    height: 792 * RENDER_SCALE,
  };
  const themeBg = bgCss(
    effectiveThemeBg(theme, appliedDarkness / 100, appliedWarmth / 100),
  );

  // Slider tracks are painted with the actual background colors each end of
  // the range would produce (live values, so the tracks respond while
  // dragging): the color under the thumb is the color the page gets.
  const darknessTrack = `linear-gradient(to right, ${bgCss(
    effectiveThemeBg(theme, 0.5, warmth / 100),
  )}, ${bgCss(effectiveThemeBg(theme, 1, warmth / 100))})`;
  const warmthTrack = `linear-gradient(to right, ${bgCss(
    effectiveThemeBg(theme, darkness / 100, 0),
  )}, ${bgCss(effectiveThemeBg(theme, darkness / 100, 1))})`;
  // While the initial render is still streaming pages in, we know the final
  // page count from `progress.total` but `pages.length` is still catching up.
  const isInitialRendering =
    progress.total > 0 && pages.length < progress.total;
  const totalPages = progress.total || pages.length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Floating controls — the reading surface stays fully unobstructed.
          A round button opens the settings sidebar, a bottom pill handles
          paging; zoom and everything else live in the sidebar. */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="fixed top-16 right-4 z-20 w-11 h-11 rounded-full border border-neutral-700 bg-neutral-900/90 backdrop-blur text-neutral-200 hover:text-neutral-50 hover:border-neutral-500 transition-colors flex items-center justify-center shadow-lg"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
        aria-label={t.viewer.settingsAria}
        title={t.viewer.settingsTitle}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Progress toast — only while the engine is busy */}
      {(isInitialRendering || (status === "ready" && themeApplying)) && (
        <div className="fixed top-16 left-4 z-20 max-w-[60vw] rounded-full border border-neutral-700 bg-neutral-900/90 backdrop-blur px-3 py-1.5 text-xs text-amber-400 truncate shadow-lg">
          {isInitialRendering
            ? t.viewer.renderingProgress(progress.done, progress.total)
            : t.viewer.applyingTheme(
                THEMES[theme].label,
                themeProgress.current,
                themeProgress.total,
              )}
        </div>
      )}

      {/* Floating page pill */}
      {status === "ready" && totalPages > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900/90 backdrop-blur px-1.5 py-1 shadow-lg">
          <button
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-full text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label={t.viewer.previousPage}
            title={t.viewer.previousPageTitle}
          >
            ‹
          </button>
          <div className="flex items-center gap-1 text-sm text-neutral-300">
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) =>
                setPageInput(e.target.value.replace(/[^0-9]/g, ""))
              }
              onBlur={submitJumpInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitJumpInput();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-12 px-2 py-1 rounded bg-neutral-800 text-center text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              aria-label={t.viewer.jumpToPage}
            />
            <span className="text-neutral-500">/ {totalPages}</span>
          </div>
          <button
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 rounded-full text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label={t.viewer.nextPage}
            title={t.viewer.nextPageTitle}
          >
            ›
          </button>
        </div>
      )}

      {/* Settings sidebar — theme, images, sliders, convert link. Slides in
          from the right so it never sits on top of the text while reading. */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60"
          onClick={() => setSettingsOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-40 h-full w-80 max-w-[85vw] bg-neutral-900 border-l border-neutral-800 p-5 overflow-y-auto transition-transform duration-200 text-left ${
          settingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label={t.viewer.settingsAria}
        aria-hidden={!settingsOpen}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-neutral-100 uppercase tracking-wide">
            {t.viewer.settingsTitle}
          </span>
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-8 h-8 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            aria-label={t.viewer.closeSettings}
          >
            ✕
          </button>
        </div>
        <div className="text-xs text-neutral-500 truncate mb-6">{file.name}</div>

        {/* Theme */}
        <div className="text-[11px] uppercase tracking-wide text-neutral-500 mb-2">
          {t.viewer.theme}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {THEME_IDS.map((id) => {
            const active = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                disabled={isInitialRendering}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  active
                    ? "border-amber-400 text-amber-400 bg-amber-400/10 font-semibold"
                    : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
                }`}
                aria-pressed={active}
                title={
                  isInitialRendering ? t.viewer.waitFirstPass : undefined
                }
              >
                <span
                  aria-hidden
                  className={`w-3.5 h-3.5 rounded-full border ${
                    active ? "border-amber-400/50" : "border-neutral-600"
                  }`}
                  style={{ background: THEMES[id].swatch }}
                />
                {THEMES[id].label}
              </button>
            );
          })}
        </div>

        {/* Image handling: three explicit treatments, scans included */}
        <div
          className="text-[11px] uppercase tracking-wide text-neutral-500 mb-2"
          title={t.imageMode.imagesTitleAttr}
        >
          {t.imageMode.label}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {(
            [
              ["original", t.imageMode.original, t.imageMode.originalTip],
              ["smart", t.imageMode.auto, t.imageMode.autoTip],
              ["invert", t.imageMode.invert, t.imageMode.invertTip],
            ] as [ImageMode, string, string][]
          ).map(([m, label, tip]) => {
            const active = imageMode === m;
            return (
              <button
                key={m}
                onClick={() => setImageMode(m)}
                disabled={isInitialRendering}
                className={`px-2 py-2 rounded-lg border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  active
                    ? "border-amber-400 text-amber-400 bg-amber-400/10 font-semibold"
                    : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
                }`}
                aria-pressed={active}
                title={tip}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Darkness slider — drag left if full dark feels too black */}
        <div className="mb-5" title={t.sliders.darknessTitle}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              {t.sliders.darkness}
            </span>
            <span className="text-xs tabular-nums text-neutral-300">
              {darkness}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={darkness}
            onChange={(e) => setDarkness(Number(e.target.value))}
            disabled={isInitialRendering}
            className="slider-preview w-full disabled:opacity-40"
            style={{ background: darknessTrack }}
            aria-label={t.sliders.darkness}
          />
        </div>

        {/* Warmth slider — color-temperature shift for night reading */}
        <div className="mb-6" title={t.sliders.warmthTitleLong}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              {t.sliders.warmth}
            </span>
            <span className="text-xs tabular-nums text-neutral-300">
              {warmth}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={warmth}
            onChange={(e) => setWarmth(Number(e.target.value))}
            disabled={isInitialRendering}
            className="slider-preview w-full disabled:opacity-40"
            style={{ background: warmthTrack }}
            aria-label={t.sliders.warmth}
          />
        </div>

        {/* Zoom — display width of the pages; also on +/−/0 keys */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              {t.viewer.zoom}
            </span>
            <span className="text-xs tabular-nums text-neutral-300">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))
              }
              disabled={zoom <= 0.5}
              className="w-9 h-9 rounded-lg border border-neutral-800 text-neutral-300 hover:text-neutral-50 hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label={t.viewer.zoomOut}
              title={t.viewer.zoomOutTitle}
            >
              −
            </button>
            <button
              onClick={() => setZoom(1)}
              className="flex-1 h-9 rounded-lg border border-neutral-800 text-xs text-neutral-300 hover:text-neutral-50 hover:border-neutral-600 transition-colors"
              title={t.viewer.resetTitle}
            >
              {t.viewer.reset}
            </button>
            <button
              onClick={() =>
                setZoom((z) => Math.min(2, Math.round((z + 0.25) * 100) / 100))
              }
              disabled={zoom >= 2}
              className="w-9 h-9 rounded-lg border border-neutral-800 text-neutral-300 hover:text-neutral-50 hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label={t.viewer.zoomIn}
              title={t.viewer.zoomInTitle}
            >
              +
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-800 my-6" />

        <Link
          href={t.viewer.invertHref}
          onNavigate={cancelForNavigation}
          className="block text-center px-4 py-2 rounded-full text-sm text-neutral-300 hover:text-neutral-100 border border-neutral-800 hover:border-neutral-600 transition-colors"
          title={t.viewer.invertAndDownloadTitle}
        >
          {t.viewer.invertAndDownload}
        </Link>
        <button
          onClick={onReset}
          className="mt-3 w-full px-4 py-2 rounded-full text-sm text-neutral-400 hover:text-neutral-100 border border-neutral-800 hover:border-neutral-600 transition-colors"
        >
          {t.viewer.newFile}
        </button>
      </aside>

      {status === "loading" && (
        <div
          className="mx-auto flex flex-col items-center justify-center overflow-hidden rounded-lg text-center text-neutral-400"
          style={{
            maxWidth: placeholderSize.width * zoom,
            aspectRatio: `${placeholderSize.width} / ${placeholderSize.height}`,
            background: themeBg,
          }}
        >
          <div className="text-lg">
            {t.viewer.renderingLoading(progress.done, progress.total || "?")}
          </div>
          <div className="mt-3 w-64 mx-auto h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-[width]"
              style={{
                width: progress.total
                  ? `${(progress.done / progress.total) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-16 text-red-400">
          {errorText ?? t.viewer.readErrorFallback}
        </div>
      )}

      {status === "ready" && (
        <div ref={scrollRootRef} className="space-y-4">
          {pages.map((p, i) => (
            <div
              key={i}
              data-page-index={i}
              ref={(el) => {
                pageRefs.current[i] = el;
              }}
              className="mx-auto overflow-hidden rounded-lg shadow-2xl"
              style={{ maxWidth: p.layoutWidth * zoom, background: themeBg }}
            >
              {p.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.image.displayUrl}
                  alt={t.viewer.pageAlt(i + 1)}
                  width={p.layoutWidth}
                  height={p.layoutHeight}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-auto"
                />
              ) : (
                // Not rendered yet, or released far from the view: hold the
                // page's exact space so scrolling and jumps stay in place.
                <div
                  className="w-full"
                  style={{ aspectRatio: `${p.layoutWidth} / ${p.layoutHeight}` }}
                />
              )}
            </div>
          ))}
          {/* While later pages are still rendering, hold the next page's
              space (sized like page 1) so each new page lands where the
              placeholder was rather than pushing the content below it. */}
          {pages.length < progress.total && (
            <div
              aria-hidden="true"
              className="mx-auto rounded-lg"
              style={{
                maxWidth: placeholderSize.width * zoom,
                aspectRatio: `${placeholderSize.width} / ${placeholderSize.height}`,
                background: themeBg,
                opacity: 0.5,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
