import { ImageResponse } from "next/og";

export const runtime = "edge";

// Cache for 1 hour
export const revalidate = 3600;

export async function GET() {
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
          background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            padding: "40px",
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#c9a227",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Regards Perdus
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Photo Portfolio
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Capturing the fleeting moments between departures and arrivals
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: "100px",
              height: "3px",
              background: "#c9a227",
              marginTop: "16px",
            }}
          />
        </div>

        {/* Bottom corner branding */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "40px",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          photos.votte.eu
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
