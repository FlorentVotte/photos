import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { decrypt, isEncrypted } from "@/lib/crypto";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

interface AdobeAlbum {
  id: string;
  created: string;
  updated: string;
  payload?: {
    name?: string;
  };
}

interface AlbumWithCount {
  id: string;
  name: string;
  created: string;
  updated: string;
  assetCount: number;
}

const LIGHTROOM_API = "https://lr.adobe.io/v2";
const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;

// Helper to get decrypted access token
function getAccessToken(token: { accessToken: string }): string {
  // Support both encrypted and plain tokens for migration
  if (isEncrypted(token.accessToken)) {
    return decrypt(token.accessToken);
  }
  return token.accessToken;
}

async function fetchWithAuth(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-API-Key": ADOBE_CLIENT_ID!,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  // Adobe API returns "while (1) {}" prefix as anti-XSSI protection
  const text = await response.text();
  const jsonStr = text.replace(/^while\s*\(\s*1\s*\)\s*\{\s*\}\s*/, "");
  return JSON.parse(jsonStr);
}

export async function GET() {
  try {
    const token = await prisma.adobeToken.findUnique({
      where: { id: "default" },
    });

    if (!token || !ADOBE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Not authenticated with Adobe" },
        { status: 401 }
      );
    }

    if (new Date() > token.expiresAt) {
      return NextResponse.json(
        { error: "Adobe token expired, please reconnect" },
        { status: 401 }
      );
    }

    // Decrypt access token
    const accessToken = getAccessToken(token);

    // Get catalog
    const catalog = await fetchWithAuth(
      `${LIGHTROOM_API}/catalog`,
      accessToken
    );

    if (!catalog?.id) {
      return NextResponse.json(
        { error: "Could not fetch catalog" },
        { status: 500 }
      );
    }

    // Get albums
    const albumsResponse = await fetchWithAuth(
      `${LIGHTROOM_API}/catalogs/${catalog.id}/albums`,
      accessToken
    );

    const albumsRaw = albumsResponse?.resources || [];

    // Fetch asset counts for each album in parallel (batch of 5 to avoid rate limits)
    const albumsWithCounts: AlbumWithCount[] = [];
    const batchSize = 5;

    for (let i = 0; i < albumsRaw.length; i += batchSize) {
      const batch = albumsRaw.slice(i, i + batchSize) as AdobeAlbum[];
      const batchResults = await Promise.all(
        batch.map(async (album: AdobeAlbum) => {
          let assetCount = 0;
          try {
            // Fetch all assets to count them (Adobe API doesn't provide count directly)
            const assetsResponse = await fetchWithAuth(
              `${LIGHTROOM_API}/catalogs/${catalog.id}/albums/${album.id}/assets`,
              accessToken
            );
            assetCount = assetsResponse?.resources?.length || 0;
          } catch {
            // If fetching assets fails, use 0
          }

          return {
            id: album.id,
            name: album.payload?.name || "Untitled Album",
            created: album.created,
            updated: album.updated,
            assetCount,
          };
        })
      );
      albumsWithCounts.push(...batchResults);
    }

    // Sort by updated date (most recent first)
    albumsWithCounts.sort((a, b) =>
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

    return NextResponse.json({
      catalogId: catalog.id,
      albums: albumsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching Adobe albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
