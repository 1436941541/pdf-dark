"use client";
import Image from "next/image";
import { useState } from "react";
import { BackgroundConverter } from "./background-converter";

const CASES = [
  {
    id: "gray",
    title: "Gray photocopy paper (RGB 220 to 243)",
    button: "Load gray-paper sample",
    text: "Lifts a gray scan sheet from RGB 220/220/220 to 243/243/243. Faint gray text strokes stay readable instead of getting clipped to harsh black-and-white.",
  },
  {
    id: "yellow",
    title: "Yellowed page with blue stamp and highlight",
    button: "Load yellow-paper sample",
    text: "Clears aged yellow paper tint toward white, keeping the blue APPROVED stamp and yellow highlighter band intact.",
  },
  {
    id: "shadow",
    title: "Uneven edge shadow",
    button: "Load shadow sample",
    text: "Tracks paper brightness across the page to even out dark binding or margin shadows without washing out nearby text.",
  },
];

export function BackgroundWorkspace() {
  const [sample, setSample] = useState<{ url: string; name: string; id: number } | null>(null);
  function open(id: string, scroll = true) {
    setSample({ url: `/examples/background-remover/${id}.pdf`, name: `${id}-paper.pdf`, id: Date.now() });
    if (scroll) {
      document.querySelector("#background-tool")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
  }
  return (
    <>
      <div className="mb-5 px-6 text-center">
        <button
          type="button"
          onClick={() => open("yellow", false)}
          className="inline-flex min-h-11 items-center justify-center px-3 py-2 text-sm text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400"
        >
          Try a stamped-scan sample
        </button>
      </div>
      <div id="background-tool" className="scroll-mt-6">
        <BackgroundConverter sample={sample} onAutoSample={() => open("yellow", false)} />
      </div>
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Before and after on scanned test pages</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-neutral-400">
          Rendered at the default 65% strength with color protection on. Click any sample to load the PDF into the workspace and test the slider yourself.
        </p>
        <div className="mt-7 space-y-6">
          {CASES.map((item, idx) => (
            <article key={item.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6">
              <h3 className="font-semibold text-neutral-100">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.text}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5">
                {(["before", "after"] as const).map((label) => (
                  <figure key={label} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                    <figcaption className="border-b border-neutral-800 px-3 py-2 text-xs capitalize text-neutral-400">
                      {label}
                    </figcaption>
                    <div className="flex h-52 items-center justify-center p-3 sm:h-72">
                      <Image
                        unoptimized
                        src={`/examples/background-remover/${item.id}-${label}.webp`}
                        alt={`${item.title} (${label})`}
                        width={600}
                        height={780}
                        loading={idx === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </figure>
                ))}
              </div>
              <button
                type="button"
                onClick={() => open(item.id)}
                className="mt-4 inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-left text-sm text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400"
              >
                {item.button}
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
