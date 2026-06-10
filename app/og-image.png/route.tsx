import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#080b12",
          color: "#f8f0dc",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={{ color: "#d8ff3e", fontSize: 28, letterSpacing: 8, marginBottom: 28, textTransform: "uppercase" }}>Newsletter Técnica</div>
        <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: -6, lineHeight: 1 }}>Fora do Feed</div>
        <div style={{ color: "#f1e7d0", fontSize: 34, marginTop: 30, opacity: 0.72 }}>Tecnologia, software e IA sem ruído de feed.</div>
      </div>
    ),
    { height: 630, width: 1200 },
  );
}
