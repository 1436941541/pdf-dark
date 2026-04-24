"use client";

import { useCallback, useState } from "react";

export function DropZone() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);

  const onFile = useCallback((file: File | null | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please drop a PDF file.");
      return;
    }
    setFileName(file.name);
    // TODO: hand off to the PDF renderer (next step)
  }, []);

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
        onFile(e.dataTransfer.files?.[0]);
      }}
      className={`mx-auto max-w-xl rounded-2xl border-2 border-dashed p-10 transition-colors
        ${isOver ? "border-amber-400 bg-amber-500/5" : "border-neutral-700 bg-neutral-900/40"}
      `}
    >
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="text-5xl mb-3">📄</div>
        <div className="text-lg font-medium">
          {fileName ? fileName : "Drop your PDF here or click to browse"}
        </div>
        <div className="text-sm text-neutral-500 mt-2">
          {fileName
            ? "Renderer coming in the next build step"
            : "Up to 50 MB · Never leaves your browser"}
        </div>
      </label>
    </div>
  );
}
