/**
 * Lightroom Photo Sync Service
 *
 * This script syncs photos from Lightroom galleries to your website database.
 *
 * Usage:
 *   npx tsx sync/index.ts              # Run once
 *   npx tsx sync/index.ts --watch      # Run continuously every 30 minutes
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import { config } from "./config";
import { parseGalleryUrl, generateSlug, extractGalleryId } from "./lightroom-parser";
import { generateThumbnails, thumbnailsExist } from "./thumbnail";
import {
  isAuthenticatedApiAvailable,
  fetchAuthenticatedCatalog,
  fetchAuthenticatedAlbumAssets,
  fetchAuthenticatedAlbums,
} from "./lightroom-authenticated";
import type { LightroomGalleryData } from "./types";

// Database setup
const dbPath = process.env.NODE_ENV === "production" && fs.existsSync("/app/data")
  ? "/app/data/photobook.db"
  : "./photobook.db";

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

// Cache for authenticated catalog data
let catalogId: string | null = null;
let catalogAssets: Map<string, { title?: string; caption?: string }> = new Map();

/**
 * Load metadata from authenticated Adobe API if available
 */
async function loadAuthenticatedMetadata(): Promise<void> {
  try {
    const token = await prisma.adobeToken.findUnique({ where: { id: "default" } });
    if (!token || new Date() > token.expiresAt) {
      console.log("Adobe API not authenticated - using public data only");
      return;
    }

    console.log("Loading metadata from authenticated Adobe API...");

    const catalog = await fetchAuthenticatedCatalog();
    if (!catalog?.id) {
      console.log("  Could not fetch catalog");
      return;
    }
    const catId = catalog.id;
    catalogId = catId;
    console.log(`  Catalog ID: ${catId}`);

    const albumsResponse = await fetchAuthenticatedAlbums(catId);
    const albums = albumsResponse?.resources || [];
    console.log(`  Found ${albums.length} albums in catalog`);

    for (const album of albums) {
      try {
        const assets = await fetchAuthenticatedAlbumAssets(catId, album.id);
        for (const asset of assets) {
          const title = asset.payload?.xmp?.dc?.title;
          const caption = asset.payload?.xmp?.dc?.description;

          if (title || caption) {
            catalogAssets.set(asset.id, {
              title: typeof title === "string" ? title : title?.[0],
              caption: typeof caption === "string" ? caption : caption?.[0],
            });
          }
        }
      } catch {
        // Continue with other albums
      }
    }

    console.log(`  Cached metadata for ${catalogAssets.size} assets`);
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
 * Sync a private album from authenticated Adobe API
 */
async function syncPrivateAlbum(gallery: {
  id: string;
  albumId: string;
  albumName: string | null;
  featured: boolean;
}): Promise<void> {
  console.log(`\nSyncing private album: ${gallery.albumName || gallery.albumId}`);

  const token = await prisma.adobeToken.findUnique({ where: { id: "default" } });
  if (!token || new Date() > token.expiresAt) {
    console.log("  Adobe API not authenticated - cannot sync private albums");
    return;
  }

  let catId: string;
  if (catalogId) {
    catId = catalogId;
  } else {
    const catalog = await fetchAuthenticatedCatalog();
    if (!catalog?.id) {
      console.log("  Could not fetch catalog");
      return;
    }
    catId = catalog.id;
    catalogId = catId;
  }

  try {
    console.log(`  Fetching assets for album: ${gallery.albumId}`);
    const assets = await fetchAuthenticatedAlbumAssets(catId, gallery.albumId);
    console.log(`  API returned ${assets.length} assets`);

    if (assets.length === 0) {
      console.log("  No assets found in album");
      return;
    }

    console.log(`  Found ${assets.length} assets`);

    const albumSlug = generateSlug(gallery.albumName || gallery.albumId);
    let coverImage = "";
    let albumLocation = "Unknown";
    let albumDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Process photos
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const assetId = asset.id;

      const renditionUrl = await getAssetRenditionUrl(catId, assetId, token.accessToken);
      if (!renditionUrl) {
        console.log(`  No rendition URL for ${assetId}, skipping`);
        continue;
      }

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

      if (i === 0) {
        coverImage = thumbnails.medium;
      }

      const payload = asset.payload || {};
      const xmp = payload.xmp || {};
      const location = payload.location || {};

      const title = xmp.dc?.title;
      const caption = xmp.dc?.description;
      const photoTitle =
        (typeof title === "string" ? title : title?.[0]) ||
        payload.importSource?.fileName ||
        `Photo ${i + 1}`;
      const photoCaption = typeof caption === "string" ? caption : caption?.[0];

      if (location.country && i === 0) {
        albumLocation = location.city
          ? `${location.city}, ${location.country}`
          : location.country;
      }

      if (payload.captureDate && i === 0) {
        albumDate = formatDate(payload.captureDate) || albumDate;
      }

      // Upsert photo to database
      await prisma.photo.upsert({
        where: { id: assetId },
        update: {
          title: photoTitle,
          caption: photoCaption,
          sortOrder: i,
          thumbPath: thumbnails.thumb,
          mediumPath: thumbnails.medium,
          fullPath: thumbnails.full,
          originalUrl: renditionUrl,
          date: formatDate(payload.captureDate) || albumDate,
          location: location.country || albumLocation,
          width: payload.develop?.croppedWidth || payload.importSource?.originalWidth,
          height: payload.develop?.croppedHeight || payload.importSource?.originalHeight,
          camera: xmp.tiff?.Model || payload.importSource?.cameraModel,
          lens: xmp.aux?.Lens || xmp.exifEX?.LensModel,
          aperture: formatAperture(xmp.exif?.FNumber),
          shutterSpeed: formatShutterSpeed(xmp.exif?.ExposureTime),
          iso: xmp.exif?.ISOSpeedRatings?.toString(),
          latitude: location.latitude,
          longitude: location.longitude,
        },
        create: {
          id: assetId,
          albumId: gallery.albumId,
          title: photoTitle,
          caption: photoCaption,
          sortOrder: i,
          thumbPath: thumbnails.thumb,
          mediumPath: thumbnails.medium,
          fullPath: thumbnails.full,
          originalUrl: renditionUrl,
          date: formatDate(payload.captureDate) || albumDate,
          location: location.country || albumLocation,
          width: payload.develop?.croppedWidth || payload.importSource?.originalWidth,
          height: payload.develop?.croppedHeight || payload.importSource?.originalHeight,
          camera: xmp.tiff?.Model || payload.importSource?.cameraModel,
          lens: xmp.aux?.Lens || xmp.exifEX?.LensModel,
          aperture: formatAperture(xmp.exif?.FNumber),
          shutterSpeed: formatShutterSpeed(xmp.exif?.ExposureTime),
          iso: xmp.exif?.ISOSpeedRatings?.toString(),
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }

    // Get photo count
    const photoCount = await prisma.photo.count({ where: { albumId: gallery.albumId } });

    // Upsert album to database
    await prisma.album.upsert({
      where: { id: gallery.albumId },
      update: {
        title: gallery.albumName || "Untitled Album",
        location: albumLocation,
        date: albumDate,
        coverImage,
        photoCount,
        featured: gallery.featured,
        lastSynced: new Date(),
        galleryId: gallery.id,
      },
      create: {
        id: gallery.albumId,
        slug: albumSlug,
        title: gallery.albumName || "Untitled Album",
        location: albumLocation,
        date: albumDate,
        coverImage,
        photoCount,
        featured: gallery.featured,
        galleryUrl: `private:${gallery.albumId}`,
        lastSynced: new Date(),
        galleryId: gallery.id,
      },
    });

    console.log(`  Synced ${photoCount} photos`);
  } catch (error) {
    console.error(`  Error syncing private album:`, error);
  }
}

/**
 * Sync a public gallery
 */
async function syncPublicGallery(gallery: {
  id: string;
  url: string;
  featured: boolean;
}): Promise<void> {
  console.log(`\nSyncing gallery: ${gallery.url}`);

  const galleryData = await parseGalleryUrl(gallery.url);
  if (!galleryData) {
    console.log("  Could not parse gallery, skipping");
    return;
  }

  const galleryId = extractGalleryId(gallery.url) || generateSlug(galleryData.title);
  const albumSlug = generateSlug(galleryData.title);

  console.log(`  Album: ${galleryData.title} (${galleryData.photos.length} photos)`);

  const { location: titleLocation, date: titleDate } = extractLocationAndDate(galleryData);
  const photoDate = calculateAlbumDateFromPhotos(galleryData.photos);
  const photoLocation = extractLocationFromPhotos(galleryData.photos);

  const albumLocation = titleLocation || photoLocation || "Unknown";
  const albumDate =
    titleDate ||
    photoDate ||
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let coverImage = "";

  // Process photos
  for (let i = 0; i < galleryData.photos.length; i++) {
    const lrPhoto = galleryData.photos[i];

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

    if (i === 0) {
      coverImage = thumbnails.medium;
    }

    const authMeta = getAuthenticatedMetadata(lrPhoto.id);
    const photoTitle = authMeta.title || lrPhoto.title || lrPhoto.caption || `Photo ${i + 1}`;
    const photoCaption = authMeta.caption || lrPhoto.caption;

    // Upsert photo to database
    await prisma.photo.upsert({
      where: { id: lrPhoto.id },
      update: {
        title: photoTitle,
        caption: photoCaption,
        sortOrder: i,
        thumbPath: thumbnails.thumb,
        mediumPath: thumbnails.medium,
        fullPath: thumbnails.full,
        originalUrl: lrPhoto.url,
        date: formatDate(lrPhoto.captureDate) || albumDate,
        location: lrPhoto.location?.country || albumLocation,
        width: lrPhoto.width,
        height: lrPhoto.height,
        camera: lrPhoto.exif?.camera,
        lens: lrPhoto.exif?.lens,
        aperture: lrPhoto.exif?.aperture,
        shutterSpeed: lrPhoto.exif?.shutterSpeed,
        iso: lrPhoto.exif?.iso,
        latitude: lrPhoto.location?.latitude,
        longitude: lrPhoto.location?.longitude,
      },
      create: {
        id: lrPhoto.id,
        albumId: galleryId,
        title: photoTitle,
        caption: photoCaption,
        sortOrder: i,
        thumbPath: thumbnails.thumb,
        mediumPath: thumbnails.medium,
        fullPath: thumbnails.full,
        originalUrl: lrPhoto.url,
        date: formatDate(lrPhoto.captureDate) || albumDate,
        location: lrPhoto.location?.country || albumLocation,
        width: lrPhoto.width,
        height: lrPhoto.height,
        camera: lrPhoto.exif?.camera,
        lens: lrPhoto.exif?.lens,
        aperture: lrPhoto.exif?.aperture,
        shutterSpeed: lrPhoto.exif?.shutterSpeed,
        iso: lrPhoto.exif?.iso,
        latitude: lrPhoto.location?.latitude,
        longitude: lrPhoto.location?.longitude,
      },
    });
  }

  // Get photo count
  const photoCount = await prisma.photo.count({ where: { albumId: galleryId } });

  // Upsert album to database
  await prisma.album.upsert({
    where: { id: galleryId },
    update: {
      title: galleryData.title,
      location: albumLocation,
      date: albumDate,
      coverImage,
      photoCount,
      featured: gallery.featured,
      lastSynced: new Date(),
      galleryId: gallery.id,
    },
    create: {
      id: galleryId,
      slug: albumSlug,
      title: galleryData.title,
      location: albumLocation,
      date: albumDate,
      coverImage,
      photoCount,
      featured: gallery.featured,
      galleryUrl: gallery.url,
      lastSynced: new Date(),
      galleryId: gallery.id,
    },
  });

  console.log(`  Synced ${photoCount} photos`);
}

/**
 * Get rendition URL for an asset from authenticated API
 */
async function getAssetRenditionUrl(
  catId: string,
  assetId: string,
  accessToken: string
): Promise<string | null> {
  try {
    const url = `https://lr.adobe.io/v2/catalogs/${catId}/assets/${assetId}/renditions/2048`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-API-Key": process.env.ADOBE_CLIENT_ID!,
      },
      redirect: "manual",
    });

    if (response.status === 302 || response.status === 303) {
      return response.headers.get("location");
    }

    if (response.ok) {
      const data = (await response.json()) as { href?: string; url?: string };
      return data.href || data.url || null;
    }

    // Log the error for debugging
    console.log(`    Rendition error for ${assetId}: ${response.status}`);
    return null;
  } catch (error) {
    console.log(`    Rendition exception for ${assetId}:`, error);
    return null;
  }
}

function formatAperture(fNumber: unknown): string | undefined {
  if (!fNumber) return undefined;
  const value = Array.isArray(fNumber) ? fNumber[0] : fNumber;
  if (!value) return undefined;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return undefined;
  return `f/${num.toFixed(1)}`;
}

function formatShutterSpeed(exposureTime: unknown): string | undefined {
  if (!exposureTime) return undefined;
  const value = Array.isArray(exposureTime) ? exposureTime[0] : exposureTime;
  if (!value) return undefined;
  const time = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(time)) return undefined;
  return time >= 1 ? `${time}s` : `1/${Math.round(1 / time)}s`;
}

function extractLocationAndDate(data: LightroomGalleryData): {
  location?: string;
  date?: string;
} {
  const title = data.title;
  const patterns = [
    /^(.+?)\s*[-–]\s*(\w+\.?\s+\d{4})$/,
    /^(.+?)\s*[-–]\s*(\w+\.?\s+'\d{2})$/,
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

  if (
    earliest.getMonth() === latest.getMonth() &&
    earliest.getFullYear() === latest.getFullYear()
  ) {
    return earliest.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  if (earliest.getFullYear() === latest.getFullYear()) {
    const startMonth = earliest.toLocaleDateString("en-US", { month: "short" });
    const endMonth = latest.toLocaleDateString("en-US", { month: "short" });
    return `${startMonth} - ${endMonth} ${earliest.getFullYear()}`;
  }

  const start = earliest.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const end = latest.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${start} - ${end}`;
}

function extractLocationFromPhotos(photos: LightroomGalleryData["photos"]): string | undefined {
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

  // Load authenticated metadata first
  await loadAuthenticatedMetadata();

  // Get all galleries from database
  const galleries = await prisma.gallery.findMany();

  if (galleries.length === 0) {
    console.log("\nNo galleries configured!");
    console.log("Add galleries via the admin interface at /admin");
    return;
  }

  console.log(`\nFound ${galleries.length} configured galleries`);

  for (const gallery of galleries) {
    if (gallery.type === "private" && gallery.albumId) {
      await syncPrivateAlbum({
        id: gallery.id,
        albumId: gallery.albumId,
        albumName: gallery.albumName,
        featured: gallery.featured,
      });
    } else if (gallery.url) {
      await syncPublicGallery({
        id: gallery.id,
        url: gallery.url,
        featured: gallery.featured,
      });
    }
  }

  const albumCount = await prisma.album.count();
  const photoCount = await prisma.photo.count();

  console.log("\nSync complete!");
  console.log(`Total albums: ${albumCount}`);
  console.log(`Total photos: ${photoCount}`);
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);

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
  npx tsx sync/index.ts --help       Show this help

Note: Galleries are now managed via the admin interface at /admin
`);
    return;
  }

  // Default: run once
  await runSync();
  await prisma.$disconnect();
}

main().catch(console.error);
