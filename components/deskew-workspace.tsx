"use client";
import { useState } from "react";
import { DeskewExamples } from "./deskew-examples";
import { DeskewConverter } from "./deskew-converter";
export function DeskewWorkspace() {
  const [sample, setSample] = useState<{ url: string; name: string; id: number } | null>(null);
  return <><div className="mb-5 px-6 text-center"><button type="button" className="text-sm text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400" onClick={() => setSample({ url: "/examples/deskew/tilted-invoice.pdf", name: "tilted-invoice.pdf", id: Date.now() })}>Try a tilted invoice sample</button></div><div id="deskew-workspace" className="scroll-mt-6"><DeskewConverter sample={sample} /></div><DeskewExamples onSample={(name) => { setSample({ url: `/examples/deskew/${name}`, name, id: Date.now() }); document.querySelector("#deskew-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} /></>;
}
