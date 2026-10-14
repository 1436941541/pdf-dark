import { cleanBackground, type BackgroundSettings } from "./background";
self.onmessage = ({ data }: MessageEvent<{ id: number; buffer: ArrayBuffer; width: number; height: number; settings: BackgroundSettings }>) => {
  try { const pixels = cleanBackground(new Uint8ClampedArray(data.buffer), data.width, data.height, data.settings); self.postMessage({ id: data.id, buffer: pixels.buffer }, { transfer: [pixels.buffer] }); }
  catch (error) { self.postMessage({ id: data.id, error: error instanceof Error ? error.message : "Background cleaning failed." }); }
};
