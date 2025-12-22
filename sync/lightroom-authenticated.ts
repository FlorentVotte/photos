import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

const TOKENS_FILE = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/adobe-tokens.json" : "adobe-tokens.json"
);
const LIGHTROOM_API = "https://lr.adobe.io/v2";
const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface LightroomAsset {
  id: string;
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
 * Load saved Adobe tokens
 */
async function loadTokens(): Promise<TokenData | null> {
  try {
    const data = await fs.readFile(TOKENS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
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

  return response.json();
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

  return response.json();
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

  const response = await fetch(
    `${LIGHTROOM_API}/catalogs/${catalogId}/albums/${albumId}/assets`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "X-API-Key": ADOBE_CLIENT_ID,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch album assets: ${response.status}`);
  }

  const data = await response.json();
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

  return response.json();
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
