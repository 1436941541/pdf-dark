export type BackgroundOutcome = "cleaned" | "photo_page" | "dark_page";
export type BackgroundSettings = {
  strength: number;
  preserveColors: boolean;
  /** Default true when omitted: auto-detect and keep full-page photos/covers untouched. */
  protectPhotos?: boolean;
};
export type CleanBackgroundResult = {
  pixels: Uint8ClampedArray<ArrayBufferLike>;
  outcome: BackgroundOutcome;
};
export type SimpleRect = { x: number; y: number; w: number; h: number };

const clamp = (v: number) => Math.max(0, Math.min(255, v));
const luminance = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

/** Independent paper-illumination estimate. Maximum filters remove dark strokes
 * from a small reference grid; smoothing and bilinear sampling avoid tile edges. */
function paperIndices(levels: Float32Array, width: number, height: number, radius: number) {
  const horizontal = new Int32Array(levels.length), result = new Int32Array(levels.length);
  const queue = new Int32Array(Math.max(width, height));
  for (let y = 0; y < height; y++) {
    let head = 0, tail = 0, right = 0;
    for (let x = 0; x < width; x++) {
      while (right <= Math.min(width - 1, x + radius)) {
        const index = y * width + right++;
        while (tail > head && levels[queue[tail - 1]] <= levels[index]) tail--;
        queue[tail++] = index;
      }
      while (queue[head] % width < x - radius) head++;
      horizontal[y * width + x] = queue[head];
    }
  }
  for (let x = 0; x < width; x++) {
    let head = 0, tail = 0, bottom = 0;
    for (let y = 0; y < height; y++) {
      while (bottom <= Math.min(height - 1, y + radius)) {
        const index = bottom++ * width + x;
        while (tail > head && levels[horizontal[queue[tail - 1]]] <= levels[horizontal[index]]) tail--;
        queue[tail++] = index;
      }
      while (Math.floor(queue[head] / width) < y - radius) head++;
      result[y * width + x] = horizontal[queue[head]];
    }
  }
  return result;
}
function smooth(source: Float32Array, width: number, height: number) {
  const horizontal = new Float32Array(source.length), result = new Float32Array(source.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let dx = -2; dx <= 2; dx++) sum += source[y * width + Math.max(0, Math.min(width - 1, x + dx))];
    horizontal[y * width + x] = sum / 5;
  }
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let dy = -2; dy <= 2; dy++) sum += horizontal[Math.max(0, Math.min(height - 1, y + dy)) * width + x];
    result[y * width + x] = sum / 5;
  }
  return result;
}

/** Whiten light scan paper while retaining continuous tones and auto-protecting
 * full-page photos or dark slides when protectPhotos !== false. */
export function cleanBackgroundWithMeta(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  settings: BackgroundSettings,
): CleanBackgroundResult {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 16000000 || data.length !== width * height * 4) throw new Error("Unsupported page image dimensions.");
  if (!Number.isFinite(settings.strength)) throw new Error("Invalid cleaning strength.");
  const strength = Math.max(0, Math.min(100, settings.strength)) / 100;
  if (!strength) return { pixels: data, outcome: "cleaned" };
  const scale = Math.min(1, 400 / Math.max(width, height));
  const gw = Math.max(1, Math.ceil(width * scale)), gh = Math.max(1, Math.ceil(height * scale));
  const levels = new Float32Array(gw * gh).fill(-1);
  const colors = [new Float32Array(levels.length), new Float32Array(levels.length), new Float32Array(levels.length)];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const offset = (y * width + x) * 4, alpha = data[offset + 3] / 255;
    const r = data[offset] * alpha + 255 * (1 - alpha), g = data[offset + 1] * alpha + 255 * (1 - alpha), b = data[offset + 2] * alpha + 255 * (1 - alpha);
    const index = Math.floor(y * gh / height) * gw + Math.floor(x * gw / width), level = luminance(r, g, b);
    if (level > levels[index]) { levels[index] = level; colors[0][index] = r; colors[1][index] = g; colors[2][index] = b; }
  }
  const histogram = new Uint32Array(256);
  for (const level of levels) histogram[Math.round(level)]++;
  let total = 0, bright = 255;
  for (let i = 0; i < 256; i++) { total += histogram[i]; if (total >= levels.length * 0.85) { bright = i; break; } }
  const global = [0, 0, 0]; let count = 0;
  for (let i = 0; i < levels.length; i++) if (Math.round(levels[i]) >= bright) { for (let c = 0; c < 3; c++) global[c] += colors[c][i]; count++; }
  for (let c = 0; c < 3; c++) global[c] /= Math.max(1, count);
  const paperLevel = luminance(global[0], global[1], global[2]);
  if (paperLevel < 90) return { pixels: data, outcome: "dark_page" };
  const indices = paperIndices(levels, gw, gh, Math.max(3, Math.round(Math.min(gw, gh) * 0.04)));

  if (settings.protectPhotos !== false) {
    let bgNonPaper = 0;
    const rawBgLum = new Float32Array(levels.length);
    for (let i = 0; i < levels.length; i++) {
      const idx = indices[i];
      const t0 = colors[0][idx] / Math.max(1, global[0]);
      const t1 = colors[1][idx] / Math.max(1, global[1]);
      const t2 = colors[2][idx] / Math.max(1, global[2]);
      const nonPaper = Math.max(t0, t1, t2) - Math.min(t0, t1, t2) > 0.18 || levels[idx] < paperLevel * 0.72;
      if (nonPaper) bgNonPaper++;
      rawBgLum[i] = nonPaper ? paperLevel : levels[idx];
    }
    const step = Math.max(1, Math.floor(Math.max(width, height) / 300));
    let openPaper = 0, neutralMid = 0, colorful = 0, samples = 0;
    for (let y = 0; y < height; y += step) {
      const gy = Math.min(gh - 1, Math.floor(y * gh / height));
      for (let x = 0; x < width; x += step) {
        const gx = Math.min(gw - 1, Math.floor(x * gw / width));
        const offset = (y * width + x) * 4, alpha = data[offset + 3] / 255;
        const r = data[offset] * alpha + 255 * (1 - alpha);
        const g = data[offset + 1] * alpha + 255 * (1 - alpha);
        const b = data[offset + 2] * alpha + 255 * (1 - alpha);
        const lv = luminance(r, g, b);
        const ratio = lv / Math.max(1, rawBgLum[gy * gw + gx]);
        const gRatio = lv / Math.max(1, paperLevel);
        const rr = r / Math.max(1, global[0]), rg = g / Math.max(1, global[1]), rb = b / Math.max(1, global[2]);
        const ch = (Math.max(rr, rg, rb) - Math.min(rr, rg, rb)) / Math.max(0.1, rr, rg, rb);
        samples++;
        if (ratio >= 0.88 && gRatio >= 0.70 && ch <= 0.16) openPaper++;
        if (ratio >= 0.52 && ratio < 0.86 && ch <= 0.18) neutralMid++;
        if (ch > 0.18) colorful++;
      }
    }
    const op = openPaper / Math.max(1, samples);
    const nm = neutralMid / Math.max(1, samples);
    const cl = colorful / Math.max(1, samples);
    const bgBlock = bgNonPaper / Math.max(1, levels.length);
    if (op < 0.48 || nm >= 0.25 || bgBlock >= 0.38 || (cl >= 0.4 && op < 0.6)) {
      return { pixels: data, outcome: "photo_page" };
    }
  }

  const background = colors.map((color) => {
    const values = new Float32Array(levels.length);
    for (let i = 0; i < values.length; i++) values[i] = color[indices[i]];
    return smooth(values, gw, gh);
  });
  for (let y = 0; y < height; y++) {
    const sy = Math.min(gh - 1, y * gh / height), y0 = Math.floor(sy), y1 = Math.min(gh - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < width; x++) {
      const sx = Math.min(gw - 1, x * gw / width), x0 = Math.floor(sx), x1 = Math.min(gw - 1, x0 + 1), fx = sx - x0;
      const offset = (y * width + x) * 4, alpha = data[offset + 3] / 255;
      const pixel = [data[offset] * alpha + 255 * (1 - alpha), data[offset + 1] * alpha + 255 * (1 - alpha), data[offset + 2] * alpha + 255 * (1 - alpha)];
      const bg = background.map((channel) => (1 - fy) * ((1 - fx) * channel[y0 * gw + x0] + fx * channel[y0 * gw + x1]) + fy * ((1 - fx) * channel[y1 * gw + x0] + fx * channel[y1 * gw + x1]));
      const tint = bg.map((value, c) => value / Math.max(1, global[c]));
      if (Math.max(...tint) - Math.min(...tint) > 0.18 || luminance(bg[0], bg[1], bg[2]) < paperLevel * 0.6) for (let c = 0; c < 3; c++) bg[c] = global[c];
      const ratios = pixel.map((value, c) => value / Math.max(1, bg[c]));
      const ratio = luminance(pixel[0], pixel[1], pixel[2]) / Math.max(1, luminance(bg[0], bg[1], bg[2]));
      const chroma = (Math.max(...ratios) - Math.min(...ratios)) / Math.max(0.1, ...ratios);
      const protectedColor = settings.preserveColors && chroma > 0.18;
      const weight = protectedColor ? 0 : strength * Math.max(0, Math.min(1, (ratio - 0.5) / 0.35));
      for (let c = 0; c < 3; c++) {
        const normalized = clamp(255 - (1 - ratios[c]) * 255 * (1 + strength * 0.8));
        data[offset + c] = Math.round(clamp(pixel[c] + (normalized - pixel[c]) * weight));
      }
      data[offset + 3] = 255;
    }
  }
  return { pixels: data, outcome: "cleaned" };
}

export function cleanBackground(data: Uint8ClampedArray, width: number, height: number, settings: BackgroundSettings) {
  return cleanBackgroundWithMeta(data, width, height, settings).pixels;
}

/** Identify which embedded PDF image bounding boxes hold actual photos/illustrations
 * (vs light-gray scanned text/signature snippets that should be whitened with the page). */
export function filterPhotoRects<T extends SimpleRect>(
  original: Uint8ClampedArray,
  width: number,
  height: number,
  rects: readonly T[],
): T[] {
  const minArea = width * height * 0.003;
  const kept: T[] = [];
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
    const x1 = Math.min(width, Math.ceil(r.x + r.w)), y1 = Math.min(height, Math.ceil(r.y + r.h));
    const rw = x1 - x0, rh = y1 - y0;
    if (rw < 24 || rh < 24 || rw * rh < minArea) continue;
    const step = Math.max(1, Math.floor(Math.max(rw, rh) / 100));
    const hist = new Uint32Array(256);
    let sumLum = 0, samples = 0;
    for (let y = y0; y < y1; y += step) {
      for (let x = x0; x < x1; x += step) {
        const o = (y * width + x) * 4;
        const lv = luminance(original[o], original[o + 1], original[o + 2]);
        sumLum += lv;
        hist[Math.round(clamp(lv))]++;
        samples++;
      }
    }
    if (!samples) continue;
    let acc = 0, topLum = 255;
    for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= samples * 0.85) { topLum = i; break; } }
    if (topLum < 120 || sumLum / samples < 165) { kept.push(r); continue; }
    let open = 0, mid = 0, color = 0;
    for (let y = y0; y < y1; y += step) {
      for (let x = x0; x < x1; x += step) {
        const o = (y * width + x) * 4;
        const pr = original[o], pg = original[o + 1], pb = original[o + 2];
        const lv = luminance(pr, pg, pb);
        const mx = Math.max(pr, pg, pb), mn = Math.min(pr, pg, pb);
        const sat = (mx - mn) / Math.max(1, mx);
        const ratio = lv / Math.max(1, topLum);
        if (ratio >= 0.88 && sat <= 0.16) open++;
        if (ratio >= 0.52 && ratio < 0.86 && sat <= 0.18) mid++;
        if (sat > 0.2) color++;
      }
    }
    if (open / samples < 0.52 || mid / samples >= 0.22 || color / samples >= 0.28) {
      kept.push(r);
    }
  }
  return kept;
}

export function restorePhotoRects(
  target: Uint8ClampedArray,
  original: Uint8ClampedArray,
  width: number,
  height: number,
  rects: readonly SimpleRect[],
) {
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
    const x1 = Math.min(width, Math.ceil(r.x + r.w)), y1 = Math.min(height, Math.ceil(r.y + r.h));
    if (x1 <= x0 || y1 <= y0) continue;
    const rowLen = (x1 - x0) * 4;
    for (let y = y0; y < y1; y++) {
      const start = (y * width + x0) * 4;
      target.set(original.subarray(start, start + rowLen), start);
    }
  }
}
