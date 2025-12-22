import fs from "fs/promises";
import path from "path";
import { config } from "./config";
import type { SyncManifest, SyncAlbum, SyncPhoto } from "./types";

/**
 * Load the existing manifest from disk, or return an empty one
 */
export async function loadManifest(): Promise<SyncManifest> {
  try {
    const data = await fs.readFile(config.manifestPath, "utf-8");
    return JSON.parse(data);
  } catch {
    // No existing manifest, return empty
    return {
      lastUpdated: new Date().toISOString(),
      albums: [],
      photos: [],
      chapters: {},
    };
  }
}

/**
 * Save the manifest to disk
 */
export async function saveManifest(manifest: SyncManifest): Promise<void> {
  // Ensure directory exists
  await fs.mkdir(path.dirname(config.manifestPath), { recursive: true });

  // Update timestamp
  manifest.lastUpdated = new Date().toISOString();

  // Write manifest
  await fs.writeFile(
    config.manifestPath,
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );

  console.log(`Manifest saved to ${config.manifestPath}`);
}

/**
 * Update or add an album to the manifest
 */
export function updateAlbum(
  manifest: SyncManifest,
  album: SyncAlbum
): SyncManifest {
  const existingIndex = manifest.albums.findIndex((a) => a.id === album.id);

  if (existingIndex >= 0) {
    manifest.albums[existingIndex] = album;
  } else {
    manifest.albums.push(album);
  }

  return manifest;
}

/**
 * Update or add photos for an album
 */
export function updatePhotos(
  manifest: SyncManifest,
  albumId: string,
  photos: SyncPhoto[]
): SyncManifest {
  // Remove old photos for this album
  manifest.photos = manifest.photos.filter((p) => p.albumId !== albumId);

  // Add new photos
  manifest.photos.push(...photos);

  return manifest;
}

/**
 * Remove an album and its photos from the manifest
 */
export function removeAlbum(
  manifest: SyncManifest,
  albumId: string
): SyncManifest {
  manifest.albums = manifest.albums.filter((a) => a.id !== albumId);
  manifest.photos = manifest.photos.filter((p) => p.albumId !== albumId);
  delete manifest.chapters[albumId];

  return manifest;
}

/**
 * Get photos for a specific album
 */
export function getAlbumPhotos(
  manifest: SyncManifest,
  albumId: string
): SyncPhoto[] {
  return manifest.photos
    .filter((p) => p.albumId === albumId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Generate data file from manifest (no-op, data is now read at runtime from JSON)
 * @deprecated - Data is now loaded at runtime from albums.json
 */
export async function generateDataFile(manifest: SyncManifest): Promise<void> {
  // Data is now read at runtime from the JSON manifest
  // No need to generate a TypeScript file
  console.log(`Manifest saved with ${manifest.albums.length} albums, ${manifest.photos.length} photos`);
}
