import fetch from "node-fetch";
import type { LightroomGalleryData, LightroomPhoto } from "./types";

// Use lightroom.adobe.com for shared galleries (photos.adobe.io requires auth)
const LIGHTROOM_SHARES_API = "https://lightroom.adobe.com/v2";
const ADOBE_PHOTOS_API = "https://photos.adobe.io/v2";
const API_KEY = "LightroomMobileWeb1";

/**
 * Parses a public Lightroom gallery URL and extracts photo data.
 * Uses Adobe's Photos API to fetch the actual photo data.
 */
export async function parseGalleryUrl(
  galleryUrl: string
): Promise<LightroomGalleryData | null> {
  try {
    console.log(`Fetching gallery: ${galleryUrl}`);

    // Extract space ID from URL
    const spaceId = extractSpaceIdFromUrl(galleryUrl);
    if (!spaceId) {
      console.error("Could not extract space ID from URL");
      return null;
    }

    // First, fetch the share page to get album info
    const response = await fetch(galleryUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch gallery: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract album info directly from HTML using patterns
    let albumId: string | undefined;
    let albumTitle = "Untitled Album";

    // Find album ID from albumAttributes or albums/{id}/assets pattern
    const albumAttrMatch = html.match(/albumAttributes:\s*\{"id":"([a-f0-9]{32})"/);
    if (albumAttrMatch) {
      albumId = albumAttrMatch[1];
    } else {
      // Try the albums/{id}/assets URL pattern
      const albumsUrlMatch = html.match(/albums\/([a-f0-9]{32})\/assets/);
      if (albumsUrlMatch) {
        albumId = albumsUrlMatch[1];
      }
    }

    // Find album name
    const nameMatch = html.match(/"name":"([^"]+)"/);
    if (nameMatch) {
      albumTitle = nameMatch[1];
    }

    // Also try <title> tag as fallback
    if (albumTitle === "Untitled Album") {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      if (titleMatch) {
        albumTitle = titleMatch[1].replace(" | Adobe Lightroom", "").trim();
      }
    }

    console.log(`  Space ID: ${spaceId}`);
    console.log(`  Album ID: ${albumId || "none"}`);
    console.log(`  Album: ${albumTitle}`);

    // Fetch assets from the API
    const photos = await fetchAlbumAssets(spaceId, albumId);

    return {
      title: albumTitle,
      photos,
    };
  } catch (error) {
    console.error(`Error parsing gallery ${galleryUrl}:`, error);
    return null;
  }
}

/**
 * Fetch album assets from Lightroom Shares API
 */
async function fetchAlbumAssets(
  spaceId: string,
  albumId?: string
): Promise<LightroomPhoto[]> {
  try {
    // Build API URL - use lightroom.adobe.com for shared galleries
    let apiUrl = `${LIGHTROOM_SHARES_API}/spaces/${spaceId}/assets`;
    if (albumId) {
      apiUrl = `${LIGHTROOM_SHARES_API}/spaces/${spaceId}/albums/${albumId}/assets`;
    }
    apiUrl += "?subtype=image&limit=1000";

    console.log(`  Fetching assets from shares API...`);

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      // Try without album ID (space-level assets)
      if (albumId) {
        console.log("  Album API failed, trying space-level assets...");
        return fetchAlbumAssets(spaceId, undefined);
      }
      console.error(`  API request failed: ${response.status}`);
      return [];
    }

    // Response starts with "while (1) {}" for security
    let text = await response.text();
    if (text.startsWith("while (1) {}")) {
      text = text.replace("while (1) {}", "").trim();
    }

    const data = JSON.parse(text);
    const baseUrl = data.base || `${ADOBE_PHOTOS_API}/spaces/${spaceId}/`;
    const resources = data.resources || data.assets || [];

    console.log(`  Found ${resources.length} assets`);

    // Fetch detailed info for each asset to get rendition URLs
    const photos: LightroomPhoto[] = [];

    for (const resource of resources) {
      const assetId = resource.asset?.id || resource.id;
      if (!assetId) continue;

      const photo = await fetchAssetDetails(spaceId, assetId, baseUrl);
      if (photo) {
        photos.push(photo);
      }
    }

    return photos;
  } catch (error) {
    console.error("Error fetching album assets:", error);
    return [];
  }
}

/**
 * Fetch detailed asset info including rendition URLs
 */
async function fetchAssetDetails(
  spaceId: string,
  assetId: string,
  baseUrl: string
): Promise<LightroomPhoto | null> {
  try {
    const apiUrl = `${LIGHTROOM_SHARES_API}/spaces/${spaceId}/assets/${assetId}?embed=renditions`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        Accept: "application/json",
        "x-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`  Failed to fetch asset ${assetId}: ${response.status}`);
      return null;
    }

    let text = await response.text();
    if (text.startsWith("while (1) {}")) {
      text = text.replace("while (1) {}", "").trim();
    }

    const asset = JSON.parse(text);
    return extractPhotoFromAsset(asset, baseUrl);
  } catch (error) {
    console.error(`Error fetching asset ${assetId}:`, error);
    return null;
  }
}

/**
 * Extract photo data from an asset with embedded renditions
 */
function extractPhotoFromAsset(
  asset: any,
  baseUrl: string
): LightroomPhoto | null {
  try {
    const id = asset.id;
    if (!id) return null;

    const links = asset.links || {};

    // Build full rendition URLs from links
    let imageUrl = "";
    let thumbnailUrl = "";

    // Get 2048px rendition (full size)
    if (links["/rels/rendition_type/2048"]?.href) {
      imageUrl = baseUrl + links["/rels/rendition_type/2048"].href;
    } else if (links["/rels/rendition_type/1280"]?.href) {
      imageUrl = baseUrl + links["/rels/rendition_type/1280"].href;
    }

    // Get thumbnail (640px or thumbnail2x)
    if (links["/rels/rendition_type/640"]?.href) {
      thumbnailUrl = baseUrl + links["/rels/rendition_type/640"].href;
    } else if (links["/rels/rendition_type/thumbnail2x"]?.href) {
      thumbnailUrl = baseUrl + links["/rels/rendition_type/thumbnail2x"].href;
    } else {
      thumbnailUrl = imageUrl;
    }

    if (!imageUrl) {
      console.log(`  No rendition URL found for asset ${id}`);
      return null;
    }

    // Extract metadata from payload
    const payload = asset.payload || {};
    const importSource = payload.importSource || {};
    const xmp = payload.xmp || {};
    const develop = payload.develop || {};

    // Extract EXIF data
    const exif = {
      camera: xmp.tiff?.Model || importSource.cameraModel,
      lens: xmp.aux?.Lens || xmp.exifEX?.LensModel,
      aperture: formatAperture(xmp.exif?.FNumber),
      shutterSpeed: formatShutterSpeed(xmp.exif?.ExposureTime),
      iso: xmp.exif?.ISOSpeedRatings?.toString(),
      focalLength: xmp.exif?.FocalLength,
    };

    // Extract location
    const location = {
      name: payload.location?.name,
      city: payload.location?.city,
      country: payload.location?.country,
      latitude: payload.location?.latitude,
      longitude: payload.location?.longitude,
    };

    // Use cropped dimensions from develop settings if available
    const width = develop.croppedWidth || importSource.originalWidth || 0;
    const height = develop.croppedHeight || importSource.originalHeight || 0;

    return {
      id,
      title: payload.title || payload.name || importSource.fileName,
      caption: payload.caption,
      url: imageUrl,
      thumbnailUrl,
      width,
      height,
      captureDate: payload.captureDate || xmp.photoshop?.DateCreated,
      exif,
      location,
    };
  } catch (error) {
    console.error("Error extracting photo from asset:", error);
    return null;
  }
}

/**
 * Alternative parser for different page formats
 */
function parseAlternativeFormat(
  html: string,
  galleryUrl: string
): LightroomGalleryData | null {
  // Try to find any embedded JSON with album/photo data
  const patterns = [
    /window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});/,
    /<script[^>]*id="__NEXT_DATA__"[^>]*>(\{[\s\S]*?\})<\/script>/,
    /data-initial-state='(\{[\s\S]*?\})'/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        // Try to extract photos from various possible structures
        const photos = findPhotosInObject(data);
        const title = findTitleInObject(data);

        if (photos.length > 0) {
          return { title: title || "Untitled Album", photos };
        }
      } catch (e) {
        continue;
      }
    }
  }

  // If nothing worked, try to extract image URLs directly from HTML
  const imgMatches = Array.from(html.matchAll(
    /https:\/\/[^"'\s]+\.adobe\.io\/[^"'\s]+renditions\/[^"'\s]+/g
  ));
  const photos: LightroomPhoto[] = [];

  for (let i = 0; i < imgMatches.length; i++) {
    photos.push({
      id: `photo-${i}`,
      url: imgMatches[i][0],
      thumbnailUrl: imgMatches[i][0],
      width: 0,
      height: 0,
    });
  }

  if (photos.length > 0) {
    return { title: "Lightroom Album", photos };
  }

  return null;
}

function findPhotosInObject(obj: any, depth = 0): LightroomPhoto[] {
  if (depth > 5) return [];

  if (Array.isArray(obj)) {
    // Check if this looks like a photos array
    if (obj.length > 0 && obj[0] && (obj[0].url || obj[0].href || obj[0].asset)) {
      return obj.map((item, i) => ({
        id: item.id || item.assetId || `photo-${i}`,
        url: item.url || item.href || "",
        thumbnailUrl: item.thumbnailUrl || item.url || "",
        width: item.width || 0,
        height: item.height || 0,
        title: item.title || item.name,
        caption: item.caption || item.description,
      }));
    }

    // Recursively search arrays
    for (const item of obj) {
      const found = findPhotosInObject(item, depth + 1);
      if (found.length > 0) return found;
    }
  } else if (obj && typeof obj === "object") {
    // Check common keys
    for (const key of ["photos", "assets", "images", "resources", "items"]) {
      if (obj[key]) {
        const found = findPhotosInObject(obj[key], depth + 1);
        if (found.length > 0) return found;
      }
    }

    // Recursively search object values
    for (const value of Object.values(obj)) {
      const found = findPhotosInObject(value, depth + 1);
      if (found.length > 0) return found;
    }
  }

  return [];
}

function findTitleInObject(obj: any, depth = 0): string | null {
  if (depth > 3) return null;

  if (obj && typeof obj === "object") {
    if (obj.title && typeof obj.title === "string") return obj.title;
    if (obj.name && typeof obj.name === "string") return obj.name;
    if (obj.albumTitle && typeof obj.albumTitle === "string") return obj.albumTitle;

    for (const value of Object.values(obj)) {
      const found = findTitleInObject(value, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function extractSpaceIdFromUrl(url: string): string | null {
  const match = url.match(/shares\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function formatAperture(fNumber: any): string | undefined {
  if (!fNumber) return undefined;
  try {
    // Handle arrays (some EXIF data comes as arrays)
    const value = Array.isArray(fNumber) ? fNumber[0] : fNumber;
    if (!value) return undefined;
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(num)) return undefined;
    return `f/${num.toFixed(1)}`;
  } catch {
    return undefined;
  }
}

function formatShutterSpeed(exposureTime: any): string | undefined {
  if (!exposureTime) return undefined;
  try {
    // Handle arrays (some EXIF data comes as arrays)
    const value = Array.isArray(exposureTime) ? exposureTime[0] : exposureTime;
    if (!value) return undefined;
    const time = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(time)) return undefined;

    if (time >= 1) {
      return `${time}s`;
    } else {
      return `1/${Math.round(1 / time)}s`;
    }
  } catch {
    return undefined;
  }
}

/**
 * Extract gallery ID from a Lightroom share URL
 */
export function extractGalleryId(url: string): string | null {
  const match = url.match(/lightroom\.adobe\.com\/shares\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Generate a slug from an album title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
