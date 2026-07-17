// Draws the source PDF's text as an *invisible* text layer on top of the
// rasterized dark page in the downloaded file — the same trick OCR'd scan
// PDFs use. The pixels the user sees stay untouched; selection, copy,
// Ctrl+F search and screen readers all work again because real text objects
// are back in the file.
//
// Mechanics: pdf.js getTextContent() hands us every text run with its exact
// placement matrix in PDF user space; we replay each run through pdf-lib
// with text rendering mode 3 ("neither fill nor stroke" — the canonical
// invisible-text mode, more reliable than alpha tricks across viewers).
//
// Known limits (accepted for v1):
// - Runs Helvetica can't encode (CJK etc.) are skipped item-by-item.
// - Rotated pages are skipped entirely (viewport rotation would need the
//   whole layer transformed; rare enough to punt).
// - Selection highlight geometry is approximate — Helvetica metrics differ
//   from the original font — but search/copy content is exact.

import type { PDFPageProxy } from "pdfjs-dist";
import type { PDFFont, PDFPage } from "pdf-lib";

type Matrix = [number, number, number, number, number, number];

function applyPoint(m: number[], x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/**
 * @param pdfPage  pdf-lib page being assembled (sized to the rendered canvas)
 * @param font     an embedded pdf-lib font (Helvetica)
 * @param pageProxy the source pdf.js page
 * @returns number of text runs written (0 = layer skipped or nothing to write)
 */
export async function drawInvisibleTextLayer(
  pdfPage: PDFPage,
  font: PDFFont,
  pageProxy: PDFPageProxy,
): Promise<number> {
  // Page-level /Rotate would require rotating every run; skip for now.
  if (((pageProxy.rotate ?? 0) % 360) + 360 !== 360) return 0;

  const { PDFOperator, PDFOperatorNames, PDFNumber, degrees } = await import(
    "pdf-lib"
  );

  const textContent = await pageProxy.getTextContent();

  // Map PDF user space → output-page space. The output page equals the
  // render canvas, so derive the scale from the page's unit-1 viewport
  // (this also absorbs any CropBox origin offset via vp.transform).
  const vp1 = pageProxy.getViewport({ scale: 1 });
  const scale = pdfPage.getWidth() / vp1.width;
  const vp = pageProxy.getViewport({ scale });
  const pageH = pdfPage.getHeight();

  const setTr = (mode: number) =>
    pdfPage.pushOperators(
      PDFOperator.of(PDFOperatorNames.SetTextRenderingMode, [
        PDFNumber.of(mode),
      ]),
    );

  let written = 0;
  setTr(3); // invisible from here on
  try {
    for (const item of textContent.items) {
      if (!("str" in item)) continue; // marked-content entries carry no text
      const str = item.str;
      if (!str || !str.trim()) continue;
      if (item.dir === "ttb") continue; // vertical scripts need a different layout

      const t = item.transform as Matrix;
      const size = Math.hypot(t[2], t[3]) * scale;
      if (!Number.isFinite(size) || size < 1) continue;

      const [dx, dy] = applyPoint(vp.transform, t[4], t[5]);
      const angle = Math.atan2(t[1], t[0]);

      try {
        pdfPage.drawText(str, {
          x: dx,
          y: pageH - dy, // device y is top-down, pdf-lib wants bottom-up
          size,
          font,
          ...(Math.abs(angle) > 0.001
            ? { rotate: degrees((angle * 180) / Math.PI) }
            : {}),
        });
        written++;
      } catch {
        // Helvetica can't encode this run (CJK, symbols…) — skip just it.
      }
    }
  } finally {
    setTr(0); // restore normal fill mode for anything drawn afterwards
  }
  return written;
}
