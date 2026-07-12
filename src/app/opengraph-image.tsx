import { ImageResponse } from "next/og";

export const alt = "Rutaru — pocas rutas, todas buenas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          backgroundColor: "#111111",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#faf7f2",
            letterSpacing: "-0.02em",
          }}
        >
          Rutaru
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#d97840",
            marginTop: 24,
          }}
        >
          pocas rutas, todas buenas.
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#faf7f2",
            opacity: 0.7,
            marginTop: 40,
          }}
        >
          Rutas · Hospedaje · Traslados · Eventos · Experiencias
        </div>
      </div>
    ),
    { ...size }
  );
}
