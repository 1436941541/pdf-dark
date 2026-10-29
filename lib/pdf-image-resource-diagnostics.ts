/** Safe, best-effort metadata only. Never retain or serialize document data. */
export type ImageReadStep = "fetch_image_data" | "read_image_blob" | "decode_image_bitmap";

export type ImageReadErrorHint =
  | "out_of_memory"
  | "security_error"
  | "quota_exceeded"
  | "invalid_state"
  | "fetch_failed"
  | "body_read_failed"
  | "bitmap_decode_failed"
  | "other";

/** A bounded text hint is evidence, not confirmation that memory ran out. */
export function imageReadErrorHint(error: unknown, step: ImageReadStep): ImageReadErrorHint {
  let name: unknown;
  let message: unknown;
  try { name = (error as { name?: unknown } | null)?.name; } catch { /* optional metadata */ }
  try { message = (error as { message?: unknown } | null)?.message; } catch { /* optional metadata */ }
  if (typeof message === "string") {
    const bounded = message.slice(0, 512);
    if (/out of memory|memory allocation|allocation failed|could not allocate|cannot be allocated/i.test(bounded)) return "out_of_memory";
  }
  if (name === "SecurityError") return "security_error";
  if (name === "QuotaExceededError") return "quota_exceeded";
  if (name === "InvalidStateError") return "invalid_state";
  if (step === "fetch_image_data") return "fetch_failed";
  if (step === "read_image_blob") return "body_read_failed";
  if (step === "decode_image_bitmap") return "bitmap_decode_failed";
  return "other";
}

export type ImageMemorySnapshot = {
  memory_api: "performance.memory" | "unavailable";
  js_heap_used_bytes?: number;
  js_heap_total_bytes?: number;
  js_heap_limit_bytes?: number;
  device_memory_gb?: number;
};

function safeNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : undefined;
}

/**
 * Synchronous failure-only reading. performance.memory is optional and describes
 * JS heap, not total tab/Worker/canvas/GPU memory. deviceMemory is a coarse
 * browser-provided capacity estimate, never a measure of free memory.
 */
export function readImageMemorySnapshot(): ImageMemorySnapshot {
  const result: ImageMemorySnapshot = { memory_api: "unavailable" };
  let memory: unknown;
  try {
    memory = (globalThis.performance as Performance & { memory?: unknown } | undefined)?.memory;
  } catch { /* unsupported or inaccessible browser API */ }
  if (memory && typeof memory === "object") {
    for (const [source, target] of [
      ["usedJSHeapSize", "js_heap_used_bytes"],
      ["totalJSHeapSize", "js_heap_total_bytes"],
      ["jsHeapSizeLimit", "js_heap_limit_bytes"],
    ] as const) {
      try {
        const value = safeNumber((memory as Record<string, unknown>)[source]);
        if (value !== undefined) {
          result[target] = Math.round(value);
          result.memory_api = "performance.memory";
        }
      } catch { /* one broken metric must not hide the others */ }
    }
  }
  try {
    const value = safeNumber((globalThis.navigator as Navigator & { deviceMemory?: unknown } | undefined)?.deviceMemory);
    if (value !== undefined) result.device_memory_gb = value;
  } catch { /* unavailable is not zero */ }
  return result;
}

export type ImageCachePage = {
  originalDataUrl?: string;
  displayDataUrl?: string;
  byTheme?: Partial<Record<string, string>>;
  displayBlob?: Blob;
};

export type ImageCacheSummary = {
  total_pages?: number;
  cached_pages: number;
  cached_original_chars: number;
  cached_display_chars: number;
  cached_variant_chars: number;
  cached_variant_count: number;
  cached_blob_bytes: number;
  cached_data_url_chars: number;
  cache_incomplete?: true;
};

// Defensive limits cover ordinary documents without allowing a malformed
// diagnostic input to create an unbounded scan during a processing failure.
const MAX_CACHE_PAGES = 100_000;
const MAX_VARIANTS_PER_PAGE = 256;

/**
 * Count retained logical payloads, only when the caller reports a failure.
 * Character totals are not physical string/heap bytes: engines can use
 * different encodings, ropes and shared storage. The aggregate de-duplicates
 * aliases within one page; separate pages are deliberately counted separately.
 * No image is decoded, hashed, copied or retained by this function.
 */
export function summarizeImageCache(pages: readonly ImageCachePage[], totalPages?: number): ImageCacheSummary {
  const result: ImageCacheSummary = {
    cached_pages: 0,
    cached_original_chars: 0,
    cached_display_chars: 0,
    cached_variant_chars: 0,
    cached_variant_count: 0,
    cached_blob_bytes: 0,
    cached_data_url_chars: 0,
  };
  const total = safeNumber(totalPages);
  if (total !== undefined && Number.isInteger(total) && total > 0) result.total_pages = total;
  try {
    if (!Array.isArray(pages)) {
      result.cache_incomplete = true;
      return result;
    }
    const length = safeNumber(pages.length);
    if (length === undefined || !Number.isInteger(length)) {
      result.cache_incomplete = true;
      return result;
    }
    result.cached_pages = length;
    if (length > MAX_CACHE_PAGES) result.cache_incomplete = true;
    const limit = Math.min(length, MAX_CACHE_PAGES);
    const add = (key: Exclude<keyof ImageCacheSummary, "total_pages" | "cache_incomplete">, value: number) => {
      const next = result[key] + value;
      if (Number.isSafeInteger(next)) result[key] = next;
      else result.cache_incomplete = true;
    };
    for (let index = 0; index < limit; index++) {
      let page: ImageCachePage;
      try {
        page = pages[index];
        if (!page || typeof page !== "object") { result.cache_incomplete = true; continue; }
      } catch { result.cache_incomplete = true; continue; }
      // At most one small page-local list; avoid hashing a document's large
      // data URLs into a global Set or keeping extra document-sized indexes.
      const seen: string[] = [];
      const countPayload = (value: string) => {
        if (!seen.some(previous => previous === value)) {
          add("cached_data_url_chars", value.length);
          seen.push(value);
        }
      };
      try {
        const original = page.originalDataUrl;
        if (typeof original === "string") { add("cached_original_chars", original.length); countPayload(original); }
      } catch { result.cache_incomplete = true; }
      try {
        const variants = page.byTheme;
        if (variants && typeof variants === "object") {
          let visited = 0;
          for (const key in variants) {
            if (!Object.prototype.hasOwnProperty.call(variants, key)) continue;
            if (visited++ >= MAX_VARIANTS_PER_PAGE) { result.cache_incomplete = true; break; }
            try {
              const value = variants[key];
              if (typeof value === "string") {
                add("cached_variant_chars", value.length);
                add("cached_variant_count", 1);
                countPayload(value);
              } else if (value !== undefined) result.cache_incomplete = true;
            } catch { result.cache_incomplete = true; }
          }
        } else if (variants !== undefined) result.cache_incomplete = true;
      } catch { result.cache_incomplete = true; }
      try {
        const display = page.displayDataUrl;
        if (typeof display === "string") { add("cached_display_chars", display.length); countPayload(display); }
      } catch { result.cache_incomplete = true; }
      try {
        const blob = page.displayBlob;
        if (blob !== undefined) {
          const size = safeNumber(blob.size);
          if (size !== undefined && Number.isInteger(size)) add("cached_blob_bytes", size);
          else result.cache_incomplete = true;
        }
      } catch { result.cache_incomplete = true; }
    }
  } catch { result.cache_incomplete = true; }
  return result;
}
