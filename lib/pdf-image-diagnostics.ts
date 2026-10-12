import * as Sentry from "@sentry/nextjs";

type PageImageInfo = {
  pageNumber: number;
  width: number;
  height: number;
  imageRegionCount: number;
};

type ImageStep = "fetch_image_data" | "read_image_blob" | "decode_image_bitmap";

type ImageFailureContext = {
  step: ImageStep;
  page_number: number;
  width: number;
  height: number;
  image_region_count: number;
  source_kind: "data" | "blob" | "other";
  source_length: number;
  source_empty: boolean;
  image_format: "jpeg" | "png" | "other";
  blob_bytes?: number;
  elapsed_ms: number;
  step_elapsed_ms: number;
  visibility: DocumentVisibilityState;
  document_focused: boolean;
};

// Associate safe metadata with the original exception without replacing its
// stack, adding file contents to the error, or keeping document data alive.
const failures = new WeakMap<object, ImageFailureContext>();

export async function loadPageBitmap(
  source: string,
  page: PageImageInfo,
  checkCancelled: () => void,
): Promise<ImageBitmap> {
  const started = performance.now();
  let stepStarted = started;
  let step: ImageStep = "fetch_image_data";
  let blobBytes: number | undefined;

  try {
    checkCancelled();
    const response = await fetch(source);
    checkCancelled();
    step = "read_image_blob";
    stepStarted = performance.now();
    const blob = await response.blob();
    blobBytes = blob.size;
    checkCancelled();
    step = "decode_image_bitmap";
    stepStarted = performance.now();
    const bitmap = await createImageBitmap(blob);
    checkCancelled();
    return bitmap;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    const context: ImageFailureContext = {
      step,
      page_number: page.pageNumber,
      width: page.width,
      height: page.height,
      image_region_count: page.imageRegionCount,
      source_kind: source.startsWith("data:") ? "data" : source.startsWith("blob:") ? "blob" : "other",
      source_length: source.length,
      source_empty: source.length === 0 || source === "data:,",
      image_format: source.startsWith("data:image/jpeg;") ? "jpeg" : source.startsWith("data:image/png;") ? "png" : "other",
      blob_bytes: blobBytes,
      elapsed_ms: Math.round(performance.now() - started),
      step_elapsed_ms: Math.round(performance.now() - stepStarted),
      visibility: document.visibilityState,
      document_focused: document.hasFocus(),
    };
    if (typeof error === "object" && error !== null) failures.set(error, context);
    // Never log the source URL, file name, PDF text, or image bytes.
    console.error("[pdf-dark] image processing diagnostic", context);
    throw error;
  }
}

export function capturePdfProcessingException(error: unknown, stage: string) {
  const context = typeof error === "object" && error !== null ? failures.get(error) : undefined;
  Sentry.captureException(error, {
    tags: { stage, ...(context ? { image_step: context.step } : {}) },
    contexts: context ? { pdf_image_processing: context } : undefined,
  });
}
