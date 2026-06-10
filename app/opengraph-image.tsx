import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "sans-serif",
        padding: "60px",
      }}
    >
      <p style={{ fontSize: 24, opacity: 0.5, marginBottom: 16, letterSpacing: 4 }}>NEWSLETTER TÉCNICA</p>
      <h1 style={{ fontSize: 80, fontWeight: 800, margin: 0 }}>Fora do Feed</h1>
      <p style={{ fontSize: 28, opacity: 0.6, marginTop: 24, textAlign: "center" }}>
        Tecnologia, software e IA sem ruído de feed.
      </p>
    </div>,
  );
}
