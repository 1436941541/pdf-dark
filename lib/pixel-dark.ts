import { THEMES, type ThemeId } from "./themes";

// 饱和度阈值：低于这个 = 认为是文字/线条（接近灰阶），要反色
// 高于这个 = 认为是彩色图片/色块，保留原色
const SAT_THRESHOLD = 0.18;

// 将主题映射成 "灰阶亮度 v → 最终 RGB" 的函数
// v 是 0-255 的亮度值（反色后的）
function themeColorizer(theme: ThemeId): (v: number) => [number, number, number] {
  switch (theme) {
    case "midnight":
      // 纯黑底白字，无色偏
      return (v) => [v, v, v];
    case "sepia":
      // 暖棕：偏黄偏红
      return (v) => [Math.round(v * 1.0), Math.round(v * 0.93), Math.round(v * 0.78)];
    case "solarized":
      // 冷青：偏青蓝
      return (v) => [Math.round(v * 0.86), Math.round(v * 0.95), Math.round(v * 0.95)];
    case "oled":
      // 高对比：亮处更亮，暗处彻底黑（偏二值化）
      return (v) => {
        const boosted = v < 20 ? 0 : Math.min(255, Math.round(v * 1.08));
        return [boosted, boosted, boosted];
      };
  }
}

/**
 * 在 ImageData 上就地修改，应用"图片保留原色"的暗色主题。
 *
 * 每个像素的处理：
 * - 计算 HSV 饱和度 s = (max-min)/max
 * - s < 阈值 → 文字/线条 → 反色 + 应用主题着色
 * - s >= 阈值 → 彩色内容 → 不动
 *
 * 这避开了朴素的 CSS invert 会把照片变成"外星色"的问题。
 */
export function applySmartDark(imageData: ImageData, theme: ThemeId): void {
  const colorize = themeColorizer(theme);
  const d = imageData.data;
  const len = d.length;

  for (let i = 0; i < len; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    const max = r > g ? (r > b ? r : b) : g > b ? g : b;
    const min = r < g ? (r < b ? r : b) : g < b ? g : b;
    const sat = max === 0 ? 0 : (max - min) / max;

    if (sat < SAT_THRESHOLD) {
      // 视为文字/背景：反色 + 主题色调
      // v = 反色后的亮度（用 max 作为灰阶近似，对纯灰阶准确；对接近灰的偏色也够用）
      const v = 255 - max;
      const [nr, ng, nb] = colorize(v);
      d[i] = nr;
      d[i + 1] = ng;
      d[i + 2] = nb;
    }
    // else: 彩色内容，保留原色
  }
}

/**
 * 从一个 dataUrl 加载图像、在 canvas 上处理、返回新的 JPEG dataUrl。
 * 只在客户端可用（依赖 Image/Canvas）。
 */
export async function darkifyDataUrl(
  originalDataUrl: string,
  width: number,
  height: number,
  theme: ThemeId,
): Promise<string> {
  const img = await loadImage(originalDataUrl);
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
  // OffscreenCanvas 和 HTMLCanvasElement 类型不同，统一处理
  const ctx = (canvas as HTMLCanvasElement).getContext("2d", {
    willReadFrequently: true,
  });
  if (!ctx) throw new Error("canvas 2d context unavailable");

  // 先把纯色主题背景铺底（让 JPEG 压缩能找到大块色域，减小体积）
  ctx.fillStyle = THEMES[theme].swatch;
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  applySmartDark(imageData, theme);
  ctx.putImageData(imageData, 0, 0);

  // 统一产出 dataUrl（OffscreenCanvas 需要 convertToBlob）
  if (canvas instanceof HTMLCanvasElement) {
    return canvas.toDataURL("image/jpeg", 0.88);
  }
  const blob = await (canvas as OffscreenCanvas).convertToBlob({
    type: "image/jpeg",
    quality: 0.88,
  });
  return await blobToDataUrl(blob);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("blob read failed"));
    fr.readAsDataURL(blob);
  });
}
