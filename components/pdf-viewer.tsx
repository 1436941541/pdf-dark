"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { THEMES, THEME_IDS, type ThemeId } from "@/lib/themes";
import type {
  DarkifyRequest,
  DarkifyResponse,
} from "@/lib/dark-worker";

type PageImage = {
  /** Full-color rendered PDF page (source of truth, never modified). */
  originalDataUrl: string;
  /** Cached decoded bitmap for fast worker hand-off. Consumed once per theme switch. */
  width: number;
  height: number;
  /** Current dark-themed version shown to the user. Regenerated on theme change. */
  displayDataUrl: string;
};

type Props = {
  file: File;
  onReset: () => void;
};

export function PdfViewer({ file, onReset }: Props) {
  const [pages, setPages] = useState<PageImage[]>([]);
  const [theme, setTheme] = useState<ThemeId>("midnight");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const [themeApplying, setThemeApplying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const themeVersionRef = useRef(0);
  const cancelledRef = useRef(false);
  const lastAppliedThemeRef = useRef<ThemeId | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  /** Convert an original dataUrl → worker-processed themed dataUrl. */
  const darkifyViaWorker = useCallback(
    async (p: PageImage, nextTheme: ThemeId): Promise<string> => {
      const w = workerRef.current;
      if (!w) throw new Error("worker not ready");
      const res = await fetch(p.originalDataUrl);
      const srcBlob = await res.blob();
      const bitmap = await createImageBitmap(srcBlob);

      const id = ++msgIdRef.current;
      const outBlob = await new Promise<Blob>((resolve) => {
        pendingRef.current.set(id, resolve);
        const req: DarkifyRequest = {
          id,
          bitmap,
          width: p.width,
          height: p.height,
          theme: nextTheme,
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

        const rendered: PageImage[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelledRef.current) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("2D canvas not supported");
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;

          const originalDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          const stub: PageImage = {
            originalDataUrl,
            width: canvas.width,
            height: canvas.height,
            displayDataUrl: "",
          };
          const display = await darkifyViaWorker(stub, theme);
          if (cancelledRef.current) return;

          rendered.push({ ...stub, displayDataUrl: display });
          setProgress({ done: i, total: pdf.numPages });
        }

        if (!cancelledRef.current) {
          setPages(rendered);
          lastAppliedThemeRef.current = theme;
          setStatus("ready");
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

  // Theme switch: re-darkify pages, starting from whatever the user is looking at
  useEffect(() => {
    if (status !== "ready" || pages.length === 0) return;
    if (lastAppliedThemeRef.current === theme) return;

    themeVersionRef.current += 1;
    const version = themeVersionRef.current;
    let aborted = false;
    setThemeApplying(true);

    (async () => {
      const next: PageImage[] = pages.slice();
      const focused = focusedPageIndex();
      const order = expandingOrder(focused, next.length);
      const VISIBLE_COMMIT = 6; // commit per page for the first N (around user's view)

      for (let k = 0; k < order.length; k++) {
        if (aborted || themeVersionRef.current !== version) return;
        const idx = order[k];
        const p = next[idx];
        try {
          const display = await darkifyViaWorker(p, theme);
          if (aborted || themeVersionRef.current !== version) return;
          next[idx] = { ...p, displayDataUrl: display };
        } catch (err) {
          console.error("[pdf-dark] darkify failed", err);
          Sentry.captureException(err, { tags: { stage: "darkify" } });
        }
        // Commit frequently near the user's view; batch later pages.
        if (k < VISIBLE_COMMIT || k % 4 === 0) {
          setPages([...next]);
        }
      }

      if (!aborted && themeVersionRef.current === version) {
        setPages(next);
        lastAppliedThemeRef.current = theme;
        setThemeApplying(false);
      }
    })();

    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, status]);

  const handleDownload = useCallback(async () => {
    if (!pages.length) return;
    setDownloading(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      for (const p of pages) {
        const res = await fetch(p.displayDataUrl);
        const bytes = new Uint8Array(await res.arrayBuffer());
        const embedded = await doc.embedJpg(bytes);
        const pdfPage = doc.addPage([p.width, p.height]);
        pdfPage.drawImage(embedded, {
          x: 0,
          y: 0,
          width: p.width,
          height: p.height,
        });
      }
      const outBytes = await doc.save();
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
  }, [pages, theme, file.name]);

  const themeBg = THEMES[theme].swatch;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur px-4 py-3 mb-6">
        <div className="flex-1 min-w-0 text-sm text-neutral-300 truncate">
          {file.name}
          {themeApplying && (
            <span className="ml-2 text-xs text-amber-400">applying theme…</span>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-full border border-neutral-800 p-1">
          {THEME_IDS.map((id) => {
            const active = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  active
                    ? "bg-amber-400 text-neutral-950 font-semibold"
                    : "text-neutral-400 hover:text-neutral-100"
                }`}
                aria-pressed={active}
              >
                {THEMES[id].label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleDownload}
          disabled={status !== "ready" || downloading || themeApplying}
          className="px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {downloading ? "Building..." : "Download"}
        </button>

        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-full text-sm text-neutral-400 hover:text-neutral-100 border border-neutral-800"
        >
          New file
        </button>
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
        <div className="space-y-4">
          {pages.map((p, i) => (
            <div
              key={i}
              ref={(el) => {
                pageRefs.current[i] = el;
              }}
              className="mx-auto overflow-hidden rounded-lg shadow-2xl"
              style={{ maxWidth: p.width, background: themeBg }}
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
