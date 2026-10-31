// Engineering budgets for each render, not universal browser canvas limits.
export const PDF_RENDER_MAX_SIDE = 4096;
export const PDF_RENDER_MAX_PIXELS = 8_388_608;

/**
 * Limit raster resolution using a scale-1 PDF.js viewport. Its width and height
 * already include page rotation and UserUnit; applying one scale keeps the
 * entire page and its aspect ratio.
 */
export function getPdfRenderScale(
  width: number,
  height: number,
  preferredScale: number,
): number {
  if ([width, height, preferredScale].some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new RangeError("PDF render dimensions and scale must be positive finite numbers.");
  }

  const preferredWidth = width * preferredScale;
  const preferredHeight = height * preferredScale;
  // Check sides first so this area multiplication cannot overflow. Returning
  // directly also preserves the exact requested scale for pages already in budget.
  if (
    preferredWidth <= PDF_RENDER_MAX_SIDE &&
    preferredHeight <= PDF_RENDER_MAX_SIDE &&
    preferredWidth * preferredHeight <= PDF_RENDER_MAX_PIXELS
  ) {
    return preferredScale;
  }

  return Math.min(
    preferredScale,
    PDF_RENDER_MAX_SIDE / width,
    PDF_RENDER_MAX_SIDE / height,
    // Separate roots avoid overflowing width * height or underflowing a
    // sequential MAX_PIXELS / width / height for very large finite dimensions.
    Math.sqrt(PDF_RENDER_MAX_PIXELS) / Math.sqrt(width) / Math.sqrt(height),
  );
}
