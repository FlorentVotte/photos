import { ImageResponse } from "next/og";
import { getAlbumBySlug } from "@/lib/data";
import { getActiveTheme } from "@/lib/active-theme";
import { THEME_PRESETS } from "@/lib/themes";
import { hexToRgba } from "@/lib/theme-utils";

export const runtime = "nodejs";

// Force dynamic to prevent pre-rendering during build
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: Props) {
  const { slug } = await params;

  // Validate slug to prevent abuse
  if (!slug || slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
    return Response.redirect(new URL("/api/og", SITE_URL));
  }

  const album = await getAlbumBySlug(slug);

  if (!album) {
    return Response.redirect(new URL("/api/og", SITE_URL));
  }

  const preset = THEME_PRESETS[await getActiveTheme()];
  const { primary, background, surface, textPrimary, textMuted } = preset.colors;
  const coverBrightness = preset.mode === "dark" ? 0.4 : 1;

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
          background: background,
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
            filter: `brightness(${coverBrightness})`,
          }}
        />

        {/* Gradient overlay for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              `linear-gradient(to top, ${hexToRgba(background, 0.9)} 0%, ${hexToRgba(background, 0.2)} 50%, ${hexToRgba(background, 0.4)} 100%)`,
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
              color: textPrimary,
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
              color: textMuted,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span>{album.location}</span>
              <span style={{ color: primary }}>•</span>
              <span>{album.date}</span>
            </div>
            <div
              style={{
                padding: "6px 16px",
                background: surface,
                borderRadius: "20px",
                fontSize: "18px",
              }}
            >
              {`${album.photoCount} photos`}
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
            background: hexToRgba(surface, 0.85),
            borderRadius: "20px",
            fontSize: "16px",
            color: textMuted,
          }}
        >
          photos.votte.eu
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
