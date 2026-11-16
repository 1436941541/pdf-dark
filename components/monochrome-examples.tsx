"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const EXAMPLES = [
  {
    id: 4,
    label: "Scanned pages",
    title: "Balance faint scanned text against paper shadow",
    description:
      "At threshold 128, the right-edge paper shadow drops to clean white, while faint text (gray level 170–210) and the bottom rule disappear. Raising the cutoff to 190 recovers the gray level 170 line and bottom rule as solid black, and turns the dark edge shadow into a black bar.",
    note: "Controlled scan sample with faint text levels and edge shading.",
  },
  {
    id: 2,
    label: "Color charts",
    title: "Watch pale bars and highlights in two-color mode",
    description:
      "Grayscale keeps the Yellow bar lighter than Red, Blue, and Green. At threshold 128, Red, Blue, and Green turn solid black, while the Yellow bar, its label, and the yellow highlight box vanish into white.",
    note: "Chart sample converted directly with this tool.",
  },
  {
    id: 3,
    label: "Photos",
    title: "Keep portrait shading with grayscale",
    description:
      "Grayscale preserves skin tones, background gradients, and ribbon detail in this U.S. Navy portrait (Grace Hopper, Pillow test image). Threshold 128 collapses midtones into stark black-and-white patches.",
    note: "Photo: U.S. Navy portrait of Grace Hopper via the Pillow test set.",
  },
  {
    id: 1,
    label: "Text documents",
    title: "Check 8 pt type and thin rules",
    description:
      "Grayscale keeps gray anti-aliasing on 8 pt to 24 pt text and three rule weights. Two-color mode removes gray edge pixels for high contrast on e-ink readers and monochrome laser printers.",
    note: "Typography sample converted at default settings.",
  },
] as const;

const BASE = "/examples/black-and-white";

function previewSrc(file: string, id: number) {
  const extension = file === "original" && id === 3 ? "webp" : "png";
  return `${BASE}/${file}-${id}.${extension}`;
}

function panelsFor(id: number) {
  if (id === 4) {
    return [
      { label: "Original", file: "original", detail: "Uneven shadow + faint lines" },
      { label: "Grayscale", file: "gray", detail: "256 gray levels" },
      { label: "Threshold 128", file: "bw128", detail: "Shadow gone, 170 lost" },
      { label: "Threshold 190", file: "bw190", detail: "170 back, edge black" },
    ] as const;
  }
  if (id === 2) {
    return [
      { label: "Original", file: "original", detail: "4 colored bars" },
      { label: "Grayscale", file: "gray", detail: "Yellow stays lighter" },
      { label: "Threshold 128", file: "bw128", detail: "Yellow bar vanishes" },
    ] as const;
  }
  if (id === 3) {
    return [
      { label: "Original", file: "original", detail: "Color portrait" },
      { label: "Grayscale", file: "gray", detail: "Highlights preserved" },
      { label: "Threshold 128", file: "bw128", detail: "Midtones collapsed" },
    ] as const;
  }
  return [
    { label: "Original", file: "original", detail: "8–24 pt type" },
    { label: "Grayscale", file: "gray", detail: "Anti-aliased edges" },
    { label: "Threshold 128", file: "bw128", detail: "Crisp binary strokes" },
  ] as const;
}

const PREVIEW_FILES_BY_ID = new Map<number, string[]>(
  EXAMPLES.map(({ id }) => [
    id,
    panelsFor(id).map(({ file }) => previewSrc(file, id)),
  ]),
);
const PREVIEW_FILES = [...PREVIEW_FILES_BY_ID.values()].flat();

export function MonochromeExamples({ onTrySample }: { onTrySample: (id: number) => void }) {
  const [selected, setSelected] = useState<number>(4);
  const [preloadReady, setPreloadReady] = useState(false);
  const loadedGroups = useRef(new Map<number, Set<string>>());
  const decodedImages = useRef(new Map<string, HTMLImageElement>());

  function markLoaded(id: number, src: string) {
    const expected = PREVIEW_FILES_BY_ID.get(id);
    if (!expected?.includes(src)) return;
    const group = loadedGroups.current.get(id) ?? new Set<string>();
    group.add(src);
    loadedGroups.current.set(id, group);
    // Start idle warmup only after the active comparison finishes loading all its panels.
    if (group.size >= expected.length) setPreloadReady(true);
  }

  useEffect(() => {
    if (!preloadReady) return;
    let disposed = false;
    const retained = decodedImages.current;
    const visibleFiles = loadedGroups.current;
    async function warmImages() {
      for (const src of PREVIEW_FILES) {
        if (disposed) return;
        if (retained.has(src) || [...visibleFiles.values()].some((group) => group.has(src))) continue;
        const preview = new window.Image();
        preview.decoding = "async";
        preview.fetchPriority = "low";
        retained.set(src, preview);
        preview.src = src;
        await preview.decode().catch(() => undefined);
      }
    }
    const start = () => { void warmImages(); };
    const idle = "requestIdleCallback" in window
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : undefined;
    const timer = idle === undefined ? window.setTimeout(start, 150) : undefined;
    return () => {
      disposed = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      retained.clear();
    };
  }, [preloadReady]);

  return (
    <section id="examples" className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Compare grayscale and two-color results on real pages</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Converted directly with this tool. Compare threshold 128 vs. 190 on the scanned note to see where faint strokes return and where edge shadows darken.
        </p>
      </div>
      <div role="tablist" aria-label="Sample document type" className="mt-6 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((item) => (
          <button
            key={item.id}
            id={`sample-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={selected === item.id}
            aria-controls={`sample-panel-${item.id}`}
            onClick={() => setSelected(item.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selected === item.id
                ? "border-amber-400/60 bg-amber-400/10 text-amber-400"
                : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {EXAMPLES.map((example) => {
        const active = selected === example.id;
        const panels = panelsFor(example.id);
        return (
          <div
            key={example.id}
            id={`sample-panel-${example.id}`}
            role="tabpanel"
            aria-labelledby={`sample-tab-${example.id}`}
            hidden={!active}
            className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-neutral-100">{example.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400">{example.description}</p>
            <div className={`mt-5 grid gap-4 ${example.id === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
              {panels.map(({ label, file, detail }) => (
                <figure key={label} className="min-w-0">
                  <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-1 text-sm">
                    <span className="font-medium text-neutral-200">{label}</span>
                    <span className="text-xs text-neutral-500">{detail}</span>
                  </figcaption>
                  <div className="overflow-hidden rounded-lg border border-neutral-700 bg-white">
                    <Image
                      src={previewSrc(file, example.id)}
                      alt={`${example.label}: ${label.toLowerCase()} PDF output`}
                      width={720}
                      height={614}
                      sizes={example.id === 4 ? "(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 23vw" : "(max-width: 639px) 90vw, 30vw"}
                      unoptimized
                      loading={active ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={(event) => markLoaded(example.id, new URL(event.currentTarget.currentSrc).pathname)}
                      className="h-auto w-full"
                    />
                  </div>
                </figure>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
              <p className="max-w-lg text-xs leading-relaxed text-neutral-500">{example.note}</p>
              <button
                type="button"
                onClick={() => onTrySample(example.id)}
                className="rounded-lg border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400/10"
              >
                Try this sample PDF ↑
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
