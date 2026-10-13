import { detectDeskew } from "./deskew";

self.onmessage = ({ data }: MessageEvent<{ id: number; buffer: ArrayBuffer; width: number; height: number }>) => {
  try {
    const result = detectDeskew(new Uint8ClampedArray(data.buffer), data.width, data.height);
    self.postMessage({ id: data.id, result });
  } catch (error) {
    self.postMessage({ id: data.id, error: error instanceof Error ? error.message : "Could not analyze this page." });
  }
};
