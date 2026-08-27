"use client";

import { useCallback, useState } from "react";
import { T, type Locale } from "@/lib/i18n";

type Props = {
  onFile: (file: File) => void;
  locale?: Locale;
};

export function DropZone({ onFile, locale = "en" }: Props) {
  const [isOver, setIsOver] = useState(false);
  const t = T[locale].dropzone;

  const accept = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        alert(t.notPdf);
        return;
      }
      onFile(file);
    },
    [onFile, t.notPdf],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        accept(e.dataTransfer.files?.[0]);
      }}
      className={`group mx-auto max-w-xl rounded-2xl border-2 p-10 transition-all bg-neutral-900/90
        ${
          isOver
            ? "border-amber-400 bg-amber-500/5 scale-[1.01]"
            : "border-dashed border-neutral-700 hover:border-amber-400/60 hover:scale-[1.005]"
        }
      `}
    >
      <label className="block cursor-pointer text-center">
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
        />
        <div className="text-5xl mb-4 transition-transform group-hover:scale-110">📄</div>
        <div className="text-xl font-semibold text-neutral-50">
          {t.title}
        </div>
        <div className="text-sm text-neutral-300 mt-2">
          {t.subtitle}
        </div>
      </label>
    </div>
  );
}
