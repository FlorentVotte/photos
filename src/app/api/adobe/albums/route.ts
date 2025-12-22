import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// In production (Docker), use /app/data. In development, use project root
const TOKENS_FILE = process.env.NODE_ENV === "production"
  ? "/app/data/adobe-tokens.json"
  : path.join(process.cwd(), "adobe-tokens.json");
const LIGHTROOM_API = "https://lr.adobe.io/v2";
const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function loadTokens(): Promise<TokenData | null> {
  try {
    const data = await fs.readFile(TOKENS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function fetchWithAuth(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-API-Key": ADOBE_CLIENT_ID!,
    },
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
    const tokens = await loadTokens();

    if (!tokens || !ADOBE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Not authenticated with Adobe" },
        { status: 401 }
      );
    }

    if (Date.now() > tokens.expires_at) {
      return NextResponse.json(
        { error: "Adobe token expired, please reconnect" },
        { status: 401 }
      );
    }

    // Get catalog
    const catalog = await fetchWithAuth(
      `${LIGHTROOM_API}/catalog`,
      tokens.access_token
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
      tokens.access_token
    );

    const albums = (albumsResponse?.resources || []).map((album: any) => {
      // Debug: log first album structure to see where count is
      if (albumsResponse?.resources?.indexOf(album) === 0) {
        console.log("First album structure:", JSON.stringify(album, null, 2));
      }

      // Try multiple possible locations for asset count
      const assetCount =
        album.payload?.assetCount ||
        album.asset_count ||
        album.links?.["/rels/assets"]?.count ||
        album.relationships?.assets?.count ||
        0;

      return {
        id: album.id,
        name: album.payload?.name || "Untitled Album",
        created: album.created,
        updated: album.updated,
        assetCount,
      };
    });

    // Sort by updated date (most recent first)
    albums.sort((a: any, b: any) =>
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

    return NextResponse.json({
      catalogId: catalog.id,
      albums,
    });
  } catch (error) {
    console.error("Error fetching Adobe albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
