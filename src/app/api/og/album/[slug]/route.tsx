import { ImageResponse } from "next/og";
import { getAlbumBySlug } from "@/lib/data";

export const runtime = "nodejs";

// Force dynamic to prevent pre-rendering during build
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) {
    return Response.redirect(new URL("/api/og", SITE_URL));
  }

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
        {/* Album cover as full-bleed background */}
        <img
          src={coverImageUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.4)",
          }}
        />

        {/* Gradient overlay for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        {/* Content at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "50px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Album title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {album.title}
          </div>

          {/* Location, date, and photo count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "22px",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span>{album.location}</span>
              <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>•</span>
              <span>{album.date}</span>
            </div>
            <div
              style={{
                padding: "6px 16px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                fontSize: "18px",
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
            top: "24px",
            right: "32px",
            padding: "8px 16px",
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: "20px",
            fontSize: "16px",
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
