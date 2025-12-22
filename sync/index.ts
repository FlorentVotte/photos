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
import type { SyncAlbum, SyncPhoto, LightroomGalleryData } from "./types";

// Store gallery URLs in a separate file
const GALLERIES_FILE = path.join(process.cwd(), "sync", "galleries.json");

interface GalleryEntry {
  url: string;
  tag?: string; // Optional tag for filtering
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

    const photo: SyncPhoto = {
      id: lrPhoto.id,
      title: lrPhoto.title || lrPhoto.caption || `Photo ${i + 1}`,
      description: lrPhoto.caption,
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
    manifest = await syncGallery(entry, manifest);
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
