import { ImageResponse } from "next/og";
import { getPhotoById } from "@/lib/data";

export const runtime = "nodejs";

// Cache for 1 hour
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;
  const photo = await getPhotoById(id);

  if (!photo) {
    // Return default OG image
    return Response.redirect(new URL("/api/og", SITE_URL));
  }

  // Use medium size for OG image (already optimized)
  const photoUrl = photo.src.medium.startsWith("http")
    ? photo.src.medium
    : `${SITE_URL}${photo.src.medium}`;

  // Build location string
  const location = [photo.metadata.city, photo.metadata.location]
    .filter(Boolean)
    .join(", ");

  // Format date
  const date = photo.metadata.date
    ? new Date(photo.metadata.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0d0d0d",
        }}
      >
        {/* Photo as background */}
        <img
          src={photoUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Gradient overlay at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Content at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Site branding */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#c9a227",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Regards Perdus
          </div>

          {/* Photo title */}
          {photo.title && (
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.2,
                maxWidth: "800px",
              }}
            >
              {photo.title}
            </div>
          )}

          {/* Location and date */}
          {(location || date) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "18px",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {location && <span>{location}</span>}
              {location && date && (
                <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>•</span>
              )}
              {date && <span>{date}</span>}
            </div>
          )}

          {/* Camera info */}
          {photo.metadata.camera && (
            <div
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "4px",
              }}
            >
              {photo.metadata.camera}
              {photo.metadata.lens && ` · ${photo.metadata.lens}`}
            </div>
          )}
        </div>

        {/* URL in corner */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "30px",
            padding: "8px 16px",
            background: "rgba(0, 0, 0, 0.6)",
            borderRadius: "20px",
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.7)",
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
