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
  fetchAuthenticatedAsset,
} from "./lightroom-authenticated";
import type { LightroomGalleryData } from "./types";
import type { SyncProgress, ProgressCallback } from "./progress-types";

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
          // Use the actual catalog asset ID
          const catalogAssetId = asset.asset?.id || asset.id;
          const title = asset.payload?.xmp?.dc?.title;
          const caption = asset.payload?.xmp?.dc?.description;

          if (title || caption) {
            catalogAssets.set(catalogAssetId, {
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
async function syncPrivateAlbum(
  gallery: {
    id: string;
    albumId: string;
    albumName: string | null;
    featured: boolean;
  },
  onProgress?: (photoIndex: number, totalPhotos: number, photoName: string) => void
): Promise<void> {
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

    // Create album first (required for photo foreign key)
    await prisma.album.upsert({
      where: { id: gallery.albumId },
      update: {},
      create: {
        id: gallery.albumId,
        slug: albumSlug,
        title: gallery.albumName || "Untitled Album",
        galleryUrl: `private:${gallery.albumId}`,
        galleryId: gallery.id,
      },
    });

    // Process photos
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      // Use the actual catalog asset ID, not the album-asset relationship ID
      const catalogAssetId = asset.asset?.id || asset.id;
      // Use catalog asset ID for storage/display
      const assetId = catalogAssetId;

      // Report progress
      const photoName = asset.payload?.importSource?.fileName || `Photo ${i + 1}`;
      onProgress?.(i, assets.length, photoName);

      const renditionUrl = await getAssetRenditionUrl(catId, catalogAssetId, token.accessToken);
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
        // Pass auth headers for Adobe API URLs
        const authHeaders = renditionUrl.includes("lr.adobe.io")
          ? {
              Authorization: `Bearer ${token.accessToken}`,
              "X-API-Key": process.env.ADOBE_CLIENT_ID!,
            }
          : undefined;
        thumbnails = await generateThumbnails(renditionUrl, albumSlug, assetId, authHeaders);
      }

      if (!thumbnails) {
        console.log(`  Failed to process ${assetId}, skipping`);
        continue;
      }

      // Use first successfully processed photo as cover
      if (!coverImage) {
        coverImage = thumbnails.medium;
      }

      // Fetch full asset metadata (album assets response has minimal data)
      const fullAsset = await fetchAuthenticatedAsset(catId, catalogAssetId);
      const payload = fullAsset?.payload || asset.payload || {};
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
          camera: formatCamera(xmp.tiff?.Make, xmp.tiff?.Model) || payload.importSource?.cameraModel,
          lens: xmp.aux?.Lens || xmp.exifEX?.LensModel,
          aperture: formatAperture(xmp.exif?.FNumber),
          shutterSpeed: formatShutterSpeed(xmp.exif?.ExposureTime),
          iso: xmp.exif?.ISOSpeedRatings?.toString(),
          focalLength: formatFocalLength(xmp.exif?.FocalLength),
          city: location.city,
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
          camera: formatCamera(xmp.tiff?.Make, xmp.tiff?.Model) || payload.importSource?.cameraModel,
          lens: xmp.aux?.Lens || xmp.exifEX?.LensModel,
          aperture: formatAperture(xmp.exif?.FNumber),
          shutterSpeed: formatShutterSpeed(xmp.exif?.ExposureTime),
          iso: xmp.exif?.ISOSpeedRatings?.toString(),
          focalLength: formatFocalLength(xmp.exif?.FocalLength),
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }

    // Get photo count
    const photoCount = await prisma.photo.count({ where: { albumId: gallery.albumId } });

    // Check if album exists and has manual overrides
    const existingAlbum = await prisma.album.findUnique({
      where: { id: gallery.albumId },
      select: { title: true, location: true, date: true },
    });

    // Upsert album to database - preserve manual overrides
    await prisma.album.upsert({
      where: { id: gallery.albumId },
      update: {
        // Only update title/location/date if not manually set (keep existing values if they exist)
        title: existingAlbum?.title || gallery.albumName || "Untitled Album",
        location: existingAlbum?.location || albumLocation,
        date: existingAlbum?.date || albumDate,
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
async function syncPublicGallery(
  gallery: {
    id: string;
    url: string;
    featured: boolean;
  },
  onProgress?: (photoIndex: number, totalPhotos: number, photoName: string) => void
): Promise<void> {
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

    // Report progress
    const photoName = lrPhoto.title || lrPhoto.caption || `Photo ${i + 1}`;
    onProgress?.(i, galleryData.photos.length, photoName);

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

    // Use first successfully processed photo as cover
    if (!coverImage) {
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

  // Check if album exists and has manual overrides
  const existingAlbum = await prisma.album.findUnique({
    where: { id: galleryId },
    select: { title: true, location: true, date: true },
  });

  // Upsert album to database - preserve manual overrides
  await prisma.album.upsert({
    where: { id: galleryId },
    update: {
      // Only update title/location/date if not manually set (keep existing values if they exist)
      title: existingAlbum?.title || galleryData.title,
      location: existingAlbum?.location || albumLocation,
      date: existingAlbum?.date || albumDate,
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
 * Generate rendition for an asset (required for 2560 and fullsize)
 */
async function generateRendition(
  catId: string,
  assetId: string,
  accessToken: string,
  renditionType: "2560" | "fullsize"
): Promise<boolean> {
  try {
    const url = `https://lr.adobe.io/v2/catalogs/${catId}/assets/${assetId}/renditions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-API-Key": process.env.ADOBE_CLIENT_ID!,
        "X-Generate-Renditions": renditionType,
        "Content-Length": "0",
      },
    });

    // 202 Accepted means generation started
    // 201 Created means already exists
    return response.status === 202 || response.status === 201 || response.ok;
  } catch {
    return false;
  }
}

/**
 * Wait for rendition to be available (poll with exponential backoff)
 */
async function waitForRendition(
  catId: string,
  assetId: string,
  accessToken: string,
  renditionType: string,
  maxWaitMs: number = 30000
): Promise<boolean> {
  const startTime = Date.now();
  let delay = 1000; // Start with 1 second

  while (Date.now() - startTime < maxWaitMs) {
    const url = `https://lr.adobe.io/v2/catalogs/${catId}/assets/${assetId}/renditions/${renditionType}`;
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-API-Key": process.env.ADOBE_CLIENT_ID!,
      },
    });

    if (response.ok) {
      return true;
    }

    // Wait with exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, 5000); // Cap at 5 seconds
  }

  return false;
}

/**
 * Get rendition URL for an asset from authenticated API
 */
async function getAssetRenditionUrl(
  catId: string,
  assetId: string,
  accessToken: string
): Promise<string | null> {
  // Try auto-generated renditions first (smaller sizes that should exist)
  const autoGeneratedTypes = ["2048", "1280", "640", "thumbnail2x"];

  for (const renditionType of autoGeneratedTypes) {
    try {
      const url = `https://lr.adobe.io/v2/catalogs/${catId}/assets/${assetId}/renditions/${renditionType}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-API-Key": process.env.ADOBE_CLIENT_ID!,
        },
        redirect: "manual",
      });

      if (response.status === 302 || response.status === 303) {
        const location = response.headers.get("location");
        if (location) {
          console.log(`    Got rendition ${renditionType} for ${assetId.slice(0, 8)}...`);
          return location;
        }
      }

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        // If it's an image, the URL itself is the rendition
        if (contentType?.includes("image")) {
          console.log(`    Got rendition ${renditionType} for ${assetId.slice(0, 8)}...`);
          return url;
        }
      }
    } catch {
      // Continue to next rendition type
    }
  }

  // Auto-generated renditions not available, try to generate 2560
  console.log(`    Generating 2560 rendition for ${assetId.slice(0, 8)}...`);
  const generated = await generateRendition(catId, assetId, accessToken, "2560");

  if (generated) {
    // Poll for availability
    const available = await waitForRendition(catId, assetId, accessToken, "2560", 30000);

    if (available) {
      const url = `https://lr.adobe.io/v2/catalogs/${catId}/assets/${assetId}/renditions/2560`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-API-Key": process.env.ADOBE_CLIENT_ID!,
        },
        redirect: "manual",
      });

      if (response.status === 302 || response.status === 303) {
        const location = response.headers.get("location");
        if (location) {
          console.log(`    Generated 2560 rendition for ${assetId.slice(0, 8)}...`);
          return location;
        }
      }

      if (response.ok) {
        console.log(`    Generated 2560 rendition for ${assetId.slice(0, 8)}...`);
        return url;
      }
    }
  }

  console.log(`    No rendition available for ${assetId.slice(0, 8)}... (tried auto-generated + 2560)`);
  return null;
}

function formatAperture(fNumber: unknown): string | undefined {
  if (!fNumber) return undefined;

  let num: number;
  if (Array.isArray(fNumber) && fNumber.length === 2) {
    // Adobe API returns fractions as [numerator, denominator]
    const [numerator, denominator] = fNumber;
    if (denominator === 0) return undefined;
    num = numerator / denominator;
  } else if (Array.isArray(fNumber)) {
    num = fNumber[0];
  } else if (typeof fNumber === "number") {
    num = fNumber;
  } else {
    num = parseFloat(String(fNumber));
  }

  if (isNaN(num)) return undefined;
  return `f/${num.toFixed(1)}`;
}

function formatShutterSpeed(exposureTime: unknown): string | undefined {
  if (!exposureTime) return undefined;

  let time: number;
  if (Array.isArray(exposureTime) && exposureTime.length === 2) {
    // Adobe API returns fractions as [numerator, denominator]
    const [numerator, denominator] = exposureTime;
    if (denominator === 0) return undefined;
    time = numerator / denominator;
  } else if (Array.isArray(exposureTime)) {
    time = exposureTime[0];
  } else if (typeof exposureTime === "number") {
    time = exposureTime;
  } else {
    time = parseFloat(String(exposureTime));
  }

  if (isNaN(time)) return undefined;
  return time >= 1 ? `${time}s` : `1/${Math.round(1 / time)}s`;
}

function formatFocalLength(focalLength: unknown): string | undefined {
  if (!focalLength) return undefined;

  let mm: number;
  if (Array.isArray(focalLength) && focalLength.length === 2) {
    // Adobe API returns fractions as [numerator, denominator]
    const [numerator, denominator] = focalLength;
    if (denominator === 0) return undefined;
    mm = numerator / denominator;
  } else if (Array.isArray(focalLength)) {
    mm = focalLength[0];
  } else if (typeof focalLength === "number") {
    mm = focalLength;
  } else {
    mm = parseFloat(String(focalLength));
  }

  if (isNaN(mm)) return undefined;
  return `${Math.round(mm)}mm`;
}

function formatCamera(make?: string, model?: string): string | undefined {
  if (!make && !model) return undefined;
  if (!make) return model;
  if (!model) return make;
  // Avoid duplicating brand if model already contains it (e.g., "Canon" + "Canon EOS R5")
  if (model.toLowerCase().startsWith(make.toLowerCase())) {
    return model;
  }
  return `${make} ${model}`;
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

interface SyncResult {
  success: boolean;
  albums: number;
  photos: number;
  error?: string;
}

async function runSync(galleryId?: string, onProgress?: ProgressCallback): Promise<SyncResult> {
  console.log("Starting Lightroom sync...");

  const startedAt = new Date().toISOString();

  // Report initializing
  onProgress?.({
    status: "syncing",
    phase: "initializing",
    totalGalleries: 0,
    currentGalleryIndex: 0,
    currentGalleryName: "",
    totalPhotos: 0,
    currentPhotoIndex: 0,
    currentPhotoName: "",
    message: "Loading metadata...",
    startedAt,
    completedAt: null,
  });

  // Load authenticated metadata first
  await loadAuthenticatedMetadata();

  // Get galleries from database (optionally filtered by ID)
  const galleries = galleryId
    ? await prisma.gallery.findMany({ where: { id: galleryId } })
    : await prisma.gallery.findMany();

  if (galleries.length === 0) {
    const message = galleryId
      ? `Gallery not found: ${galleryId}`
      : "No galleries configured!";
    console.log(`\n${message}`);

    onProgress?.({
      status: "completed",
      phase: "complete",
      totalGalleries: 0,
      currentGalleryIndex: 0,
      currentGalleryName: "",
      totalPhotos: 0,
      currentPhotoIndex: 0,
      currentPhotoName: "",
      message,
      startedAt,
      completedAt: new Date().toISOString(),
    });

    return { success: true, albums: 0, photos: 0 };
  }

  console.log(`\nSyncing ${galleries.length} gallery(ies)...`);

  for (let galleryIndex = 0; galleryIndex < galleries.length; galleryIndex++) {
    const gallery = galleries[galleryIndex];
    const galleryName = gallery.albumName || gallery.url || `Gallery ${galleryIndex + 1}`;

    // Report gallery progress
    onProgress?.({
      status: "syncing",
      phase: "fetching",
      totalGalleries: galleries.length,
      currentGalleryIndex: galleryIndex,
      currentGalleryName: galleryName,
      totalPhotos: 0,
      currentPhotoIndex: 0,
      currentPhotoName: "",
      message: `Syncing ${galleryName}...`,
      startedAt,
      completedAt: null,
    });

    // Create photo progress callback
    const photoProgress = (photoIndex: number, totalPhotos: number, photoName: string) => {
      onProgress?.({
        status: "syncing",
        phase: "downloading",
        totalGalleries: galleries.length,
        currentGalleryIndex: galleryIndex,
        currentGalleryName: galleryName,
        totalPhotos,
        currentPhotoIndex: photoIndex,
        currentPhotoName: photoName,
        message: `Processing ${photoName}...`,
        startedAt,
        completedAt: null,
      });
    };

    if (gallery.type === "private" && gallery.albumId) {
      await syncPrivateAlbum(
        {
          id: gallery.id,
          albumId: gallery.albumId,
          albumName: gallery.albumName,
          featured: gallery.featured,
        },
        photoProgress
      );
    } else if (gallery.url) {
      await syncPublicGallery(
        {
          id: gallery.id,
          url: gallery.url,
          featured: gallery.featured,
        },
        photoProgress
      );
    }
  }

  const albumCount = await prisma.album.count();
  const photoCount = await prisma.photo.count();

  console.log("\nSync complete!");
  console.log(`Total albums: ${albumCount}`);
  console.log(`Total photos: ${photoCount}`);

  // Report completion
  onProgress?.({
    status: "completed",
    phase: "complete",
    totalGalleries: galleries.length,
    currentGalleryIndex: galleries.length,
    currentGalleryName: "",
    totalPhotos: 0,
    currentPhotoIndex: 0,
    currentPhotoName: "",
    message: `Synced ${albumCount} albums with ${photoCount} photos`,
    startedAt,
    completedAt: new Date().toISOString(),
  });

  return { success: true, albums: albumCount, photos: photoCount };
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
  npx tsx sync/index.ts                       Sync all galleries
  npx tsx sync/index.ts --gallery <id>        Sync a specific gallery by ID
  npx tsx sync/index.ts --watch               Run continuously
  npx tsx sync/index.ts --help                Show this help

Note: Galleries are now managed via the admin interface at /admin
`);
    return;
  }

  // Check for --gallery argument
  const galleryIndex = args.indexOf("--gallery");
  const galleryId = galleryIndex !== -1 ? args[galleryIndex + 1] : undefined;

  // Run sync (optionally for a single gallery)
  await runSync(galleryId);
  await prisma.$disconnect();
}

// Export for API usage
export { runSync };

main().catch(console.error);
