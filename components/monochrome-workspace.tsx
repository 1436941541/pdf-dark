"use client";

import { useState } from "react";
import { MonochromeConverter } from "./monochrome-converter";
import { MonochromeExamples } from "./monochrome-examples";

export function MonochromeWorkspace() {
  const [sample, setSample] = useState<{ url: string; name: string; id: number } | null>(null);
  return <>
    <div id="conversion-tool" className="mx-auto max-w-5xl px-6 pb-14"><MonochromeConverter sample={sample} /></div>
    <MonochromeExamples onTrySample={(id) => {
      setSample({ url: `/examples/black-and-white/sample-${id}.pdf`, name: `example-${id}.pdf`, id: Date.now() });
      document.getElementById("conversion-tool")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }} />
  </>;
}
