"use client";

import { useCallback, useState } from "react";

type Props = {
  onFile: (file: File) => void;
};

const SOFT_SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB — advisory, not hard

export function DropZone({ onFile }: Props) {
  const [isOver, setIsOver] = useState(false);

  const accept = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        alert("Please drop a PDF file.");
        return;
      }
      if (file.size > SOFT_SIZE_LIMIT) {
        const mb = (file.size / 1024 / 1024).toFixed(0);
        const proceed = confirm(
          `This file is ${mb} MB — larger than we've tested (50 MB). ` +
            `It may be slow or crash your browser tab. Continue anyway?`,
        );
        if (!proceed) return;
      }
      onFile(file);
    },
    [onFile],
  );

  return (
    <div className="relative mx-auto max-w-xl">
      {/* warm glow behind the card */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[2rem] blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(245,196,81,0.35) 0%, transparent 70%)",
        }}
      />
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
        className={`group rounded-2xl border-2 p-10 transition-all bg-neutral-900/60 backdrop-blur
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
            Drop your PDF here or click to browse
          </div>
          <div className="text-sm text-neutral-300 mt-2">
            Up to 50 MB · Never leaves your browser
          </div>
        </label>
      </div>
    </div>
  );
}
