/** Clockwise correction in canvas coordinates; positive source skew needs a negative correction. */
export type DeskewResult = {
  angle: number;
  status: "detected" | "straight" | "uncertain";
  reason: string;
};

const uncertain = (reason: string): DeskewResult => ({ angle: 0, status: "uncertain", reason });

/** Estimate small text-line skew on a downsampled scan (longest edge at most 700 px).
 * Large illustrations, rules and isolated speckles are excluded before projection scoring.
 * This is deliberately conservative: ambiguous pages keep their original angle.
 */
export function detectDeskew(data: Uint8ClampedArray, width: number, height: number): DeskewResult {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 16 || height < 16 ||
      width > 700 || height > 700 || data.length !== width * height * 4) {
    return uncertain("The page sample is unavailable or too large.");
  }
  const size = width * height;
  const levels = new Uint8Array(size);
  const histogram = new Uint32Array(256);
  for (let i = 0; i < size; i++) {
    const offset = i * 4;
    const alpha = data[offset + 3] / 255;
    const level = Math.round((0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]) * alpha + 255 * (1 - alpha));
    levels[i] = level;
    histogram[level]++;
  }
  let count = 0;
  let background = 255;
  for (let level = 0; level < 256; level++) {
    count += histogram[level];
    if (count >= size * 0.85) { background = level; break; }
  }
  const threshold = Math.max(40, Math.min(200, background - 40));
  const mask = new Uint8Array(size);
  let darkCount = 0;
  for (let i = 0; i < size; i++) if (levels[i] < threshold) { mask[i] = 1; darkCount++; }
  if (darkCount < 80) return uncertain("Not enough visible text to detect an angle.");
  if (darkCount > size * 0.35) return uncertain("This page is too dark or image-heavy for text-line detection.");

  const queue = new Int32Array(size);
  const points: number[] = [];
  let components = 0;
  const maxHeight = Math.max(12, height * 0.065);
  const maxWidth = Math.max(20, width * 0.09);
  const maxArea = Math.max(240, size * 0.002);
  for (let seed = 0; seed < size; seed++) {
    if (mask[seed] !== 1) continue;
    let head = 0, tail = 1;
    queue[0] = seed;
    mask[seed] = 2;
    let minX = width, maxX = 0, minY = height, maxY = 0;
    while (head < tail) {
      const pixel = queue[head++];
      const x = pixel % width, y = Math.floor(pixel / width);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      // Eight-neighbor connectivity keeps diagonal character strokes together.
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if ((dx === 0 && dy === 0) || x + dx < 0 || x + dx >= width || y + dy < 0 || y + dy >= height) continue;
        const next = pixel + dy * width + dx;
        if (mask[next] === 1) { mask[next] = 2; queue[tail++] = next; }
      }
    }
    const componentWidth = maxX - minX + 1, componentHeight = maxY - minY + 1;
    if (tail < 4 || tail > maxArea || componentWidth > maxWidth || componentHeight > maxHeight || componentHeight < 2) continue;
    components++;
    for (let i = 0; i < tail; i++) points.push(queue[i]);
  }
  if (components < 16 || points.length < 120) return uncertain("Not enough separate text characters to detect an angle.");
  // Deterministic bounded sampling keeps large scans responsive without changing the result between runs.
  const stride = Math.max(1, Math.ceil(points.length / 24000));
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < points.length; i += stride) {
    xs.push(points[i] % width - width / 2);
    ys.push(Math.floor(points[i] / width) - height / 2);
  }
  const span = Math.ceil(Math.hypot(width, height)) + 8;
  const profile = new Float64Array(span);
  const score = (angle: number): number => {
    profile.fill(0);
    const radians = angle * Math.PI / 180;
    const sin = Math.sin(radians), cos = Math.cos(radians);
    for (let i = 0; i < xs.length; i++) {
      const y = xs[i] * sin + ys[i] * cos + span / 2;
      const lower = Math.floor(y), fraction = y - lower;
      profile[lower] += 1 - fraction;
      profile[lower + 1] += fraction;
    }
    let value = 0;
    for (let i = 1; i < span - 1; i++) {
      const smoothed = profile[i - 1] + 2 * profile[i] + profile[i + 1];
      value += smoothed * smoothed;
    }
    return value;
  };
  const scores: { angle: number; value: number }[] = [];
  let bestAngle = 0, bestScore = -1;
  for (let step = -28; step <= 28; step++) {
    const angle = step / 4, value = score(angle);
    scores.push({ angle, value });
    if (value > bestScore) { bestScore = value; bestAngle = angle; }
  }
  const coarseAngle = bestAngle;
  for (let step = -5; step <= 5; step++) {
    const angle = coarseAngle + step * 0.05;
    if (Math.abs(angle) > 7) continue;
    const value = score(angle);
    if (value > bestScore) { bestScore = value; bestAngle = angle; }
  }
  if (Math.abs(bestAngle) >= 6.85) return uncertain("The angle may be outside the automatic detection range.");
  const alternative = Math.max(...scores.filter(({ angle }) => Math.abs(angle - bestAngle) >= 0.75).map(({ value }) => value));
  if (bestScore < alternative * 1.035) return uncertain("Text lines do not show a clear, consistent angle.");
  score(bestAngle);
  const peak = Math.max(...profile);
  let lines = 0, inLine = false;
  for (let i = 0; i < span; i++) {
    const active = profile[i] > peak * 0.25;
    if (active && !inLine) lines++;
    inLine = active;
  }
  if (lines < 3) return uncertain("At least three clear text lines are needed for automatic detection.");
  if (Math.abs(bestAngle) < 0.2) return { angle: 0, status: "straight", reason: "The text lines already appear straight." };
  if (bestScore < score(0) * 1.045) return uncertain("The estimated correction is too weak to apply automatically.");
  return { angle: Math.round(bestAngle * 10) / 10, status: "detected", reason: "A consistent angle was detected across the text lines." };
}
