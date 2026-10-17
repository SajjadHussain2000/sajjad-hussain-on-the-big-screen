import { ImageResponse } from "next/og";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };

// Shared social card used by every opengraph-image route.
export function ogCard(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0d0f12 0%, #111b27 100%)",
          color: "#e3e6e8",
        }}
      >
        <div style={{ fontSize: 32, color: "#ff1a81" }}>{site.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 36, color: "#9ca8b4" }}>{subtitle}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
