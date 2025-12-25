import fs from "fs";
import crypto from "crypto";
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

// Crypto constants (must match src/lib/crypto.ts)
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    const fallback = process.env.ADMIN_PASSWORD || "default-key-change-me";
    return crypto.scryptSync(fallback, "salt", 32);
  }
  if (key.length === 64) return Buffer.from(key, "hex");
  if (key.length === 32) return Buffer.from(key);
  return crypto.scryptSync(key, "salt", 32);
}

function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  const [iv, tag, data] = parts;
  return (
    iv.length === IV_LENGTH * 2 &&
    tag.length === TAG_LENGTH * 2 &&
    /^[a-f0-9]+$/i.test(iv) &&
    /^[a-f0-9]+$/i.test(tag) &&
    /^[a-f0-9]+$/i.test(data)
  );
}

function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");

  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function getAccessToken(encryptedToken: string): string {
  if (isEncrypted(encryptedToken)) {
    return decrypt(encryptedToken);
  }
  return encryptedToken;
}

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// API response interfaces
interface CatalogResponse {
  id: string;
  [key: string]: unknown;
}

interface AlbumsResponse {
  resources?: Array<{
    id: string;
    payload?: {
      name?: string;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface AssetsResponse {
  resources?: LightroomAsset[];
  [key: string]: unknown;
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
        Make?: string;
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
      [key: string]: unknown;
    };
    location?: {
      latitude?: number;
      longitude?: number;
      city?: string;
      country?: string;
      name?: string;
    };
    [key: string]: unknown;
  };
}

/**
 * Load saved Adobe tokens from database and decrypt them
 */
async function loadTokens(): Promise<TokenData | null> {
  try {
    const token = await prisma.adobeToken.findUnique({ where: { id: "default" } });
    if (!token) return null;

    return {
      access_token: getAccessToken(token.accessToken),
      refresh_token: token.refreshToken ? getAccessToken(token.refreshToken) : "",
      expires_at: token.expiresAt.getTime(),
    };
  } catch {
    return null;
  }
}

/**
 * Parse Adobe API response (strips anti-XSSI prefix)
 */
async function parseAdobeResponse<T = unknown>(response: Response): Promise<T> {
  const text = await response.text();
  // Adobe API returns "while (1) {}" prefix as anti-XSSI protection
  const jsonStr = text.replace(/^while\s*\(\s*1\s*\)\s*\{\s*\}\s*/, "");
  return JSON.parse(jsonStr) as T;
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
export async function fetchAuthenticatedCatalog(): Promise<CatalogResponse> {
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

  return parseAdobeResponse<CatalogResponse>(response);
}

/**
 * Fetch albums from user's catalog
 */
export async function fetchAuthenticatedAlbums(catalogId: string): Promise<AlbumsResponse> {
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

  return parseAdobeResponse<AlbumsResponse>(response);
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

  const data = await parseAdobeResponse<AssetsResponse>(response);
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

  return parseAdobeResponse<LightroomAsset>(response);
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

      if (albums.resources && albums.resources.length > 0) {
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
