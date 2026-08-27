"use client";

import { useState } from "react";
import { DropZone } from "./drop-zone";
import { PdfViewer } from "./pdf-viewer";
import { ThemePreview } from "./theme-preview";
import type { Locale } from "@/lib/i18n";

export function Converter({ locale = "en" }: { locale?: Locale }) {
  const [file, setFile] = useState<File | null>(null);

  if (!file) {
    return (
      <>
        <DropZone onFile={setFile} locale={locale} />
        <ThemePreview locale={locale} />
      </>
    );
  }
  return <PdfViewer file={file} onReset={() => setFile(null)} locale={locale} />;
}
