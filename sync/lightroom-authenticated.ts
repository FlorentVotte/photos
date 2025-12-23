import fetch, { Response } from "node-fetch";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const LIGHTROOM_API = "https://lr.adobe.io/v2";
const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;

// Database setup
const dbPath = process.env.NODE_ENV === "production" && fs.existsSync("/app/data")
  ? "/app/data/photobook.db"
  : "./photobook.db";
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface LightroomAsset {
  id: string; // Album-asset relationship ID
  asset?: {
    id: string; // Actual catalog asset ID - use this for renditions!
    links?: {
      self?: { href: string };
    };
  };
  payload: {
    captureDate?: string;
    importSource?: {
      fileName?: string;
      originalWidth?: number;
      originalHeight?: number;
      cameraModel?: string;
    };
    develop?: {
      croppedWidth?: number;
      croppedHeight?: number;
    };
    xmp?: {
      dc?: {
        title?: string | string[];
        description?: string | string[];
      };
      tiff?: {
        Model?: string;
      };
      aux?: {
        Lens?: string;
      };
      exifEX?: {
        LensModel?: string;
      };
      exif?: {
        FNumber?: number | number[];
        ExposureTime?: number | number[];
        ISOSpeedRatings?: number;
        FocalLength?: number | number[];
      };
      [key: string]: any;
    };
    location?: {
      latitude?: number;
      longitude?: number;
      city?: string;
      country?: string;
      name?: string;
    };
    [key: string]: any;
  };
}

/**
 * Load saved Adobe tokens from database
 */
async function loadTokens(): Promise<TokenData | null> {
  try {
    const token = await prisma.adobeToken.findUnique({ where: { id: "default" } });
    if (!token) return null;

    return {
      access_token: token.accessToken,
      refresh_token: token.refreshToken || "",
      expires_at: token.expiresAt.getTime(),
    };
  } catch {
    return null;
  }
}

/**
 * Parse Adobe API response (strips anti-XSSI prefix)
 */
async function parseAdobeResponse(response: Response): Promise<any> {
  const text = await response.text();
  // Adobe API returns "while (1) {}" prefix as anti-XSSI protection
  const jsonStr = text.replace(/^while\s*\(\s*1\s*\)\s*\{\s*\}\s*/, "");
  return JSON.parse(jsonStr);
}

/**
 * Check if authenticated API is available
 */
export async function isAuthenticatedApiAvailable(): Promise<boolean> {
  const tokens = await loadTokens();
  return !!(tokens && tokens.access_token && Date.now() < tokens.expires_at);
}

/**
 * Fetch user's Lightroom catalog using authenticated API
 */
export async function fetchAuthenticatedCatalog() {
  const tokens = await loadTokens();
  if (!tokens || !ADOBE_CLIENT_ID) {
    throw new Error("Not authenticated with Adobe");
  }

  const response = await fetch(`${LIGHTROOM_API}/catalog`, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "X-API-Key": ADOBE_CLIENT_ID,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch catalog: ${response.status}`);
  }

  return parseAdobeResponse(response);
}

/**
 * Fetch albums from user's catalog
 */
export async function fetchAuthenticatedAlbums(catalogId: string) {
  const tokens = await loadTokens();
  if (!tokens || !ADOBE_CLIENT_ID) {
    throw new Error("Not authenticated with Adobe");
  }

  const response = await fetch(
    `${LIGHTROOM_API}/catalogs/${catalogId}/albums`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "X-API-Key": ADOBE_CLIENT_ID,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch albums: ${response.status}`);
  }

  return parseAdobeResponse(response);
}

/**
 * Fetch assets from an album with full metadata (including title/caption)
 */
export async function fetchAuthenticatedAlbumAssets(
  catalogId: string,
  albumId: string
): Promise<LightroomAsset[]> {
  const tokens = await loadTokens();
  if (!tokens || !ADOBE_CLIENT_ID) {
    throw new Error("Not authenticated with Adobe");
  }

  const url = `${LIGHTROOM_API}/catalogs/${catalogId}/albums/${albumId}/assets`;
  console.log(`    API URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "X-API-Key": ADOBE_CLIENT_ID,
    },
  });

  console.log(`    Response status: ${response.status}`);

  if (!response.ok) {
    const text = await response.text();
    console.log(`    Response body: ${text.substring(0, 500)}`);
    throw new Error(`Failed to fetch album assets: ${response.status}`);
  }

  const data = await parseAdobeResponse(response);
  console.log(`    Resources count: ${data.resources?.length || 0}`);
  return data.resources || [];
}

/**
 * Fetch single asset with full metadata
 */
export async function fetchAuthenticatedAsset(
  catalogId: string,
  assetId: string
): Promise<LightroomAsset | null> {
  const tokens = await loadTokens();
  if (!tokens || !ADOBE_CLIENT_ID) {
    throw new Error("Not authenticated with Adobe");
  }

  const response = await fetch(
    `${LIGHTROOM_API}/catalogs/${catalogId}/assets/${assetId}`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "X-API-Key": ADOBE_CLIENT_ID,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return parseAdobeResponse(response);
}

/**
 * Test the authenticated API and show available fields
 */
export async function testAuthenticatedApi() {
  console.log("Testing authenticated Lightroom API...\n");

  const tokens = await loadTokens();
  if (!tokens) {
    console.log("No tokens found. Please authenticate first:");
    console.log("1. Set ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in .env");
    console.log("2. Visit http://localhost:3000/api/auth/adobe to authenticate\n");
    return;
  }

  if (Date.now() > tokens.expires_at) {
    console.log("Tokens expired. Please re-authenticate.");
    return;
  }

  console.log("Tokens valid, fetching catalog...");

  try {
    const catalog = await fetchAuthenticatedCatalog();
    console.log("Catalog:", JSON.stringify(catalog, null, 2));

    if (catalog.id) {
      const albums = await fetchAuthenticatedAlbums(catalog.id);
      console.log("\nAlbums:", JSON.stringify(albums, null, 2));

      if (albums.resources?.length > 0) {
        const firstAlbum = albums.resources[0];
        console.log(`\nFetching assets from album: ${firstAlbum.payload?.name}`);

        const assets = await fetchAuthenticatedAlbumAssets(
          catalog.id,
          firstAlbum.id
        );

        if (assets.length > 0) {
          console.log("\n=== First Asset Full Payload ===");
          console.log(JSON.stringify(assets[0], null, 2));
          console.log("\n=== Title/Caption Fields ===");
          console.log("dc:title:", assets[0].payload?.xmp?.dc?.title);
          console.log("dc:description:", assets[0].payload?.xmp?.dc?.description);
        }
      }
    }
  } catch (error) {
    console.error("API Error:", error);
  }
}

// Run test if called directly
if (require.main === module) {
  testAuthenticatedApi();
}
