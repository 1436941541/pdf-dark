// Pulls a decoded raster image out of pdf.js's object pool at native
// resolution and re-encodes it for embedding into the downloaded PDF.
//
// Why: the dark pipeline rasterizes each page at ~1.5x screen scale, so an
// embedded photo that is natively 1800px wide may survive as a 600px crop of
// the page bitmap — fine on screen, blurry in the saved file. For rects
// marked `composite` (axis-aligned, unmirrored, uncropped), the download
// path draws the darkened page first and then lays the *original* image data
// on top at its native resolution, exactly like the source PDF does.
//
// Every failure path returns null: the caller just skips the overlay and the
// raster-pasted version already baked into the dark page remains — degraded
// quality, never a broken document.

import type { PDFPageProxy } from "pdfjs-dist";

export type NativeImage = {
  bytes: Uint8Array;
  /** Alpha forces png; opaque images go jpeg to keep the file small. */
  format: "png" | "jpeg";
};

/** Re-encode at most this multiple of the placed size (in canvas px). Caps
 *  file-size blowup while keeping ~3x-zoom sharpness in the output. */
const NATIVE_UPSCALE_CAP = 2;

/** pdf.js ImageKind values (see shared/util.js). */
const KIND_RGB_24BPP = 2;
const KIND_RGBA_32BPP = 3;

/**
 * `objId` comes from the page's operator list; "g_"-prefixed ids live in the
 * document-wide pool, the rest in the per-page pool. Objects are guaranteed
 * resolved only after the page has rendered once (which the viewer does
 * before any download is possible).
 */
export async function extractNativeImage(
  page: PDFPageProxy,
  objId: string,
  placedW: number,
  placedH: number,
): Promise<NativeImage | null> {
  try {
    const pool = objId.startsWith("g_") ? page.commonObjs : page.objs;
    // PDFObjects.get throws on unresolved ids — caught below.
    const obj = pool.get(objId) as unknown;
    if (!obj) return null;

    // Decoded shapes seen across pdf.js builds: a bare ImageBitmap, or
    // { bitmap: ImageBitmap }, or { data, width, height, kind }.
    let source: ImageBitmap | null = null;
    let raw: {
      data: Uint8ClampedArray<ArrayBuffer>;
      width: number;
      height: number;
    } | null = null;

    if (typeof ImageBitmap !== "undefined" && obj instanceof ImageBitmap) {
      source = obj;
    } else if (typeof obj === "object") {
      const o = obj as {
        bitmap?: ImageBitmap;
        data?: Uint8ClampedArray | Uint8Array;
        width?: number;
        height?: number;
        kind?: number;
      };
      if (o.bitmap) {
        source = o.bitmap;
      } else if (o.data && o.width && o.height) {
        if (o.kind === KIND_RGBA_32BPP) {
          // Copy into a fresh buffer — pdf.js may hand us a view over a
          // shared/offset buffer that ImageData refuses.
          raw = {
            data: new Uint8ClampedArray(o.data),
            width: o.width,
            height: o.height,
          };
        } else if (o.kind === KIND_RGB_24BPP) {
          // Expand packed RGB to RGBA.
          const n = o.width * o.height;
          const rgba = new Uint8ClampedArray(n * 4);
          for (let i = 0, j = 0; i < n; i++, j += 3) {
            rgba[i * 4] = o.data[j];
            rgba[i * 4 + 1] = o.data[j + 1];
            rgba[i * 4 + 2] = o.data[j + 2];
            rgba[i * 4 + 3] = 255;
          }
          raw = { data: rgba, width: o.width, height: o.height };
        }
      }
    }
    if (!source && !raw) return null;

    const srcW = source ? source.width : raw!.width;
    const srcH = source ? source.height : raw!.height;
    if (!srcW || !srcH) return null;

    // Never upscale past native; never keep more pixels than the cap needs.
    const scale = Math.min(
      1,
      (placedW * NATIVE_UPSCALE_CAP) / srcW,
      (placedH * NATIVE_UPSCALE_CAP) / srcH,
    );
    const outW = Math.max(1, Math.round(srcW * scale));
    const outH = Math.max(1, Math.round(srcH * scale));

    const canvas = new OffscreenCanvas(outW, outH);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    if (source) {
      ctx.drawImage(source, 0, 0, outW, outH);
    } else {
      // Raw pixels can't be drawn scaled directly — stage them first.
      const stage = new OffscreenCanvas(srcW, srcH);
      const sctx = stage.getContext("2d");
      if (!sctx) return null;
      sctx.putImageData(new ImageData(raw!.data, srcW, srcH), 0, 0);
      ctx.drawImage(stage, 0, 0, outW, outH);
    }

    // Alpha probe (sampled): transparency needs png, opaque prefers jpeg.
    const px = ctx.getImageData(0, 0, outW, outH).data;
    let hasAlpha = false;
    for (let i = 3; i < px.length; i += 256) {
      if (px[i] < 255) {
        hasAlpha = true;
        break;
      }
    }

    const blob = await canvas.convertToBlob(
      hasAlpha ? { type: "image/png" } : { type: "image/jpeg", quality: 0.92 },
    );
    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      format: hasAlpha ? "png" : "jpeg",
    };
  } catch {
    return null;
  }
}
