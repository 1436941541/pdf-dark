export type BackgroundSettings = { strength: number; preserveColors: boolean };
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

/** Whiten light scan paper while retaining continuous tones. Not OCR, object
 * deletion, transparency or a guarantee of preserving photos/faint handwriting. */
export function cleanBackground(data: Uint8ClampedArray, width: number, height: number, settings: BackgroundSettings) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 16000000 || data.length !== width * height * 4) throw new Error("Unsupported page image dimensions.");
  if (!Number.isFinite(settings.strength)) throw new Error("Invalid cleaning strength.");
  const strength = Math.max(0, Math.min(100, settings.strength)) / 100;
  if (!strength) return data;
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
  for (let i = 0; i < levels.length; i++) if (levels[i] >= bright) { for (let c = 0; c < 3; c++) global[c] += colors[c][i]; count++; }
  for (let c = 0; c < 3; c++) global[c] /= Math.max(1, count);
  const paperLevel = luminance(global[0], global[1], global[2]);
  if (paperLevel < 90) return data; // Do not reinterpret a dark PDF as light scan paper.
  const indices = paperIndices(levels, gw, gh, Math.max(3, Math.round(Math.min(gw, gh) * 0.04)));
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
  return data;
}
