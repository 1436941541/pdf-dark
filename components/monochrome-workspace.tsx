"use client";

import { useState } from "react";
import type { MonochromeMode } from "@/lib/monochrome";
import { MonochromeConverter } from "./monochrome-converter";
import { MonochromeExamples } from "./monochrome-examples";

export type MonochromeSampleSelection = {
  url: string;
  name: string;
  mode?: MonochromeMode;
  id: number;
};

const SAMPLE_NAMES: Record<number, string> = {
  3: "portrait-report-sample.pdf",
  4: "stamped-invoice-sample.pdf",
};

export function MonochromeWorkspace() {
  const [sample, setSample] = useState<MonochromeSampleSelection | null>(null);

  function openSample(id: number, mode?: MonochromeMode, scroll = true) {
    setSample({
      url: `/examples/black-and-white/sample-${id}.pdf`,
      name: SAMPLE_NAMES[id] ?? `example-${id}.pdf`,
      mode,
      id: Date.now(),
    });
    if (scroll) {
      document.getElementById("conversion-tool")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    }
  }

  return (
    <>
      <div className="mb-5 px-6 text-center">
        <button
          type="button"
          onClick={() => openSample(4, "black-and-white", false)}
          className="inline-flex min-h-11 items-center justify-center px-3 py-2 text-sm text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400"
        >
          Try a stamped-invoice sample
        </button>
      </div>
      <div id="conversion-tool" className="mx-auto max-w-5xl scroll-mt-6 px-6 pb-14">
        <MonochromeConverter
          sample={sample}
          onAutoSample={() => openSample(4, undefined, false)}
        />
      </div>
      <MonochromeExamples onTrySample={(id, mode) => openSample(id, mode, true)} />
    </>
  );
}
