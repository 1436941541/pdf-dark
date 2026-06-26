import { ImageResponse } from "next/og";

export const alt = "PDF Dark — Convert PDFs to dark mode in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "radial-gradient(70% 80% at 70% 40%, rgba(245,196,81,0.18) 0%, transparent 60%), #0a0a0a",
          padding: "90px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 36,
          }}
        >
          <div style={{ fontSize: 72, display: "flex" }}>🌙</div>
          <div
            style={{
              color: "#fafafa",
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: -0.5,
              display: "flex",
            }}
          >
            PDF Dark
          </div>
        </div>

        <div
          style={{
            color: "#fafafa",
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            maxWidth: 1020,
            display: "flex",
            flexWrap: "wrap",
            gap: "0 18px",
          }}
        >
          <span>Convert any PDF to</span>
          <span style={{ color: "#fbbf24" }}>dark mode</span>
          <span>— in your browser.</span>
        </div>

        <div
          style={{
            color: "#a3a3a3",
            fontSize: 30,
            marginTop: 36,
            maxWidth: 980,
            lineHeight: 1.35,
            display: "flex",
          }}
        >
          Free. No upload, no signup. Read or download a dark PDF.
        </div>
      </div>
    ),
    { ...size },
  );
}
