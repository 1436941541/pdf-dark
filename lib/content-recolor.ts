// Object-level dark mode: rewrites a page's content stream so text and
// vector graphics change color while staying real PDF objects — selectable,
// razor-sharp at any zoom, original file size. Images are untouched by
// design (color operators don't affect image pixels; image *masks* paint in
// the current fill color, so scanned-text masks flip to light automatically).
//
// Strategy: tokenize the content stream, rewrite every color operator we
// fully understand, and emit everything else verbatim. All rewritten colors
// are emitted as plain `rg`/`RG` (always legal, resets the color space to
// DeviceRGB) — this sidesteps the entire "what space is `sc` in right now"
// state problem, because we never re-emit space-relative operators.
//
// HEALTH CHECK ("认不得就回退"): the moment we meet anything we can't
// confidently recolor, the whole page is rejected (returns false) and the
// caller falls back to the raster pipeline for that page. Rejection causes:
// - color spaces we can't resolve to gray/RGB/CMYK (Indexed, Separation,
//   DeviceN, Lab, Pattern)
// - `scn`/`SCN` with a pattern name operand
// - `sh` shading (gradients would stay light on a dark page)
// - inline images (`BI ... EI` binary data is hazardous to re-slice)
// - content streams we fail to decode or tokenize
// Not rewritten by design (accepted): annotation appearance streams (link
// borders, form widgets) and Type3 d1 glyphs.

import type {
  PDFDocument,
  PDFDict,
  PDFContext,
  PDFRawStream as PDFRawStreamType,
} from "pdf-lib";
import { effectiveThemeBg, mapColor } from "./dark-color";
import type { ThemeId } from "./themes";

/** Ops whose operands are colors we rewrite. value = operand count. */
const COLOR_OPS: Record<string, number> = {
  g: 1, G: 1, rg: 3, RG: 3, k: 4, K: 4,
};

const WHITESPACE = new Set([" ", "\t", "\r", "\n", "\f", "\0"]);
const DELIMS = new Set(["(", ")", "<", ">", "[", "]", "{", "}", "/", "%"]);

type Tok = {
  type: "num" | "name" | "op" | "other";
  start: number;
  end: number;
  num?: number;
  name?: string; // decoded, without leading slash
};

class HealthCheckFail extends Error {}

/** Uint8Array → latin1 string (byte-preserving) and back. */
function bytesToLatin1(bytes: Uint8Array): string {
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return s;
}
function latin1ToBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

/** PDF name decoding: /A#20B → "A B". */
function decodeName(raw: string): string {
  return raw.replace(/#([0-9a-fA-F]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)),
  );
}

function fmt(n: number): string {
  const v = Math.round(n * 10000) / 10000;
  return String(v);
}

/** 0-255 RGB triple → "r g b" with components in 0-1. */
function rgbOperands(rgb: [number, number, number]): string {
  return `${fmt(rgb[0] / 255)} ${fmt(rgb[1] / 255)} ${fmt(rgb[2] / 255)}`;
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  return [255 * (1 - c) * (1 - k), 255 * (1 - m) * (1 - k), 255 * (1 - y) * (1 - k)];
}

// ---------------------------------------------------------------------------
// Tokenizer helpers — each returns the index just past the construct.

function skipString(s: string, i: number): number {
  // assumes s[i] === "(" ; returns index after the closing ")"
  let depth = 1;
  i++;
  while (i < s.length && depth > 0) {
    const c = s[i];
    if (c === "\\") i += 2;
    else if (c === "(") { depth++; i++; }
    else if (c === ")") { depth--; i++; }
    else i++;
  }
  return i;
}

function skipHexOrDict(s: string, i: number): number {
  // assumes s[i] === "<". "<<" opens a dict, "<hex>" a hex string.
  if (s[i + 1] === "<") {
    let depth = 1;
    i += 2;
    while (i < s.length && depth > 0) {
      const c = s[i];
      if (c === "(") i = skipString(s, i);
      else if (c === "<" && s[i + 1] === "<") { depth++; i += 2; }
      else if (c === ">" && s[i + 1] === ">") { depth--; i += 2; }
      else i++;
    }
    return i;
  }
  while (i < s.length && s[i] !== ">") i++;
  return i + 1;
}

function skipArray(s: string, i: number): number {
  // assumes s[i] === "["
  let depth = 1;
  i++;
  while (i < s.length && depth > 0) {
    const c = s[i];
    if (c === "(") i = skipString(s, i);
    else if (c === "<") i = skipHexOrDict(s, i);
    else if (c === "[") { depth++; i++; }
    else if (c === "]") { depth--; i++; }
    else i++;
  }
  return i;
}

function nextToken(s: string, i: number): Tok | null {
  // skip whitespace and comments
  for (;;) {
    while (i < s.length && WHITESPACE.has(s[i])) i++;
    if (s[i] === "%") {
      while (i < s.length && s[i] !== "\n" && s[i] !== "\r") i++;
      continue;
    }
    break;
  }
  if (i >= s.length) return null;
  const start = i;
  const c = s[i];

  if (c === "(") return { type: "other", start, end: skipString(s, i) };
  if (c === "<") return { type: "other", start, end: skipHexOrDict(s, i) };
  if (c === "[") return { type: "other", start, end: skipArray(s, i) };
  if (c === "]" || c === "}" || c === "{" || c === ")" || c === ">")
    return { type: "other", start, end: i + 1 };
  if (c === "/") {
    i++;
    while (i < s.length && !WHITESPACE.has(s[i]) && !DELIMS.has(s[i])) i++;
    return { type: "name", start, end: i, name: decodeName(s.slice(start + 1, i)) };
  }
  if (/[0-9+\-.]/.test(c)) {
    i++;
    while (i < s.length && /[0-9.]/.test(s[i])) i++;
    const num = parseFloat(s.slice(start, i));
    return { type: "num", start, end: i, num: Number.isFinite(num) ? num : 0 };
  }
  // operator / keyword: run of regular characters
  i++;
  while (i < s.length && !WHITESPACE.has(s[i]) && !DELIMS.has(s[i])) i++;
  const word = s.slice(start, i);
  if (word === "true" || word === "false" || word === "null")
    return { type: "other", start, end: i };
  return { type: "op", start, end: i, name: word };
}

// ---------------------------------------------------------------------------
// Color-space family resolution (only used to *validate*; we never re-emit
// space-relative operators, so the family is just "how many operands and how
// to read them").

type Family = 1 | 3 | 4;

function resolveFamily(
  csName: string,
  resources: PDFDict | null,
  ctx: PDFContext,
  pdfLib: PdfLibNs,
): Family | null {
  if (csName === "DeviceRGB") return 3;
  if (csName === "DeviceGray" || csName === "G") return 1;
  if (csName === "DeviceCMYK") return 4;
  if (csName === "Pattern") return null;
  if (!resources) return null;
  try {
    const { PDFName, PDFArray, PDFDict: Dict } = pdfLib;
    const csDict = ctx.lookupMaybe(resources.get(PDFName.of("ColorSpace")), Dict);
    if (!csDict) return null;
    const entry = ctx.lookup(csDict.get(PDFName.of(csName)));
    if (entry instanceof PDFName) return resolveFamily(entry.decodeText(), null, ctx, pdfLib);
    if (entry instanceof PDFArray) {
      const head = ctx.lookup(entry.get(0));
      const headName = head instanceof PDFName ? head.decodeText() : "";
      if (headName === "ICCBased") {
        const stream = ctx.lookup(entry.get(1)) as { dict?: PDFDict };
        const n = stream?.dict?.get(PDFName.of("N"));
        const nv = (n as { numberValue?: number })?.numberValue;
        if (nv === 1 || nv === 3 || nv === 4) return nv as Family;
        return null;
      }
      if (headName === "CalRGB") return 3;
      if (headName === "CalGray") return 1;
      // Indexed / Separation / DeviceN / Lab / Pattern → can't safely recolor
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------

type PdfLibNs = typeof import("pdf-lib");

type RewriteCtx = {
  theme: ThemeId;
  /** Darkness slider value 0.5–1; 1 = the theme as designed. */
  darkness: number;
  /** Warmth slider value 0–1; 0 = no color-temperature shift. */
  warmth: number;
  ctx: PDFContext;
  pdfLib: PdfLibNs;
  /** form ref tag → rewrite succeeded (memo; a failed form fails its pages) */
  formsDone: Map<string, boolean>;
  depth: number;
};

/**
 * Rewrites one content stream (latin1 string). Throws HealthCheckFail when
 * anything non-whitelisted shows up.
 */
function rewriteStream(src: string, resources: PDFDict | null, rc: RewriteCtx): string {
  const out: string[] = [];
  let pending: Tok[] = [];
  let pendingStart = -1;
  // Family of the space set by cs/CS, tracked with q/Q. Shortcut ops (g/rg/k)
  // also set it — per the ORIGINAL stream's semantics, which is what later
  // sc/scn operand counts are written against.
  let fillFam: Family | null = null;
  let strokeFam: Family | null = null;
  const famStack: Array<[Family | null, Family | null]> = [];

  const takeNums = (n: number): number[] => {
    if (pending.length < n) throw new HealthCheckFail("missing operands");
    const ops = pending.slice(-n);
    return ops.map((t) => {
      if (t.type !== "num") throw new HealthCheckFail("non-numeric color operand");
      return Math.min(1, Math.max(0, t.num!));
    });
  };
  const emitMapped = (rgb255: [number, number, number], stroke: boolean) => {
    out.push(` ${rgbOperands(mapColor(rgb255[0], rgb255[1], rgb255[2], rc.theme, rc.darkness, rc.warmth))} ${stroke ? "RG" : "rg"}\n`);
  };

  let i = 0;
  for (;;) {
    const tok = nextToken(src, i);
    if (!tok) break;
    i = tok.end;

    if (tok.type !== "op") {
      if (pending.length === 0) pendingStart = tok.start;
      pending.push(tok);
      continue;
    }

    const op = tok.name!;
    const flushVerbatim = () => {
      out.push(" " + src.slice(pending.length ? pendingStart : tok.start, tok.end));
      pending = [];
    };

    if (op in COLOR_OPS) {
      const n = COLOR_OPS[op];
      const stroke = op === op.toUpperCase();
      const v = takeNums(n);
      if (n === 1) {
        emitMapped([v[0] * 255, v[0] * 255, v[0] * 255], stroke);
        if (stroke) strokeFam = 1; else fillFam = 1;
      } else if (n === 3) {
        emitMapped([v[0] * 255, v[1] * 255, v[2] * 255], stroke);
        if (stroke) strokeFam = 3; else fillFam = 3;
      } else {
        emitMapped(cmykToRgb(v[0], v[1], v[2], v[3]), stroke);
        if (stroke) strokeFam = 4; else fillFam = 4;
      }
      pending = [];
    } else if (op === "cs" || op === "CS") {
      const nameTok = pending[pending.length - 1];
      if (!nameTok || nameTok.type !== "name") throw new HealthCheckFail("cs without name");
      const fam = resolveFamily(nameTok.name!, resources, rc.ctx, rc.pdfLib);
      if (fam === null) throw new HealthCheckFail(`colorspace ${nameTok.name}`);
      if (op === "cs") fillFam = fam; else strokeFam = fam;
      flushVerbatim(); // keep the cs op itself; harmless once sc is rewritten
    } else if (op === "sc" || op === "SC" || op === "scn" || op === "SCN") {
      if (pending.some((t) => t.type === "name"))
        throw new HealthCheckFail("pattern fill"); // scn /P1
      const stroke = op === "SC" || op === "SCN";
      const fam = stroke ? strokeFam : fillFam;
      if (fam === null) throw new HealthCheckFail("sc with unknown space");
      const v = takeNums(fam);
      if (fam === 1) emitMapped([v[0] * 255, v[0] * 255, v[0] * 255], stroke);
      else if (fam === 3) emitMapped([v[0] * 255, v[1] * 255, v[2] * 255], stroke);
      else emitMapped(cmykToRgb(v[0], v[1], v[2], v[3]), stroke);
      pending = [];
    } else if (op === "sh") {
      throw new HealthCheckFail("shading");
    } else if (op === "BI") {
      throw new HealthCheckFail("inline image");
    } else if (op === "q") {
      famStack.push([fillFam, strokeFam]);
      flushVerbatim();
    } else if (op === "Q") {
      const popped = famStack.pop();
      if (popped) [fillFam, strokeFam] = popped;
      flushVerbatim();
    } else if (op === "Do") {
      const nameTok = pending[pending.length - 1];
      if (nameTok?.type === "name") maybeRecolorForm(nameTok.name!, resources, rc);
      flushVerbatim();
    } else {
      flushVerbatim();
    }
  }
  if (pending.length) out.push(" " + src.slice(pendingStart));
  return out.join("");
}

/** If /name resolves to a Form XObject, recolor its stream in place (memoized). */
function maybeRecolorForm(name: string, resources: PDFDict | null, rc: RewriteCtx): void {
  if (!resources) return;
  const { PDFName, PDFDict: Dict, PDFRef: Ref, PDFRawStream, decodePDFRawStream } = rc.pdfLib;
  const xobjs = rc.ctx.lookupMaybe(resources.get(PDFName.of("XObject")), Dict);
  if (!xobjs) return;
  const ref = xobjs.get(PDFName.of(name));
  if (!(ref instanceof Ref)) return; // streams are always indirect
  const stream = rc.ctx.lookup(ref);
  if (!(stream instanceof PDFRawStream)) return;
  const subtype = stream.dict.get(PDFName.of("Subtype"));
  if (subtype !== PDFName.of("Form")) return; // images: nothing to do

  const done = rc.formsDone.get(ref.toString());
  if (done === true) return;
  if (done === false) throw new HealthCheckFail("form failed earlier");
  if (rc.depth > 8) throw new HealthCheckFail("form nesting too deep");

  try {
    const bytes = decodePDFRawStream(stream).decode();
    const formRes =
      rc.ctx.lookupMaybe(stream.dict.get(PDFName.of("Resources")), Dict) ?? resources;
    const rewritten = rewriteStream(bytesToLatin1(bytes), formRes, {
      ...rc,
      depth: rc.depth + 1,
    });
    const newStream = rc.ctx.flateStream(latin1ToBytes(rewritten));
    for (const [k, v] of stream.dict.entries()) {
      const key = k.decodeText();
      if (key !== "Filter" && key !== "DecodeParms" && key !== "Length") {
        newStream.dict.set(k, v);
      }
    }
    rc.ctx.assign(ref, newStream);
    rc.formsDone.set(ref.toString(), true);
  } catch (e) {
    rc.formsDone.set(ref.toString(), false);
    throw e instanceof HealthCheckFail ? e : new HealthCheckFail("form decode");
  }
}

/**
 * Recolors one page of a loaded pdf-lib document in place.
 * Returns true on success; false = caller must raster-fallback this page.
 * (Note: forms shared with other pages may already be rewritten even when
 * this page later fails — harmless, fallback pages don't use vector content.)
 */
export async function recolorPageInPlace(
  doc: PDFDocument,
  pageIndex: number,
  theme: ThemeId,
  formsDone: Map<string, boolean>,
  darkness = 1,
  warmth = 0,
): Promise<boolean> {
  const pdfLib = await import("pdf-lib");
  const { PDFName, PDFArray, PDFDict: Dict, PDFRawStream, decodePDFRawStream } = pdfLib;
  try {
    const page = doc.getPage(pageIndex);
    const ctx = doc.context;
    const contentsRaw = page.node.get(PDFName.of("Contents"));
    if (!contentsRaw) return false;
    const contents = ctx.lookup(contentsRaw);

    const streams: PDFRawStreamType[] = [];
    if (contents instanceof PDFRawStream) streams.push(contents);
    else if (contents instanceof PDFArray) {
      for (let k = 0; k < contents.size(); k++) {
        const s = ctx.lookup(contents.get(k));
        if (!(s instanceof PDFRawStream)) return false;
        streams.push(s);
      }
    } else return false;

    // Streams of one page concatenate; the spec guarantees token boundaries
    // at stream joints, so joining with a newline is safe.
    const src = streams.map((s) => bytesToLatin1(decodePDFRawStream(s).decode())).join("\n");

    const resources = ctx.lookupMaybe(page.node.get(PDFName.of("Resources")), Dict) ?? null;
    const rewritten = rewriteStream(src, resources, {
      theme,
      darkness,
      warmth,
      ctx,
      pdfLib,
      formsDone,
      depth: 0,
    });

    // Dark page background + remapped defaults (streams that never set a
    // color rely on the spec default of black — which now must render white).
    const bg = effectiveThemeBg(theme, darkness, warmth);
    const mb = page.getMediaBox();
    const white = rgbOperands(mapColor(0, 0, 0, theme, darkness, warmth));
    const head =
      `q ${fmt(bg.r / 255)} ${fmt(bg.g / 255)} ${fmt(bg.b / 255)} rg ` +
      `${fmt(mb.x)} ${fmt(mb.y)} ${fmt(mb.width)} ${fmt(mb.height)} re f Q\n` +
      `${white} rg ${white} RG\n`;

    const newStream = ctx.flateStream(latin1ToBytes(head + rewritten));
    page.node.set(PDFName.of("Contents"), ctx.register(newStream));
    return true;
  } catch (e) {
    if (!(e instanceof HealthCheckFail)) {
      console.warn("[pdf-dark] recolor unexpected error on page", pageIndex + 1, e);
    }
    return false;
  }
}
