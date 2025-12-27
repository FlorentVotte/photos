import { ImageResponse } from "next/og";
import { getAlbumBySlug } from "@/lib/data";

export const runtime = "nodejs";

// Cache for 1 hour
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) {
    // Return default OG image
    return Response.redirect(new URL("/api/og", SITE_URL));
  }

  // Get the cover image URL
  const coverImageUrl = album.coverImage.startsWith("http")
    ? album.coverImage
    : `${SITE_URL}${album.coverImage}`;

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
        {/* Background image with blur effect */}
        <img
          src={coverImageUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(8px) brightness(0.4)",
            transform: "scale(1.1)",
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "60px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Site branding */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#c9a227",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Regards Perdus
          </div>

          {/* Album title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {album.title}
          </div>

          {/* Location and date */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <span>{album.location}</span>
            <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>•</span>
            <span>{album.date}</span>
          </div>

          {/* Photo count badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                fontSize: "16px",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {album.photoCount} photos
            </div>
          </div>
        </div>

        {/* URL in corner */}
        <div
          style={{
            position: "absolute",
            top: "30px",
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
