import { ImageResponse } from "next/og";
import { getFeaturedAlbum } from "@/lib/data";
import { getActiveTheme } from "@/lib/active-theme";
import { THEME_PRESETS } from "@/lib/themes";
import { hexToRgba } from "@/lib/theme-utils";

export const runtime = "nodejs";

// Force dynamic to prevent pre-rendering during build (database may not exist)
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

export async function GET() {
  const featuredAlbum = await getFeaturedAlbum();
  const preset = THEME_PRESETS[await getActiveTheme()];
  const { primary, background, surface, textPrimary, textMuted } = preset.colors;
  // Only darken the cover for dark themes; light themes scrim towards the page ground.
  const coverBrightness = preset.mode === "dark" ? 0.5 : 1;

  // If we have a featured album, use its cover image
  if (featuredAlbum) {
    const coverImageUrl = featuredAlbum.coverImage.startsWith("http")
      ? featuredAlbum.coverImage
      : `${SITE_URL}${featuredAlbum.coverImage}`;

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
          {/* Featured album cover as background */}
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

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                `linear-gradient(to top, ${hexToRgba(background, 0.92)} 0%, ${hexToRgba(background, 0.3)} 50%, ${hexToRgba(background, 0.5)} 100%)`,
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
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: primary,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Regards Perdus
            </div>

            {/* Main title */}
            <div
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: textPrimary,
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              Travel Photography
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: "22px",
                color: textMuted,
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
                background: primary,
                marginTop: "8px",
              }}
            />
          </div>

          {/* URL in corner */}
          <div
            style={{
              position: "absolute",
              top: "30px",
              right: "40px",
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

  // Fallback: no featured album, use simple branded image
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
          background: `linear-gradient(135deg, ${surface} 0%, ${background} 100%)`,
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(primary)}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
              color: primary,
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
              color: textPrimary,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Travel Photography
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "24px",
              color: textMuted,
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
              background: primary,
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
