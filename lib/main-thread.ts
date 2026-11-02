// Helpers that keep the page responsive while PDFs render on the main thread.
// A tap that lands mid-render has to wait for whatever synchronous work is
// running; these shorten each such block so input gets handled in between.

import {
  recordCanvasEncodingFailure,
  startCanvasEncodingDiagnostics,
  type CanvasEncodingFailure,
  type CanvasEncodingFailureKind,
  type CanvasEncodingPhase,
  type CanvasEncodingStart,
} from "./pdf-encoding-diagnostics";

/** Let pending input and paint run before continuing. */
export function yieldToMain(): Promise<void> {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } })
    .scheduler;
  if (s?.yield) return s.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function encodingStart(canvas: HTMLCanvasElement, quality: number): CanvasEncodingStart {
  try { return startCanvasEncodingDiagnostics(canvas, quality); } catch { return {}; }
}

function encodingFailure(
  error: unknown,
  canvas: HTMLCanvasElement,
  start: CanvasEncodingStart,
  details: CanvasEncodingFailure,
  blob?: Blob | null,
  url?: unknown,
): void {
  try { recordCanvasEncodingFailure(error, canvas, start, details, blob, url); } catch { /* Keep the original failure. */ }
}

function imageDataUrlParts(
  url: unknown,
  noteInvalid: (kind: CanvasEncodingFailureKind, validCharacters?: boolean) => void,
): { type: string; base64: string } {
  const invalid = (kind: CanvasEncodingFailureKind, validCharacters?: boolean): never => {
    noteInvalid(kind, validCharacters);
    throw new Error("JPEG encoding failed");
  };
  if (typeof url !== "string") return invalid("data_url_not_string");
  const comma = url.indexOf(",");
  const type = /^data:(image\/[a-z0-9.+-]+);base64$/i.exec(url.slice(0, comma))?.[1];
  const base64 = url.slice(comma + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  // Validate without decoding another full-size copy on the reader path.
  if (!type) return invalid(url === "data:," ? "empty_data_url_sentinel" : "invalid_data_url_header");
  if (!/^[a-z0-9+/]+={0,2}$/i.test(base64)) return invalid(base64.length === 0 ? "empty_base64" : "invalid_base64_characters", false);
  if ((base64.length - padding) % 4 === 1) return invalid("invalid_base64_length", true);
  if (padding > 0 && base64.length % 4 !== 0) return invalid("invalid_base64_padding", true);
  return { type, base64 };
}

/** Export keeps encoded pages as Blobs instead of Base64 strings. */
export function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  const start = encodingStart(canvas, quality);
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        let phase: CanvasEncodingPhase = "inspect_blob";
        let failureKind: CanvasEncodingFailureKind = "blob_metadata_threw";
        let toBlobResult: CanvasEncodingFailure["to_blob_result"] = "unavailable";
        let url: unknown;
        let validCharacters: boolean | undefined;
        try {
          if (blob && blob.size > 0) {
            resolve(blob);
            return;
          }
          toBlobResult = blob ? "empty" : "null";
          // Preserve the existing encoder fallback without a data-URL fetch.
          phase = "to_data_url";
          failureKind = "to_data_url_threw";
          url = canvas.toDataURL("image/jpeg", quality);
          phase = "validate_data_url";
          failureKind = "validate_data_url_threw";
          const { type, base64 } = imageDataUrlParts(url, (kind, valid) => {
            failureKind = kind;
            validCharacters = valid;
          });
          validCharacters = true;
          phase = "validate_jpeg_type";
          failureKind = "unsupported_jpeg_fallback";
          if (type.toLowerCase() !== "image/jpeg") throw new Error("JPEG encoding failed");
          phase = "decode_base64";
          failureKind = "decode_base64_threw";
          const binary = atob(base64);
          phase = "build_blob";
          failureKind = "build_blob_threw";
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
          const encoded = new Blob([bytes], { type });
          phase = "validate_blob";
          failureKind = "empty_encoded_blob";
          if (encoded.size === 0) throw new Error("JPEG encoding failed");
          resolve(encoded);
        } catch (error) {
          encodingFailure(error, canvas, start, {
            api: "blob", phase, failure_kind: failureKind, to_blob_result: toBlobResult,
            base64_characters_valid: validCharacters,
          }, blob, url);
          reject(error);
        }
      }, "image/jpeg", quality);
    } catch (error) {
      encodingFailure(error, canvas, start, { api: "blob", phase: "to_blob", failure_kind: "to_blob_threw", to_blob_result: "unavailable" });
      reject(error);
    }
  });
}

/**
 * Same result as `canvas.toDataURL("image/jpeg", quality)`, but the JPEG
 * encode runs off the main thread (`toBlob`) and the base64 step is async
 * (`FileReader`). Falls back to the sync call if `toBlob` gives nothing.
 * Browsers can return another image type, such as PNG, for either call.
 */
export function canvasToJpegDataUrl(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<string> {
  const start = encodingStart(canvas, quality);
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        let phase: CanvasEncodingPhase = "inspect_blob";
        let failureKind: CanvasEncodingFailureKind = "blob_metadata_threw";
        let toBlobResult: CanvasEncodingFailure["to_blob_result"] = "unavailable";
        let url: unknown;
        let validCharacters: boolean | undefined;
        try {
          if (!blob || blob.size === 0) {
            toBlobResult = blob ? "empty" : "null";
            phase = "to_data_url";
            failureKind = "to_data_url_threw";
            url = canvas.toDataURL("image/jpeg", quality);
            phase = "validate_data_url";
            failureKind = "validate_data_url_threw";
            imageDataUrlParts(url, (kind, valid) => {
              failureKind = kind;
              validCharacters = valid;
            });
            resolve(url as string);
            return;
          }
          toBlobResult = "nonempty";
          phase = "create_file_reader";
          failureKind = "file_reader_constructor_threw";
          const fr = new FileReader();
          fr.onload = () => {
            try {
              phase = "validate_data_url";
              failureKind = "file_reader_result_threw";
              url = fr.result;
              failureKind = "validate_data_url_threw";
              imageDataUrlParts(url, (kind, valid) => {
                failureKind = kind;
                validCharacters = valid;
              });
              validCharacters = true;
              failureKind = "file_reader_result_threw";
              resolve(fr.result as string);
            } catch (error) {
              encodingFailure(error, canvas, start, {
                api: "data_url", phase, failure_kind: failureKind, to_blob_result: toBlobResult,
                base64_characters_valid: validCharacters,
              }, blob, url);
              reject(error);
            }
          };
          const failedReader = (kind: "file_reader_error" | "file_reader_abort") => {
            const error = new Error("FileReader failed");
            encodingFailure(error, canvas, start, { api: "data_url", phase: "read_blob_as_data_url", failure_kind: kind, to_blob_result: toBlobResult }, blob);
            reject(error);
          };
          fr.onerror = () => failedReader("file_reader_error");
          fr.onabort = () => failedReader("file_reader_abort");
          phase = "read_blob_as_data_url";
          failureKind = "file_reader_read_threw";
          fr.readAsDataURL(blob);
        } catch (error) {
          // toBlob callbacks run asynchronously, outside the Promise executor.
          encodingFailure(error, canvas, start, {
            api: "data_url", phase, failure_kind: failureKind, to_blob_result: toBlobResult,
            base64_characters_valid: validCharacters,
          }, blob, url);
          reject(error);
        }
      }, "image/jpeg", quality);
    } catch (error) {
      encodingFailure(error, canvas, start, { api: "data_url", phase: "to_blob", failure_kind: "to_blob_threw", to_blob_result: "unavailable" });
      reject(error);
    }
  });
}
