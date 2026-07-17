// Assembles the downloadable dark PDF. Two modes, chosen per page:
//
// 1. OBJECT MODE (preferred): the original document is loaded with pdf-lib
//    and each page's content stream is recolored in place (see
//    content-recolor.ts). Text stays real vector text — selectable, sharp at
//    any zoom — images stay original bytes, outlines/links survive.
// 2. RASTER MODE (fallback): the page's content is replaced by the darkened
//    bitmap the viewer already rendered, plus native-resolution image
//    overlays and an invisible text layer. Used for scanned pages and pages
//    whose content the recolorer doesn't fully understand.
//
// If the document can't be loaded by pdf-lib at all (encryption, exotic
// structure), the whole file is built raster-only from scratch — the
// original always-works path.

import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import type { ThemeId } from "./themes";
import type { ImageRect } from "./image-regions";
import {
  classifyImage,
  imageDimAlpha,
  type ImageTreatment,
} from "./dark-color";
import { extractNativeImage } from "./native-image";
import { drawInvisibleTextLayer } from "./text-layer";
import { recolorPageInPlace } from "./content-recolor";

/** Canvas pixels per PDF unit in the viewer's render pass. */
export const RENDER_SCALE = 1.5;

export type PageRender = {
  /** Darkened page bitmap (JPEG dataUrl) at RENDER_SCALE. */
  displayDataUrl: string;
  width: number;
  height: number;
  imageRects: ImageRect[];
  scannedPage: boolean;
};

type NativeImageResult = Awaited<ReturnType<typeof extractNativeImage>>;

/** How raster images are treated on the dark pages:
 *  - "original": images (and full-page scans) stay exactly as in the source
 *  - "smart":    per-image classifier picks keep / dim / invert (see
 *                classifyImage in dark-color.ts)
 *  - "invert":   images go through the dark mapping like everything else */
export type ImageMode = "original" | "smart" | "invert";

/** Resolves what actually happens to one image under a mode. The single
 *  source of truth shared by preview (pdf-viewer) and both download paths. */
export function imageTreatment(mode: ImageMode, r: ImageRect): ImageTreatment {
  if (mode === "original") return "keep";
  if (mode === "invert") return "invert";
  return classifyImage(r.brightness, r.saturation);
}

function veilAlpha(mode: ImageMode, r: ImageRect): number {
  return imageTreatment(mode, r) === "dim" ? imageDimAlpha(r.brightness) : 0;
}

export async function buildDarkPdf(
  srcBytes: ArrayBuffer,
  pages: PageRender[],
  theme: ThemeId,
  imageMode: ImageMode,
  pdfProxy: PDFDocumentProxy | null,
): Promise<{ bytes: Uint8Array; objectPages: number; rasterPages: number }> {
  const pdfLib = await import("pdf-lib");

  // --- Try object mode on the original document -------------------------
  let doc: PDFDocument | null = null;
  const objectOk: boolean[] = pages.map(() => false);
  try {
    doc = await pdfLib.PDFDocument.load(srcBytes);
    if (doc.getPageCount() !== pages.length) doc = null;
  } catch {
    doc = null;
  }
  if (doc) {
    const formsDone = new Map<string, boolean>();
    for (let i = 0; i < pages.length; i++) {
      // Scanned pages carry their content as one huge image — recoloring
      // operators would change nothing; they need the raster pipeline. Pages
      // with an image slated for INVERSION (whole "invert" mode, or the Auto
      // classifier flagging a document-like figure) also go raster: object
      // mode never touches image pixels, so it can't invert them.
      if (pages[i].scannedPage) continue;
      if (pages[i].imageRects.some((r) => imageTreatment(imageMode, r) === "invert"))
        continue;
      objectOk[i] = await recolorPageInPlace(doc, i, theme, formsDone);
    }
  }

  if (!doc || !objectOk.some(Boolean)) {
    const bytes = await buildRasterOnly(pdfLib, pages, imageMode, pdfProxy);
    return { bytes, objectPages: 0, rasterPages: pages.length };
  }

  // --- Patch the failed pages with the raster rendering ------------------
  const { PDFName, degrees, rgb, StandardFonts } = pdfLib;
  const textFont = await doc.embedFont(StandardFonts.Helvetica);
  const nativeCache = new Map<string, NativeImageResult>();

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const page = doc.getPage(i);
    const rotated = page.getRotation().angle % 360 !== 0;

    let pageProxy = null;
    if (pdfProxy) {
      try {
        pageProxy = await pdfProxy.getPage(i + 1);
      } catch {
        pageProxy = null;
      }
    }

    if (objectOk[i]) {
      // Vector page: only add the night-friendly veil over photos, matching
      // what the preview shows. (Rect coords are in the rotated viewport
      // space — skip on rotated pages rather than misplace them.)
      if (!rotated) {
        const mb = page.getMediaBox();
        const k = mb.width / p.width;
        for (const r of p.imageRects) {
          const a = veilAlpha(imageMode, r);
          if (a <= 0.005) continue;
          page.drawRectangle({
            x: mb.x + r.x * k,
            y: mb.y + (p.height - r.y - r.h) * k,
            width: r.w * k,
            height: r.h * k,
            color: rgb(0, 0, 0),
            opacity: a,
          });
        }
      }
      continue;
    }

    // Raster fallback: wipe the original content, draw our darkened bitmap.
    page.node.set(PDFName.of("Contents"), doc.context.obj([]));
    if (rotated) {
      // The rendered bitmap is already upright; neutralize /Rotate so it
      // isn't rotated a second time by the viewer.
      page.setRotation(degrees(0));
      page.setSize(p.width / RENDER_SCALE, p.height / RENDER_SCALE);
    }
    const mb = page.getMediaBox();
    await drawRasterPage(doc, page, p, imageMode, pageProxy, textFont, nativeCache, {
      x: mb.x,
      y: mb.y,
      width: mb.width,
      height: mb.height,
    });
  }

  const bytes = await doc.save();
  const objectPages = objectOk.filter(Boolean).length;
  return { bytes, objectPages, rasterPages: pages.length - objectPages };
}

// ---------------------------------------------------------------------------

/**
 * Draws one raster page (dark bitmap + native image overlays + invisible
 * text layer) into `box` on a pdf-lib page. Shared by the per-page fallback
 * and the whole-file raster builder.
 */
async function drawRasterPage(
  doc: PDFDocument,
  page: PDFPage,
  p: PageRender,
  imageMode: ImageMode,
  pageProxy: Awaited<ReturnType<PDFDocumentProxy["getPage"]>> | null,
  textFont: PDFFont,
  nativeCache: Map<string, NativeImageResult>,
  box: { x: number; y: number; width: number; height: number },
): Promise<void> {
  const { rgb } = await import("pdf-lib");

  const res = await fetch(p.displayDataUrl);
  const jpgBytes = new Uint8Array(await res.arrayBuffer());
  const base = await doc.embedJpg(jpgBytes);
  page.drawImage(base, box);

  // Native-resolution image overlays (see native-image.ts). Images slated
  // for inversion are meant to be dark-mapped with the page, so the
  // already-inverted base bitmap is exactly what we want — no overlays.
  const k = box.width / p.width;
  const compositable = pageProxy
    ? p.imageRects.filter(
        (r) =>
          r.composite && r.objId && imageTreatment(imageMode, r) !== "invert",
      )
    : [];
  for (const r of compositable) {
    const cacheKey = r.objId!;
    let native = nativeCache.get(cacheKey);
    if (native === undefined) {
      native = await extractNativeImage(pageProxy!, cacheKey, r.w, r.h);
      nativeCache.set(cacheKey, native);
    }
    if (!native) continue;
    try {
      const img =
        native.format === "png"
          ? await doc.embedPng(native.bytes)
          : await doc.embedJpg(native.bytes);
      const rect = {
        x: box.x + r.x * k,
        y: box.y + (p.height - r.y - r.h) * k,
        width: r.w * k,
        height: r.h * k,
      };
      page.drawImage(img, rect);
      const a = veilAlpha(imageMode, r);
      if (a > 0.005) {
        page.drawRectangle({ ...rect, color: rgb(0, 0, 0), opacity: a });
      }
    } catch (err) {
      console.warn("[pdf-dark] native image embed failed", r.objId, err);
    }
  }

  // Invisible (searchable) text layer; skips rotated pages internally.
  if (pageProxy) {
    try {
      await drawInvisibleTextLayer(page, textFont, pageProxy);
    } catch (err) {
      console.warn("[pdf-dark] text layer failed", err);
    }
  }
}

/** The original always-works path: a fresh document built purely from the
 *  rendered bitmaps (used when pdf-lib can't load the source at all). */
async function buildRasterOnly(
  pdfLib: typeof import("pdf-lib"),
  pages: PageRender[],
  imageMode: ImageMode,
  pdfProxy: PDFDocumentProxy | null,
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = pdfLib;
  const doc = await PDFDocument.create();
  const textFont = await doc.embedFont(StandardFonts.Helvetica);
  const nativeCache = new Map<string, NativeImageResult>();

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const page = doc.addPage([p.width, p.height]);
    let pageProxy = null;
    if (pdfProxy) {
      try {
        pageProxy = await pdfProxy.getPage(i + 1);
      } catch {
        pageProxy = null;
      }
    }
    await drawRasterPage(doc, page, p, imageMode, pageProxy, textFont, nativeCache, {
      x: 0,
      y: 0,
      width: p.width,
      height: p.height,
    });
  }
  return doc.save();
}
