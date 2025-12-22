/**
 * Lightroom Photo Sync Service
 *
 * This script syncs photos from public Lightroom galleries to your website.
 *
 * Usage:
 *   npx tsx sync/index.ts              # Run once
 *   npx tsx sync/index.ts --watch      # Run continuously every 30 minutes
 *   npx tsx sync/index.ts --add <url>  # Add a new gallery URL
 */

import fs from "fs/promises";
import path from "path";
import { config } from "./config";
import { parseGalleryUrl, generateSlug, extractGalleryId } from "./lightroom-parser";
import { generateThumbnails, thumbnailsExist } from "./thumbnail";
import {
  loadManifest,
  saveManifest,
  updateAlbum,
  updatePhotos,
  generateDataFile,
} from "./manifest";
import {
  isAuthenticatedApiAvailable,
  fetchAuthenticatedCatalog,
  fetchAuthenticatedAlbumAssets,
  fetchAuthenticatedAlbums,
} from "./lightroom-authenticated";
import type { SyncAlbum, SyncPhoto, LightroomGalleryData } from "./types";

// Cache for authenticated catalog data
let catalogId: string | null = null;
let catalogAssets: Map<string, { title?: string; caption?: string }> = new Map();

// Store gallery URLs in a separate file
const GALLERIES_FILE = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/galleries.json" : "sync/galleries.json"
);

interface GalleryEntry {
  url?: string;            // For public galleries
  albumId?: string;        // For private albums (from authenticated API)
  albumName?: string;      // Name of the private album
  type?: "public" | "private";
  tag?: string;            // Optional tag for filtering
  featured?: boolean;
}

async function loadGalleries(): Promise<GalleryEntry[]> {
  try {
    const data = await fs.readFile(GALLERIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveGalleries(galleries: GalleryEntry[]): Promise<void> {
  await fs.writeFile(GALLERIES_FILE, JSON.stringify(galleries, null, 2), "utf-8");
}

/**
 * Load metadata from authenticated Adobe API if available
 * This gives us access to titles and captions that aren't in the public API
 */
async function loadAuthenticatedMetadata(): Promise<void> {
  try {
    const isAvailable = await isAuthenticatedApiAvailable();
    if (!isAvailable) {
      console.log("Adobe API not authenticated - using public data only");
      return;
    }

    console.log("Loading metadata from authenticated Adobe API...");

    // Get catalog
    const catalog = await fetchAuthenticatedCatalog();
    if (!catalog?.id) {
      console.log("  Could not fetch catalog");
      return;
    }
    const catId = catalog.id;
    catalogId = catId;
    console.log(`  Catalog ID: ${catId}`);

    // Get all albums
    const albumsResponse = await fetchAuthenticatedAlbums(catId);
    const albums = albumsResponse?.resources || [];
    console.log(`  Found ${albums.length} albums in catalog`);

    // Load assets from all albums to build our metadata cache
    for (const album of albums) {
      try {
        const assets = await fetchAuthenticatedAlbumAssets(catId, album.id);
        for (const asset of assets) {
          const title = asset.payload?.xmp?.dc?.title;
          const caption = asset.payload?.xmp?.dc?.description;

          if (title || caption) {
            catalogAssets.set(asset.id, {
              title: typeof title === 'string' ? title : title?.[0],
              caption: typeof caption === 'string' ? caption : caption?.[0]
            });
          }
        }
      } catch (err) {
        // Continue with other albums
      }
    }

    console.log(`  Cached metadata for ${catalogAssets.size} assets with titles/captions`);
  } catch (error) {
    console.log("  Failed to load authenticated metadata:", error);
  }
}

/**
 * Get enriched title/caption from authenticated API cache
 */
function getAuthenticatedMetadata(assetId: string): { title?: string; caption?: string } {
  return catalogAssets.get(assetId) || {};
}

/**
 * Sync a private album directly from authenticated Adobe API
 */
async function syncPrivateAlbum(
  entry: GalleryEntry,
  manifest: ReturnType<typeof loadManifest> extends Promise<infer T> ? T : never
): Promise<typeof manifest> {
  const { albumId, albumName, featured } = entry;

  if (!albumId) {
    console.log("  No album ID provided, skipping");
    return manifest;
  }

  console.log(`\nSyncing private album: ${albumName || albumId}`);

  const isAvailable = await isAuthenticatedApiAvailable();
  if (!isAvailable) {
    console.log("  Adobe API not authenticated - cannot sync private albums");
    return manifest;
  }

  // Get catalog ID if not already loaded
  let catId: string;
  if (catalogId) {
    catId = catalogId;
  } else {
    const catalog = await fetchAuthenticatedCatalog();
    if (!catalog?.id) {
      console.log("  Could not fetch catalog");
      return manifest;
    }
    catId = catalog.id;
    catalogId = catId;
  }

  try {
    // Fetch assets from the private album
    const assets = await fetchAuthenticatedAlbumAssets(catId, albumId);

    if (assets.length === 0) {
      console.log("  No assets found in album");
      return manifest;
    }

    console.log(`  Found ${assets.length} assets`);

    // Generate slug from album name
    const albumSlug = generateSlug(albumName || albumId);

    // Create album entry
    const album: SyncAlbum = {
      id: albumId,
      slug: albumSlug,
      title: albumName || "Untitled Album",
      description: undefined,
      location: "Unknown",
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      coverImage: "",
      photoCount: assets.length,
      featured: featured || false,
      galleryUrl: `private:${albumId}`,
      lastSynced: new Date().toISOString(),
    };

    // Process photos
    const photos: SyncPhoto[] = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const assetId = asset.id;

      // Get rendition URL from authenticated API
      const renditionUrl = await getAssetRenditionUrl(catId, assetId);
      if (!renditionUrl) {
        console.log(`  No rendition URL for ${assetId}, skipping`);
        continue;
      }

      // Check if thumbnails already exist
      const exists = await thumbnailsExist(albumSlug, assetId);
      let thumbnails;

      if (exists) {
        console.log(`  Skipping ${assetId} (already exists)`);
        thumbnails = {
          thumb: `/photos/${albumSlug}/thumb/${assetId}.jpg`,
          medium: `/photos/${albumSlug}/medium/${assetId}.jpg`,
          full: `/photos/${albumSlug}/full/${assetId}.jpg`,
        };
      } else {
        thumbnails = await generateThumbnails(renditionUrl, albumSlug, assetId);
      }

      if (!thumbnails) {
        console.log(`  Failed to process ${assetId}, skipping`);
        continue;
      }

      // Use first photo as cover
      if (i === 0) {
        album.coverImage = thumbnails.medium;
      }

      // Extract metadata from asset payload
      const payload = asset.payload || {};
      const xmp = payload.xmp || {};
      const location = payload.location || {};

      // Get title and caption from XMP (authenticated API has this!)
      const title = xmp.dc?.title;
      const caption = xmp.dc?.description;
      const photoTitle = (typeof title === 'string' ? title : title?.[0]) ||
                         payload.importSource?.fileName ||
                         `Photo ${i + 1}`;
      const photoCaption = typeof caption === 'string' ? caption : caption?.[0];

      // Extract location from payload
      if (location.country) {
        album.location = location.city
          ? `${location.city}, ${location.country}`
          : location.country;
      }

      // Extract date from capture date
      if (payload.captureDate && i === 0) {
        album.date = formatDate(payload.captureDate) || album.date;
      }

      const photo: SyncPhoto = {
        id: assetId,
        title: photoTitle,
        description: photoCaption,
        src: {
          thumb: thumbnails.thumb,
          medium: thumbnails.medium,
          full: thumbnails.full,
          original: renditionUrl,
        },
        metadata: {
          date: formatDate(payload.captureDate) || album.date,
          location: location.country || album.location,
          locationDetail: location.city || location.name || undefined,
          camera: xmp.tiff?.Model || payload.importSource?.cameraModel,
          lens: xmp.aux?.Lens || xmp.exifEX?.LensModel,
          aperture: formatAperture(xmp.exif?.FNumber),
          shutter: formatShutterSpeed(xmp.exif?.ExposureTime),
          iso: xmp.exif?.ISOSpeedRatings?.toString(),
          width: payload.develop?.croppedWidth || payload.importSource?.originalWidth,
          height: payload.develop?.croppedHeight || payload.importSource?.originalHeight,
          gps: location.latitude && location.longitude
            ? { lat: location.latitude, lng: location.longitude }
            : undefined,
        },
        albumId: albumId,
        sortOrder: i,
      };

      photos.push(photo);
    }

    // Update manifest
    manifest = updateAlbum(manifest, album);
    manifest = updatePhotos(manifest, albumId, photos);

    console.log(`  Synced ${photos.length} photos`);

    return manifest;
  } catch (error) {
    console.error(`  Error syncing private album:`, error);
    return manifest;
  }
}

/**
 * Get rendition URL for an asset from authenticated API
 */
async function getAssetRenditionUrl(catId: string, assetId: string): Promise<string | null> {
  try {
    const tokens = await loadTokensForSync();
    if (!tokens) return null;

    const response = await fetch(
      `https://lr.adobe.io/v2/catalogs/${catId}/assets/${assetId}/renditions/2048`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "X-API-Key": process.env.ADOBE_CLIENT_ID!,
        },
        redirect: "manual",
      }
    );

    // The API returns a redirect to the actual image URL
    if (response.status === 302 || response.status === 303) {
      return response.headers.get("location");
    }

    // Or it might return the URL in JSON
    if (response.ok) {
      const data = await response.json();
      return data.href || data.url || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Load tokens for sync script
 */
async function loadTokensForSync() {
  const tokensFile = path.join(
    process.cwd(),
    process.env.NODE_ENV === "production" ? "data/adobe-tokens.json" : "adobe-tokens.json"
  );
  try {
    const data = await fs.readFile(tokensFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function formatAperture(fNumber: any): string | undefined {
  if (!fNumber) return undefined;
  const value = Array.isArray(fNumber) ? fNumber[0] : fNumber;
  if (!value) return undefined;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return undefined;
  return `f/${num.toFixed(1)}`;
}

function formatShutterSpeed(exposureTime: any): string | undefined {
  if (!exposureTime) return undefined;
  const value = Array.isArray(exposureTime) ? exposureTime[0] : exposureTime;
  if (!value) return undefined;
  const time = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(time)) return undefined;
  return time >= 1 ? `${time}s` : `1/${Math.round(1 / time)}s`;
}

async function addGallery(url: string, tag?: string, featured?: boolean): Promise<void> {
  const galleries = await loadGalleries();

  // Check if already exists
  if (galleries.some((g) => g.url === url)) {
    console.log("Gallery already exists:", url);
    return;
  }

  galleries.push({ url, tag, featured });
  await saveGalleries(galleries);
  console.log("Added gallery:", url);
}

async function syncGallery(
  entry: GalleryEntry,
  manifest: ReturnType<typeof loadManifest> extends Promise<infer T> ? T : never
): Promise<typeof manifest> {
  const { url, tag, featured } = entry;

  if (!url) {
    console.log("  No URL provided, skipping");
    return manifest;
  }

  console.log(`\nSyncing gallery: ${url}`);

  // Check if gallery has the required tag
  const galleryData = await parseGalleryUrl(url);
  if (!galleryData) {
    console.log("  Could not parse gallery, skipping");
    return manifest;
  }

  // Check for tag in title or description
  const hasTag =
    !config.syncTag ||
    galleryData.title.toLowerCase().includes(config.syncTag.toLowerCase()) ||
    galleryData.description?.toLowerCase().includes(config.syncTag.toLowerCase()) ||
    tag === config.syncTag;

  if (!hasTag && config.syncTag) {
    console.log(`  Gallery doesn't have tag "${config.syncTag}", skipping`);
    return manifest;
  }

  const galleryId = extractGalleryId(url) || generateSlug(galleryData.title);
  const albumSlug = generateSlug(galleryData.title);

  console.log(`  Album: ${galleryData.title} (${galleryData.photos.length} photos)`);

  // Extract location and date from title/description
  const { location: titleLocation, date: titleDate } = extractLocationAndDate(galleryData);

  // Get date from photo capture dates if not in title
  const photoDate = calculateAlbumDateFromPhotos(galleryData.photos);

  // Get location from photo GPS data if not in title
  const photoLocation = extractLocationFromPhotos(galleryData.photos);

  // Create album entry
  const album: SyncAlbum = {
    id: galleryId,
    slug: albumSlug,
    title: galleryData.title,
    description: galleryData.description,
    location: titleLocation || photoLocation || "Unknown",
    date: titleDate || photoDate || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    coverImage: "", // Will be set from first photo
    photoCount: galleryData.photos.length,
    featured: featured || false,
    galleryUrl: url,
    lastSynced: new Date().toISOString(),
  };

  // Process photos
  const photos: SyncPhoto[] = [];

  for (let i = 0; i < galleryData.photos.length; i++) {
    const lrPhoto = galleryData.photos[i];

    // Check if thumbnails already exist (skip if so for incremental sync)
    const exists = await thumbnailsExist(albumSlug, lrPhoto.id);
    let thumbnails;

    if (exists) {
      console.log(`  Skipping ${lrPhoto.id} (already exists)`);
      thumbnails = {
        thumb: `/photos/${albumSlug}/thumb/${lrPhoto.id}.jpg`,
        medium: `/photos/${albumSlug}/medium/${lrPhoto.id}.jpg`,
        full: `/photos/${albumSlug}/full/${lrPhoto.id}.jpg`,
      };
    } else {
      thumbnails = await generateThumbnails(lrPhoto.url, albumSlug, lrPhoto.id);
    }

    if (!thumbnails) {
      console.log(`  Failed to process ${lrPhoto.id}, skipping`);
      continue;
    }

    // Use first photo as cover
    if (i === 0) {
      album.coverImage = thumbnails.medium;
    }

    // Get enriched metadata from authenticated API if available
    const authMeta = getAuthenticatedMetadata(lrPhoto.id);
    const photoTitle = authMeta.title || lrPhoto.title || lrPhoto.caption || `Photo ${i + 1}`;
    const photoCaption = authMeta.caption || lrPhoto.caption;

    const photo: SyncPhoto = {
      id: lrPhoto.id,
      title: photoTitle,
      description: photoCaption,
      src: {
        thumb: thumbnails.thumb,
        medium: thumbnails.medium,
        full: thumbnails.full,
        original: lrPhoto.url,
      },
      metadata: {
        date: formatDate(lrPhoto.captureDate) || album.date,
        location: lrPhoto.location?.country || album.location,
        locationDetail:
          lrPhoto.location?.city ||
          lrPhoto.location?.name ||
          undefined,
        camera: lrPhoto.exif?.camera,
        lens: lrPhoto.exif?.lens,
        aperture: lrPhoto.exif?.aperture,
        shutter: lrPhoto.exif?.shutterSpeed,
        iso: lrPhoto.exif?.iso,
        width: lrPhoto.width,
        height: lrPhoto.height,
        gps:
          lrPhoto.location?.latitude && lrPhoto.location?.longitude
            ? { lat: lrPhoto.location.latitude, lng: lrPhoto.location.longitude }
            : undefined,
      },
      albumId: galleryId,
      sortOrder: i,
    };

    photos.push(photo);
  }

  // Update manifest
  manifest = updateAlbum(manifest, album);
  manifest = updatePhotos(manifest, galleryId, photos);

  console.log(`  Synced ${photos.length} photos`);

  return manifest;
}

function extractLocationAndDate(data: LightroomGalleryData): {
  location?: string;
  date?: string;
} {
  // Try to extract from title patterns like "Japan 2023" or "Kyoto, Japan - October 2023"
  const title = data.title;

  // Pattern: "Location - Month Year" or "Location Month Year"
  const patterns = [
    /^(.+?)\s*[-–]\s*(\w+\.?\s+\d{4})$/,  // "Rome - Sept. 23" or "Rome - September 2023"
    /^(.+?)\s*[-–]\s*(\w+\.?\s+'\d{2})$/,  // "Rome - Sept. '23"
    /^(.+?)\s+(\w+\.?\s+\d{4})$/,
    /^(.+?)\s+(\d{4})$/,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return {
        location: match[1].trim(),
        date: match[2].trim(),
      };
    }
  }

  return {};
}

/**
 * Calculate album date range from photo capture dates
 */
function calculateAlbumDateFromPhotos(photos: LightroomGalleryData["photos"]): string | undefined {
  const dates = photos
    .map((p) => p.captureDate)
    .filter((d): d is string => !!d)
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return undefined;

  const earliest = dates[0];
  const latest = dates[dates.length - 1];

  // If same month and year
  if (
    earliest.getMonth() === latest.getMonth() &&
    earliest.getFullYear() === latest.getFullYear()
  ) {
    return earliest.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  // If same year but different months
  if (earliest.getFullYear() === latest.getFullYear()) {
    const startMonth = earliest.toLocaleDateString("en-US", { month: "short" });
    const endMonth = latest.toLocaleDateString("en-US", { month: "short" });
    return `${startMonth} - ${endMonth} ${earliest.getFullYear()}`;
  }

  // Different years
  const start = earliest.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const end = latest.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${start} - ${end}`;
}

/**
 * Extract primary location from photo GPS/location data
 */
function extractLocationFromPhotos(photos: LightroomGalleryData["photos"]): string | undefined {
  // Count occurrences of each location
  const locationCounts = new Map<string, number>();

  for (const photo of photos) {
    if (photo.location?.country) {
      const loc = photo.location.city
        ? `${photo.location.city}, ${photo.location.country}`
        : photo.location.country;
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
    }
  }

  if (locationCounts.size === 0) return undefined;

  // Return most common location
  let maxCount = 0;
  let primaryLocation: string | undefined;

  Array.from(locationCounts.entries()).forEach(([loc, count]) => {
    if (count > maxCount) {
      maxCount = count;
      primaryLocation = loc;
    }
  });

  return primaryLocation;
}

function formatDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;

  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return undefined;
  }
}

async function runSync(): Promise<void> {
  console.log("Starting Lightroom sync...");
  console.log(`Sync tag filter: "${config.syncTag}"`);

  // Load authenticated metadata first (for titles/captions)
  await loadAuthenticatedMetadata();

  let manifest = await loadManifest();
  const galleries = await loadGalleries();

  if (galleries.length === 0) {
    console.log("\nNo galleries configured!");
    console.log("Add a gallery with: npx tsx sync/index.ts --add <url>");
    console.log("Example: npx tsx sync/index.ts --add https://lightroom.adobe.com/shares/abc123");
    return;
  }

  console.log(`\nFound ${galleries.length} configured galleries`);

  for (const entry of galleries) {
    // Handle private albums vs public galleries
    if (entry.type === "private" || entry.albumId) {
      manifest = await syncPrivateAlbum(entry, manifest);
    } else if (entry.url) {
      manifest = await syncGallery(entry, manifest);
    }
  }

  // Save manifest
  await saveManifest(manifest);

  // Generate TypeScript data file
  await generateDataFile(manifest);

  console.log("\nSync complete!");
  console.log(`Total albums: ${manifest.albums.length}`);
  console.log(`Total photos: ${manifest.photos.length}`);
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--add" && args[1]) {
    const url = args[1];
    const tag = args.includes("--tag") ? args[args.indexOf("--tag") + 1] : undefined;
    const featured = args.includes("--featured");
    await addGallery(url, tag, featured);
    console.log("\nRun sync to download photos: npx tsx sync/index.ts");
    return;
  }

  if (args[0] === "--watch") {
    console.log(`Running in watch mode (every ${config.syncInterval / 60000} minutes)`);
    await runSync();
    setInterval(runSync, config.syncInterval);
    return;
  }

  if (args[0] === "--help") {
    console.log(`
Lightroom Sync Service

Usage:
  npx tsx sync/index.ts              Run sync once
  npx tsx sync/index.ts --watch      Run continuously
  npx tsx sync/index.ts --add <url>  Add a gallery URL
  npx tsx sync/index.ts --help       Show this help

Options for --add:
  --tag <tag>      Mark gallery with a tag
  --featured       Mark as featured album

Configuration:
  Edit sync/config.ts to change:
  - syncTag: Only sync albums containing this tag (default: "portfolio")
  - imageSizes: Thumbnail dimensions
  - syncInterval: How often to sync in watch mode
`);
    return;
  }

  // Default: run once
  await runSync();
}

main().catch(console.error);
