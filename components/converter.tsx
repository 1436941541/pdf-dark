"use client";

import { useState } from "react";
import { DropZone } from "./drop-zone";
import { PdfViewer } from "./pdf-viewer";

export function Converter() {
  const [file, setFile] = useState<File | null>(null);

  if (!file) {
    return <DropZone onFile={setFile} />;
  }
  return <PdfViewer file={file} onReset={() => setFile(null)} />;
}
