"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { THEMES, THEME_IDS, type ThemeId } from "@/lib/themes";
import type {
  DarkifyRequest,
  DarkifyResponse,
} from "@/lib/dark-worker";
import { getPageImageRects, type ImageRect } from "@/lib/image-regions";
import {
  buildDarkPdf,
  imageTreatment,
  RENDER_SCALE,
  type ImageMode,
} from "@/lib/build-dark-pdf";
import { effectiveThemeBg, imageDimAlpha } from "@/lib/dark-color";
import type { PDFDocumentProxy } from "pdfjs-dist";

type PageImage = {
  /** Full-color rendered PDF page (source of truth, never modified). */
  originalDataUrl: string;
  width: number;
  height: number;
  /** Current dark-themed version shown to the user. */
  displayDataUrl: string;
  /** Cache of already-darkified dataUrls keyed by `${theme}:${imageMode}` —
   *  lets re-applying a known combination skip the worker. */
  byTheme: Partial<Record<string, string>>;
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

type Props = {
  file: File;
  onReset: () => void;
};

/** Cache key for one theme + image-mode + darkness + warmth combination. */
const variantKey = (t: ThemeId, m: ImageMode, d: number, w: number) =>
  `${t}:${m}:${d}:${w}`;

export function PdfViewer({ file, onReset }: Props) {
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
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const [themeApplying, setThemeApplying] = useState(false);
  const [themeProgress, setThemeProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });
  const [downloading, setDownloading] = useState(false);

  // Reader controls — current page tracked from scroll, zoom factor applied
  // to each page's display width, pageInput is the controlled value of the
  // "jump to page" text field.
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const themeVersionRef = useRef(0);
  const cancelledRef = useRef(false);
  // Live pdf.js document — the download path reads native-resolution images
  // out of its object pool (see lib/native-image.ts).
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const lastAppliedThemeRef = useRef<string | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  // Worker setup
  const workerRef = useRef<Worker | null>(null);
  const msgIdRef = useRef(0);
  const pendingRef = useRef(new Map<number, (blob: Blob) => void>());

  useEffect(() => {
    const w = new Worker(new URL("../lib/dark-worker.ts", import.meta.url), {
      type: "module",
    });
    w.onmessage = (e: MessageEvent<DarkifyResponse>) => {
      const { id, blob } = e.data;
      const cb = pendingRef.current.get(id);
      if (cb) {
        pendingRef.current.delete(id);
        cb(blob);
      }
    };
    workerRef.current = w;
    return () => {
      pendingRef.current.clear();
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

  const scrollToPage = useCallback((target: number) => {
    const clamped = Math.max(1, Math.min(pageRefs.current.length, target));
    const el = pageRefs.current[clamped - 1];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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

  /** Convert an original dataUrl → worker-processed themed dataUrl. */
  const darkifyViaWorker = useCallback(
    async (
      p: PageImage,
      nextTheme: ThemeId,
      nextMode: ImageMode,
      nextDarkness: number,
      nextWarmth: number,
    ): Promise<string> => {
      // "Original" mode treats a scanned page (page == one big image) as an
      // image: the page stays exactly as in the source, no darkening at all.
      if (nextMode === "original" && p.scannedPage) return p.originalDataUrl;

      const w = workerRef.current;
      if (!w) throw new Error("worker not ready");
      const res = await fetch(p.originalDataUrl);
      const srcBlob = await res.blob();
      const bitmap = await createImageBitmap(srcBlob);

      // Per-image treatment (keep / dim / invert) — images slated for
      // inversion simply aren't pasted back, the dark mapping handles them.
      const rects = p.imageRects.filter(
        (r) => imageTreatment(nextMode, r) !== "invert",
      );
      const id = ++msgIdRef.current;
      const outBlob = await new Promise<Blob>((resolve) => {
        pendingRef.current.set(id, resolve);
        const req: DarkifyRequest = {
          id,
          bitmap,
          width: p.width,
          height: p.height,
          theme: nextTheme,
          darkness: nextDarkness / 100,
          warmth: nextWarmth / 100,
          imageRects: rects,
          imageDims: rects.map((r) =>
            imageTreatment(nextMode, r) === "dim"
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
    [],
  );

  /** Find the page index whose center is closest to the viewport center. */
  const focusedPageIndex = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    const viewportCenter = window.innerHeight / 2;
    let best = 0;
    let bestDist = Infinity;
    pageRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    return best;
  }, []);

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

  // Initial render: load PDF, render each page, darkify with starting theme via worker
  useEffect(() => {
    cancelledRef.current = false;
    setStatus("loading");
    setPages([]);
    setProgress({ done: 0, total: 0 });

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        if (cancelledRef.current) return;
        pdfDocRef.current = pdf;
        setProgress({ done: 0, total: pdf.numPages });

        // Stream pages to React as soon as each finishes. The user can start
        // reading after page 1 — they don't have to wait for the whole PDF.
        const rendered: PageImage[] = [];
        // Lock the theme/mode combo for the entire initial pass to avoid
        // racing with the variant-switch effect (which is disabled in UI
        // while isInitialRendering is true).
        lastAppliedThemeRef.current = variantKey(
          theme,
          imageMode,
          appliedDarkness,
          appliedWarmth,
        );
        // Small scratch canvas for per-image brightness sampling.
        const scratch = document.createElement("canvas");
        scratch.width = 32;
        scratch.height = 32;
        const scratchCtx = scratch.getContext("2d", { willReadFrequently: true });
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelledRef.current) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });

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

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("2D canvas not supported");
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;

          // Average luminance + saturation per image (drives the Auto
          // classifier): squash the region into the 32×32 scratch canvas
          // and read that.
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
          const stub: PageImage = {
            originalDataUrl,
            width: canvas.width,
            height: canvas.height,
            displayDataUrl: "",
            byTheme: {},
            imageRects,
            scannedPage,
          };
          const display = await darkifyViaWorker(
            stub,
            theme,
            imageMode,
            appliedDarkness,
            appliedWarmth,
          );
          if (cancelledRef.current) return;

          rendered.push({
            ...stub,
            displayDataUrl: display,
            byTheme: {
              [variantKey(theme, imageMode, appliedDarkness, appliedWarmth)]:
                display,
            },
          });
          setPages([...rendered]);
          setProgress({ done: i, total: pdf.numPages });
          if (i === 1) setStatus("ready");
        }
      } catch (e) {
        console.error("[pdf-dark] render failed", e);
        Sentry.captureException(e, { tags: { stage: "render" } });
        if (!cancelledRef.current) setStatus("error");
      }
    })();

    return () => {
      cancelledRef.current = true;
    };
    // theme intentionally omitted — initial pass uses whatever theme is live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, darkifyViaWorker]);

  // Variant switch (theme or image mode): re-darkify pages, starting from
  // whatever the user is looking at. Fast path: if every page already has
  // this combination cached, swap dataUrls instantly.
  useEffect(() => {
    if (status !== "ready" || pages.length === 0) return;
    const vk = variantKey(theme, imageMode, appliedDarkness, appliedWarmth);

    // Bump version up-front — aborts any in-flight worker loop from a previous switch.
    themeVersionRef.current += 1;
    const version = themeVersionRef.current;

    // User toggled back to the already-applied variant (often mid-flight,
    // when they cancel a switch). Recover any pages that were partially
    // committed to the canceled one, then reset so Download unlocks.
    if (lastAppliedThemeRef.current === vk) {
      setPages((cur) =>
        cur.map((p) => {
          const cached = p.byTheme[vk];
          return cached && p.displayDataUrl !== cached
            ? { ...p, displayDataUrl: cached }
            : p;
        }),
      );
      setThemeApplying(false);
      setThemeProgress({ current: 0, total: 0 });
      return;
    }

    const allCached = pages.every((p) => p.byTheme[vk] !== undefined);
    if (allCached) {
      setPages((cur) =>
        cur.map((p) => ({ ...p, displayDataUrl: p.byTheme[vk]! })),
      );
      lastAppliedThemeRef.current = vk;
      setThemeApplying(false);
      setThemeProgress({ current: 0, total: 0 });
      return;
    }

    let aborted = false;
    setThemeApplying(true);

    (async () => {
      const next: PageImage[] = pages.slice();
      const focused = focusedPageIndex();
      const order = expandingOrder(focused, next.length);
      const VISIBLE_COMMIT = 6; // commit per page for the first N (around user's view)
      const vk2 = variantKey(theme, imageMode, appliedDarkness, appliedWarmth);
      const toCompute = order.filter(
        (idx) => next[idx].byTheme[vk2] === undefined,
      ).length;
      setThemeProgress({ current: 0, total: toCompute });
      let computed = 0;

      for (let k = 0; k < order.length; k++) {
        if (aborted || themeVersionRef.current !== version) return;
        const idx = order[k];
        const p = next[idx];

        const cached = p.byTheme[vk2];
        if (cached !== undefined) {
          next[idx] = { ...p, displayDataUrl: cached };
        } else {
          try {
            const display = await darkifyViaWorker(
              p,
              theme,
              imageMode,
              appliedDarkness,
              appliedWarmth,
            );
            if (aborted || themeVersionRef.current !== version) return;
            next[idx] = {
              ...p,
              displayDataUrl: display,
              byTheme: { ...p.byTheme, [vk2]: display },
            };
            computed++;
            setThemeProgress({ current: computed, total: toCompute });
          } catch (err) {
            console.error("[pdf-dark] darkify failed", err);
            Sentry.captureException(err, { tags: { stage: "darkify" } });
          }
        }
        // Commit frequently near the user's view; batch later pages.
        if (k < VISIBLE_COMMIT || k % 4 === 0) {
          setPages([...next]);
        }
      }

      if (!aborted && themeVersionRef.current === version) {
        setPages(next);
        lastAppliedThemeRef.current = variantKey(
          theme,
          imageMode,
          appliedDarkness,
          appliedWarmth,
        );
        setThemeApplying(false);
        setThemeProgress({ current: 0, total: 0 });
      }
    })();

    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, imageMode, appliedDarkness, appliedWarmth, status]);

  const handleDownload = useCallback(async () => {
    if (!pages.length) return;
    setDownloading(true);
    try {
      // Object-recolor where possible, raster fallback per page — see
      // lib/build-dark-pdf.ts for the full mode-selection story.
      const srcBytes = await file.arrayBuffer();
      const { bytes: outBytes, objectPages, rasterPages } = await buildDarkPdf(
        srcBytes,
        pages,
        theme,
        imageMode,
        pdfDocRef.current,
        appliedDarkness / 100,
        appliedWarmth / 100,
      );
      console.info(
        `[pdf-dark] download built: ${objectPages} vector page(s), ${rasterPages} raster page(s)`,
      );
      const copy = new Uint8Array(outBytes.byteLength);
      copy.set(outBytes);
      const blob = new Blob([copy.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + `-${theme}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[pdf-dark] download failed", e);
      Sentry.captureException(e, { tags: { stage: "download" } });
      alert("Something went wrong while building the PDF. See console for details.");
    } finally {
      setDownloading(false);
    }
  }, [pages, theme, imageMode, appliedDarkness, appliedWarmth, file]);

  // Page-frame background follows the sliders so the frame never mismatches
  // the darkened bitmaps it surrounds.
  const effBg = effectiveThemeBg(theme, appliedDarkness / 100, appliedWarmth / 100);
  const themeBg = `rgb(${Math.round(effBg.r)}, ${Math.round(effBg.g)}, ${Math.round(effBg.b)})`;
  // While the initial render is still streaming pages in, we know the final
  // page count from `progress.total` but `pages.length` is still catching up.
  const isInitialRendering =
    progress.total > 0 && pages.length < progress.total;
  const totalPages = progress.total || pages.length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur px-4 py-3 mb-6 space-y-2">
        {/* Row 1 — file, themes, download, reset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0 text-sm text-neutral-300 truncate">
            {file.name}
            {isInitialRendering && (
              <span className="ml-2 text-xs text-amber-400">
                Rendering {progress.done} / {progress.total} pages — you can
                start reading now
              </span>
            )}
            {!isInitialRendering && themeApplying && (
              <span className="ml-2 text-xs text-amber-400">
                Applying {THEMES[theme].label} · {themeProgress.current} /{" "}
                {themeProgress.total} pages
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-neutral-800 p-1">
            {THEME_IDS.map((id) => {
              const active = theme === id;
              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  disabled={isInitialRendering}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    active
                      ? "bg-amber-400 text-neutral-950 font-semibold"
                      : "text-neutral-400 hover:text-neutral-100"
                  }`}
                  aria-pressed={active}
                  title={
                    isInitialRendering
                      ? "Wait until the first pass finishes"
                      : undefined
                  }
                >
                  <span
                    aria-hidden
                    className={`w-2.5 h-2.5 rounded-full border ${
                      active ? "border-neutral-950/30" : "border-neutral-600"
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
            className="flex items-center gap-1 rounded-full border border-neutral-800 p-1"
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
            ).map(([mode, label, tip]) => {
              const active = imageMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setImageMode(mode)}
                  disabled={isInitialRendering}
                  className={`px-3 py-1 rounded-full text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
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

          {/* Darkness slider — drag left if full dark feels too black */}
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
              disabled={isInitialRendering}
              className="w-24 accent-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Darkness"
            />
            <span className="w-9 text-right text-xs tabular-nums text-neutral-300">
              {darkness}%
            </span>
          </div>

          {/* Warmth slider — color-temperature shift for night reading */}
          <div
            className="flex items-center gap-2 rounded-full border border-neutral-800 px-3 py-1.5"
            title="Background color temperature — drag right for a warmer, candle-light tint that's easier on the eyes at night"
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
              disabled={isInitialRendering}
              className="w-24 accent-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Warmth"
            />
            <span className="w-9 text-right text-xs tabular-nums text-neutral-300">
              {warmth}%
            </span>
          </div>

          <button
            onClick={handleDownload}
            disabled={
              status !== "ready" ||
              downloading ||
              themeApplying ||
              isInitialRendering
            }
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title={
              isInitialRendering
                ? "Wait until all pages finish rendering"
                : undefined
            }
          >
            {downloading
              ? "Building..."
              : themeApplying
                ? "Applying…"
                : isInitialRendering
                  ? `Rendering ${progress.done}/${progress.total}`
                  : "Download"}
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-full text-sm text-neutral-400 hover:text-neutral-100 border border-neutral-800"
          >
            New file
          </button>
        </div>

        {/* Row 2 — reader controls (page nav, zoom) */}
        {status === "ready" && totalPages > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/60">
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-8 h-8 rounded-full text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Previous page"
                title="Previous page (←)"
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
                  aria-label="Jump to page"
                />
                <span className="text-neutral-500">/ {totalPages}</span>
              </div>
              <button
                onClick={() => scrollToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 rounded-full text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Next page"
                title="Next page (→)"
              >
                ›
              </button>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.max(0.5, Math.round((z - 0.25) * 100) / 100),
                  )
                }
                disabled={zoom <= 0.5}
                className="w-8 h-8 rounded-full text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Zoom out"
                title="Zoom out (−)"
              >
                −
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 py-1 text-xs text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800 rounded transition-colors min-w-[3.5rem]"
                title="Reset zoom (0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.min(2, Math.round((z + 0.25) * 100) / 100),
                  )
                }
                disabled={zoom >= 2}
                className="w-8 h-8 rounded-full text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Zoom in"
                title="Zoom in (+)"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {status === "loading" && (
        <div className="text-center py-16 text-neutral-400">
          <div className="text-lg">
            Rendering page {progress.done} / {progress.total || "?"}…
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
          Couldn&apos;t read that PDF. Try another file?
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
              style={{ maxWidth: p.width * zoom, background: themeBg }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.displayDataUrl}
                alt={`Page ${i + 1}`}
                width={p.width}
                height={p.height}
                className="block w-full h-auto"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
