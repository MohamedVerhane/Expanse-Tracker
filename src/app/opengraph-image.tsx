import { ImageResponse } from "next/og";

export const alt = "Expense Tracker — Track and manage your personal expenses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 45%, #10b981 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 24,
            border: "2px solid rgba(255,255,255,0.4)",
            width: 96,
            height: 96,
            fontSize: 44,
            fontWeight: 700,
          }}
        >
          ET
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 32 }}>Expense Tracker</div>
        <div style={{ fontSize: 30, fontWeight: 500, marginTop: 12, opacity: 0.9 }}>
          Track and manage your personal expenses
        </div>
      </div>
    ),
    { ...size },
  );
}