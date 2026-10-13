/// <reference lib="webworker" />

import { monochromePixels, type MonochromeRequest, type MonochromeResponse } from "./monochrome";

self.onmessage = ({ data }: MessageEvent<MonochromeRequest>) => {
  monochromePixels(new Uint8ClampedArray(data.buffer), data.settings);
  const response: MonochromeResponse = { id: data.id, buffer: data.buffer };
  self.postMessage(response, { transfer: [data.buffer] });
};
