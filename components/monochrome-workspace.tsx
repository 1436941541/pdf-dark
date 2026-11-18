"use client";

import { useState } from "react";
import type { MonochromeMode } from "@/lib/monochrome";
import { MonochromeConverter } from "./monochrome-converter";
import { MonochromeExamples } from "./monochrome-examples";

export type MonochromeSampleSelection = {
  url: string;
  name: string;
  mode: MonochromeMode;
  id: number;
};

export function MonochromeWorkspace() {
  const [sample, setSample] = useState<MonochromeSampleSelection | null>(null);
  return (
    <>
      <div id="conversion-tool" className="mx-auto max-w-5xl px-6 pb-14">
        <MonochromeConverter sample={sample} />
      </div>
      <MonochromeExamples
        onTrySample={(id, mode) => {
          setSample({
            url: `/examples/black-and-white/sample-${id}.pdf`,
            name: `example-${id}.pdf`,
            mode,
            id: Date.now(),
          });
          document
            .getElementById("conversion-tool")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </>
  );
}
