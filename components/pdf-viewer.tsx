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
  imageTreatment,
  RENDER_SCALE,
  type ImageMode,
} from "@/lib/build-dark-pdf";
import { effectiveThemeBg, imageDimAlpha } from "@/lib/dark-color";

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

/** effectiveThemeBg result → CSS color. */
const bgCss = (c: { r: number; g: number; b: number }) =>
  `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

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
  // Theme/image/slider controls live in a slide-in sidebar so the sticky top
  // bar stays slim and never covers the page while reading.
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Reader controls — current page tracked from scroll, zoom factor applied
  // to each page's display width, pageInput is the controlled value of the
  // "jump to page" text field.
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const themeVersionRef = useRef(0);
  const cancelledRef = useRef(false);
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

  // Page-frame background follows the sliders so the frame never mismatches
  // the darkened bitmaps it surrounds.
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
        aria-label="Reader settings"
        title="Settings"
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
            ? `Rendering ${progress.done} / ${progress.total} pages`
            : `Applying ${THEMES[theme].label} · ${themeProgress.current} / ${themeProgress.total}`}
        </div>
      )}

      {/* Floating page pill */}
      {status === "ready" && totalPages > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900/90 backdrop-blur px-1.5 py-1 shadow-lg">
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
        aria-label="Reader settings"
        aria-hidden={!settingsOpen}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-neutral-100 uppercase tracking-wide">
            Settings
          </span>
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-8 h-8 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        <div className="text-xs text-neutral-500 truncate mb-6">{file.name}</div>

        {/* Theme */}
        <div className="text-[11px] uppercase tracking-wide text-neutral-500 mb-2">
          Theme
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
                  isInitialRendering
                    ? "Wait until the first pass finishes"
                    : undefined
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
          title="How photos, figures and scanned pages are treated"
        >
          Images
        </div>
        <div className="grid grid-cols-3 gap-2 mb-6">
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
        <div
          className="mb-5"
          title="How dark the page gets — drag left for a softer, lighter background"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              Darkness
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
            aria-label="Darkness"
          />
        </div>

        {/* Warmth slider — color-temperature shift for night reading */}
        <div
          className="mb-6"
          title="Background color temperature — drag right for a warmer, candle-light tint that's easier on the eyes at night"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              Warmth
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
            aria-label="Warmth"
          />
        </div>

        {/* Zoom — display width of the pages; also on +/−/0 keys */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wide text-neutral-500">
              Zoom
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
              aria-label="Zoom out"
              title="Zoom out (−)"
            >
              −
            </button>
            <button
              onClick={() => setZoom(1)}
              className="flex-1 h-9 rounded-lg border border-neutral-800 text-xs text-neutral-300 hover:text-neutral-50 hover:border-neutral-600 transition-colors"
              title="Reset zoom (0)"
            >
              Reset
            </button>
            <button
              onClick={() =>
                setZoom((z) => Math.min(2, Math.round((z + 0.25) * 100) / 100))
              }
              disabled={zoom >= 2}
              className="w-9 h-9 rounded-lg border border-neutral-800 text-neutral-300 hover:text-neutral-50 hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label="Zoom in"
              title="Zoom in (+)"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-800 my-6" />

        <a
          href="/converter"
          className="block text-center px-4 py-2 rounded-full text-sm text-neutral-300 hover:text-neutral-100 border border-neutral-800 hover:border-neutral-600 transition-colors"
          title="Open the converter to save a dark-themed copy of your PDF"
        >
          Convert &amp; download →
        </a>
        <button
          onClick={onReset}
          className="mt-3 w-full px-4 py-2 rounded-full text-sm text-neutral-400 hover:text-neutral-100 border border-neutral-800 hover:border-neutral-600 transition-colors"
        >
          New file
        </button>
      </aside>

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
