"use client";
import { useState } from "react";
import { DeskewExamples } from "./deskew-examples";
import { DeskewConverter } from "./deskew-converter";

export function DeskewWorkspace() {
  const [sample, setSample] = useState<{ url: string; name: string; id: number } | null>(null);
  function open(name: string) {
    setSample({ url: `/examples/deskew/${name}`, name, id: Date.now() });
    document.querySelector("#deskew-workspace")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }
  return (
    <>
      <div className="mb-5 px-6 text-center">
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center px-3 py-2 text-sm text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400"
          onClick={() => open("tilted-invoice.pdf")}
        >
          Try a tilted invoice sample
        </button>
      </div>
      <div id="deskew-workspace" className="scroll-mt-6">
        <DeskewConverter sample={sample} />
      </div>
      <DeskewExamples onSample={open} />
    </>
  );
}
