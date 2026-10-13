import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "PDF to Black and White — original, grayscale and pure black-and-white PDF comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlackAndWhiteOpenGraphImage() {
  const examples = await Promise.all([
    ["Original", "original-2.png"],
    ["Grayscale", "gray-2.png"],
    ["Pure black & white", "bw128-2.png"],
  ].map(async ([label, file]) => ({
    label,
    src: `data:image/png;base64,${(await readFile(join(process.cwd(), "public/examples/black-and-white", file))).toString("base64")}`,
  })));

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "38px 52px", background: "radial-gradient(ellipse at 90% 0%, rgba(251,191,36,0.12), transparent 55%), #0a0a0a", color: "#fafafa", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fbbf24"><path d="M20.9 13.1A9 9 0 0 1 10.9 3.1 9 9 0 1 0 20.9 13.1Z" /></svg>
          <span style={{ fontSize: 23, fontWeight: 700 }}>PDF Dark</span>
        </div>
        <span style={{ color: "#a3a3a3", fontSize: 19 }}>pdfdark.org</span>
      </div>
      <div style={{ display: "flex", fontSize: 60, lineHeight: 1.1, fontWeight: 700, letterSpacing: -1.8, marginTop: 18 }}>PDF to <span style={{ color: "#fbbf24", marginLeft: 14 }}>Black and White</span></div>
      <div style={{ display: "flex", color: "#a3a3a3", fontSize: 23, marginTop: 8 }}>Keep the gray tones. Or go pure black &amp; white.</div>
      <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
        {examples.map(({ label, src }) => <div key={label} style={{ display: "flex", flexDirection: "column", width: 352, padding: 12, border: "1px solid #333333", borderRadius: 16, background: "#171717" }}>
          <div style={{ display: "flex", marginBottom: 10, fontSize: 19, fontWeight: 600, color: label === "Original" ? "#d4d4d4" : "#fbbf24" }}>{label}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, background: "#ffffff", borderRadius: 7, overflow: "hidden" }}>
            {/* Embedded local exports keep this image independent of external fetches. */}
            <img src={src} alt={label} width={326} height={220} style={{ objectFit: "contain" }} />
          </div>
        </div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, fontSize: 19 }}>
        <span style={{ color: "#a3a3a3" }}>Free · No signup · Your PDF stays on your device</span>
        <span style={{ color: "#fbbf24", fontWeight: 700 }}>Preview. Convert. Download.</span>
      </div>
    </div>,
    size,
  );
}
