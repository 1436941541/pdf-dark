// Extracts the canvas-space bounding boxes of raster images on a PDF page by
// walking pdf.js's operator list with a simulated graphics-state stack
// (transform + clip box). The dark pipeline uses these rects two ways:
// 1. The worker pastes the original rendered pixels back after darkening
//    (screen preview + base layer of the download).
// 2. The download path re-embeds images at native resolution on top of the
//    dark base (see lib/native-image.ts) — but only for rects marked
//    `composite`, i.e. axis-aligned, unmirrored, and not cropped by a clip
//    path. Everything else safely falls back to the raster paste.
//
// Deliberately skipped:
// - paintImageMaskXObject: stencil masks are how scanners encode *text*
//   glyphs (JBIG2 layer). Preserving them would keep scanned text light-on-
//   white and defeat the whole conversion.
// - transparency groups (beginGroup/endGroup): pdf.js composites them on a
//   separate canvas; images inside may get a slightly wrong bbox. Rare enough
//   that we accept the inaccuracy rather than reimplement group compositing.

import type { PDFPageProxy, PageViewport } from "pdfjs-dist";

export type ImageRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** pdf.js object id of the image ("g_"-prefixed ids live on the doc). Null for inline images. */
  objId: string | null;
  /** True when the download path may re-embed the native-resolution image at this rect. */
  composite: boolean;
  /** Average luminance (0-255) measured from the rendered page — drives the
   *  smart image dimmer (see imageDimAlpha in dark-color.ts). */
  brightness?: number;
  /** Average saturation (0-1) from the same sample — separates document-like
   *  figures (white, colorless) from photos for the Auto classifier. */
  saturation?: number;
  /** True when a curved clip (circle / rounded frame) tightly wraps this
   *  image — the raster paste then goes through an inscribed ellipse so the
   *  clipped-away corners don't resurrect the light page background. */
  rounded?: boolean;
};

/** 2D affine matrix [a, b, c, d, e, f] — same layout pdf.js uses. */
type Matrix = [number, number, number, number, number, number];
/** Device-space box [x0, y0, x1, y1]. */
type Box = [number, number, number, number];

/** Compose so that applying the result == applying m2 first, then m1. */
function mul(m1: Matrix, m2: Matrix): Matrix {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

function applyPoint(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** Device-space bbox of a user-space rectangle under matrix m. */
function bboxOfRect(m: Matrix, x0: number, y0: number, x1: number, y1: number): Box {
  const pts = [
    applyPoint(m, x0, y0),
    applyPoint(m, x1, y0),
    applyPoint(m, x0, y1),
    applyPoint(m, x1, y1),
  ];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function intersect(a: Box, b: Box): Box {
  return [
    Math.max(a[0], b[0]),
    Math.max(a[1], b[1]),
    Math.min(a[2], b[2]),
    Math.min(a[3], b[3]),
  ];
}

/** A page whose single biggest image covers this much of it is a scan. */
const SCANNED_PAGE_COVERAGE = 0.85;
/** Ignore specks (bullet icons etc.) — preserving them isn't worth the dim box. */
const MIN_RECT_PX = 12;
/** Safety cap: vector art built from thousands of image tiles. */
const MAX_RECTS = 128;
/** Tolerance (device px) when deciding whether a clip actually crops the image. */
const CLIP_EPS = 1.5;

export type PageImageScan = {
  rects: ImageRect[];
  /** True when one image covers ~the whole page — a scan. Scanned pages get
   *  no preserved rects AND must not take the object-recolor download path
   *  (recoloring operators wouldn't darken the pixels). */
  scanned: boolean;
};

/**
 * Returns the rects of raster images to preserve on this page, in canvas
 * pixels of `viewport`, plus the scanned-page verdict.
 */
export async function getPageImageRects(
  page: PDFPageProxy,
  viewport: PageViewport,
): Promise<PageImageScan> {
  // pdf.js is already loaded by the caller (pdf-viewer renders the page
  // first); this resolves from the module cache.
  const { OPS } = await import("pdfjs-dist");
  const opList = await page.getOperatorList();

  const cw = viewport.width;
  const ch = viewport.height;
  const base = viewport.transform as Matrix;
  const fullPage: Box = [0, 0, cw, ch];

  // Simulated graphics state. `clipBox` approximates the active clip region
  // by its device-space bbox; `clipUnknown` is set when a clip path came
  // without bounds info, in which case we can't trust clipBox anymore;
  // `clipCurved` remembers that the active clip contains bezier segments
  // (circles, rounded frames).
  type GState = { m: Matrix; clipBox: Box; clipUnknown: boolean; clipCurved: boolean };
  let st: GState = { m: [...base], clipBox: fullPage, clipUnknown: false, clipCurved: false };
  const stack: GState[] = [];

  // Clip handling: pdf.js always emits OPS.clip/eoClip BEFORE the
  // constructPath entry that carries the clip's path (the canvas layer works
  // through a pendingClip flag consumed by the path handler). So a clip op
  // only ever refers to the NEXT path — pairing it with a previously seen
  // path corrupts the clip box (that exact bug halved a resume avatar).
  let pendingClip = false;

  const applyClip = (pathBox: Box | null, curved: boolean) => {
    pendingClip = false;
    if (pathBox) {
      st.clipBox = intersect(st.clipBox, pathBox);
      st.clipCurved = st.clipCurved || curved;
    } else {
      st.clipUnknown = true;
    }
  };

  // pdf.js path payloads are flat arrays of DrawOPS codes + coords
  // (moveTo=0/2 args, lineTo=1/2, curveTo=2/6, quadraticCurveTo=3/4,
  // closePath=4/0). NOTE: after the page has RENDERED once, the canvas layer
  // replaces the array with a Path2D in place — which is why the caller must
  // run this scan BEFORE page.render().
  const ARGS_PER_OP: Record<number, number> = { 0: 2, 1: 2, 2: 6, 3: 4, 4: 0 };
  const pathHasCurves = (data: unknown): boolean => {
    if (!data || typeof (data as { length?: number }).length !== "number") return false;
    const arr = data as ArrayLike<number>;
    for (let i = 0; i < arr.length; ) {
      const code = arr[i++];
      if (code === 2 || code === 3) return true;
      const n = ARGS_PER_OP[code];
      if (n === undefined) return false; // unknown encoding — stop guessing
      i += n;
    }
    return false;
  };

  type RawRect = { box: Box; objId: string | null; composite: boolean; rounded: boolean };
  const raw: RawRect[] = [];

  const recordImage = (m: Matrix, objId: string | null) => {
    const box = bboxOfRect(m, 0, 0, 1, 1);
    const visible = intersect(box, st.clipBox);
    if (visible[2] - visible[0] <= 0 || visible[3] - visible[1] <= 0) return;
    // Native re-embedding is only safe when the placement is axis-aligned,
    // unmirrored, uncropped, and under a trustworthy clip state. Anything
    // else keeps the raster-paste fallback.
    const axisAligned =
      Math.abs(m[1]) < 1e-6 && Math.abs(m[2]) < 1e-6 && m[0] > 0 && m[3] < 0;
    // (d < 0 is the *normal* case in device space: viewport.transform flips
    //  the PDF y-axis, so an unmirrored image lands with negative d.)
    const uncropped =
      visible[0] - box[0] < CLIP_EPS &&
      visible[1] - box[1] < CLIP_EPS &&
      box[2] - visible[2] < CLIP_EPS &&
      box[3] - visible[3] < CLIP_EPS;
    // A curved clip whose bbox tightly wraps the image = circular/rounded
    // avatar frame. The bboxes coincide, so `uncropped` stays true — but the
    // CORNER pixels are cut, and a square paste would resurrect the light
    // background there. Mark it so the paste goes through an ellipse.
    const ROUND_EPS = 4;
    const rounded =
      st.clipCurved &&
      !st.clipUnknown &&
      st.clipBox[0] - box[0] > -ROUND_EPS &&
      st.clipBox[1] - box[1] > -ROUND_EPS &&
      box[2] - st.clipBox[2] > -ROUND_EPS &&
      box[3] - st.clipBox[3] > -ROUND_EPS;
    raw.push({
      box: visible,
      objId,
      rounded,
      composite:
        axisAligned && uncropped && !st.clipUnknown && !rounded && objId !== null,
    });
  };

  const { fnArray, argsArray } = opList;
  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i];
    switch (fn) {
      case OPS.save:
        stack.push({ m: [...st.m], clipBox: [...st.clipBox] as Box, clipUnknown: st.clipUnknown, clipCurved: st.clipCurved });
        break;
      case OPS.restore:
        st = stack.pop() ?? { m: [...base], clipBox: fullPage, clipUnknown: false, clipCurved: false };
        break;
      case OPS.transform:
        st.m = mul(st.m, args as Matrix);
        break;
      // Form XObjects behave like save + optional cm ... + restore.
      case OPS.paintFormXObjectBegin: {
        stack.push({ m: [...st.m], clipBox: [...st.clipBox] as Box, clipUnknown: st.clipUnknown, clipCurved: st.clipCurved });
        const m = (args as [Matrix | null, unknown[]])[0];
        if (m) st.m = mul(st.m, m);
        break;
      }
      case OPS.paintFormXObjectEnd:
        st = stack.pop() ?? { m: [...base], clipBox: fullPage, clipUnknown: false, clipCurved: false };
        break;
      case OPS.clip:
      case OPS.eoClip:
        // Always applies to the NEXT constructPath — see comment above.
        pendingClip = true;
        break;
      case OPS.constructPath: {
        // args: [paintOp, pathData, minMax?] — minMax is the path's bbox in
        // the *current user space* ([minX, minY, maxX, maxY]) or null.
        const a = args as [number, unknown[], number[] | null];
        if (pendingClip) {
          const minMax = a[2];
          const pathBox =
            minMax && minMax.length === 4
              ? bboxOfRect(st.m, minMax[0], minMax[1], minMax[2], minMax[3])
              : null;
          applyClip(pathBox, pathHasCurves(a[1]?.[0]));
        }
        break;
      }
      case OPS.paintImageXObject:
        recordImage(st.m, typeof args?.[0] === "string" ? (args[0] as string) : null);
        break;
      case OPS.paintInlineImageXObject:
        // Inline images carry their bytes in the op itself — no object pool
        // id, so no native re-embedding; raster paste still applies.
        recordImage(st.m, null);
        break;
      case OPS.paintImageXObjectRepeat: {
        // args: [objId, scaleX, scaleY, [x0, y0, x1, y1, ...]]
        const [objId, sx, sy, positions] = args as [string, number, number, number[]];
        for (let p = 0; p < positions.length; p += 2) {
          recordImage(mul(st.m, [sx, 0, 0, sy, positions[p], positions[p + 1]]), objId ?? null);
        }
        break;
      }
    }
  }

  // Clamp to canvas, drop specks and degenerate boxes.
  const clamped: ImageRect[] = [];
  for (const r of raw) {
    const x = Math.max(0, Math.floor(r.box[0]));
    const y = Math.max(0, Math.floor(r.box[1]));
    const w = Math.min(cw, Math.ceil(r.box[2])) - x;
    const h = Math.min(ch, Math.ceil(r.box[3])) - y;
    if (w >= MIN_RECT_PX && h >= MIN_RECT_PX) {
      clamped.push({ x, y, w, h, objId: r.objId, composite: r.composite });
    }
  }

  // Scanned-page heuristic: one image ≈ the whole page → preserve nothing.
  const pageArea = cw * ch;
  if (clamped.some((r) => r.w * r.h >= pageArea * SCANNED_PAGE_COVERAGE)) {
    return { rects: [], scanned: true };
  }

  if (clamped.length > MAX_RECTS) {
    clamped.sort((a, b) => b.w * b.h - a.w * a.h);
    clamped.length = MAX_RECTS;
  }
  return { rects: clamped, scanned: false };
}
