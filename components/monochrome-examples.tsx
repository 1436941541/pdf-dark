"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const EXAMPLES = [
  { id: 2, label: "Color charts", title: "See what happens to color-coded charts", description: "Grayscale keeps differences in brightness. Pure black and white can turn several colors into the same black, or make a pale bar disappear." },
  { id: 3, label: "Photos", title: "Keep photo detail with grayscale", description: "Grayscale retains highlights and shadows. Two-color conversion creates a much starker image and loses some facial and clothing detail." },
  { id: 1, label: "Text documents", title: "A familiar white page, with black text", description: "Grayscale leaves an already monochrome document looking much the same. Pure black and white makes text edges harder; check small type and thin rules." },
  { id: 4, label: "Scanned pages", title: "Find the balance for faint scanned text", description: "A higher threshold recovers some faint text, but it can also turn paper shadows black. This simulated scan shows why checking the preview matters." },
] as const;

const BASE = "/examples/black-and-white";
const PREVIEW_FILES = EXAMPLES.flatMap(({ id }) => ["original", "gray", "bw128"].map((file) => `${BASE}/${file}-${id}.png`)).concat(`${BASE}/bw190-4.png`);

export function MonochromeExamples({ onTrySample }: { onTrySample: (id: number) => void }) {
  const [selected, setSelected] = useState<number>(2);
  const [threshold, setThreshold] = useState(128);
  const [preloadReady, setPreloadReady] = useState(false);
  const loadedGroups = useRef(new Map<number, Set<string>>());
  const decodedImages = useRef(new Map<string, HTMLImageElement>());

  function markLoaded(id: number, src: string) {
    if (!src.endsWith(`-${id}.png`)) return;
    const group = loadedGroups.current.get(id) ?? new Set<string>();
    group.add(src);
    loadedGroups.current.set(id, group);
    // Start only after a visible comparison has loaded all three images.
    if (group.size >= 3) setPreloadReady(true);
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
        // Keep decoded images alive, so switching tabs can reuse their bitmaps.
        // A failed speculative load must not affect the converter or other images.
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

  const example = EXAMPLES.find((item) => item.id === selected)!;
  const base = BASE;
  return (
    <section id="examples" className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-400">Real conversion examples</p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">See the difference before you convert</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">The same page, three ways. These examples come from PDFs converted with this tool.</p>
      </div>
      <div role="group" aria-label="Example document type" className="mt-6 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setThreshold(128); }} className={`rounded-full border px-4 py-2 text-sm transition-colors ${selected === item.id ? "border-amber-400/60 bg-amber-400/10 text-amber-400" : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-100"}`}>{item.label}</button>)}
      </div>
      <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-neutral-100">{example.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400">{example.description}</p>
        {selected === 4 && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-400"><span>Compare thresholds:</span>{[128, 190].map((value) => <button key={value} aria-pressed={threshold === value} onClick={() => setThreshold(value)} className={`rounded-lg border px-3 py-2 ${threshold === value ? "border-amber-400/60 text-amber-400" : "border-neutral-700 hover:text-neutral-100"}`}>{value}</button>)}</div>}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Original", file: "original", detail: "Before conversion" },
            { label: "Grayscale", file: "gray", detail: "Shades of gray" },
            { label: "Pure black & white", file: selected === 4 && threshold === 190 ? "bw190" : "bw128", detail: `Threshold ${selected === 4 ? threshold : 128}` },
          ].map(({ label, file, detail }) => <figure key={label} className="min-w-0"><figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-1 text-sm"><span className="font-medium text-neutral-200">{label}</span><span className="text-xs text-neutral-500">{detail}</span></figcaption><div className="overflow-hidden rounded-lg border border-neutral-700 bg-white"><Image src={`${base}/${file}-${selected}.png`} alt={`${example.label}: ${label.toLowerCase()} conversion example`} width={720} height={614} sizes="(max-width: 639px) 90vw, 30vw" unoptimized decoding="async" onLoad={(event) => markLoaded(selected, new URL(event.currentTarget.currentSrc).pathname)} className="h-auto w-full" /></div></figure>)}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
          <p className="max-w-lg text-xs leading-relaxed text-neutral-500">{selected === 3 ? <>Photo: Grace Hopper, U.S. Navy portrait, via the Pillow test collection. </> : selected === 4 ? "Illustrative scan with controlled faint text and paper shading. " : "Sample document created for this comparison. "}Your results depend on the original PDF.</p>
          <button onClick={() => onTrySample(selected)} className="rounded-lg border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400/10">Try this sample PDF ↑</button>
        </div>
      </div>
    </section>
  );
}
