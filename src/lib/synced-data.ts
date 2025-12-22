// Runtime data loader for synced albums
// Reads from JSON manifest at runtime (works with Docker volumes)

import fs from "fs";
import path from "path";
import type { Album, Photo, Chapter } from "./types";

interface SyncManifest {
  lastUpdated: string;
  albums: Album[];
  photos: Photo[];
  chapters: Record<string, { id: string; title: string; narrative: string; photoIds: string[] }[]>;
}

// Path to the manifest file (use /app/data in Docker, public/photos locally)
const MANIFEST_PATH = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/photos/albums.json" : "public/photos/albums.json"
);

// Cache for manifest data
let manifestCache: SyncManifest | null = null;
let lastRead = 0;
const CACHE_TTL = process.env.NODE_ENV === "production" ? 60000 : 5000; // 1 min prod, 5s dev

function loadManifest(): SyncManifest {
  const now = Date.now();

  // Use cache to avoid constant file reads
  if (manifestCache && (now - lastRead) < CACHE_TTL) {
    return manifestCache;
  }

  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, "utf-8");
      manifestCache = JSON.parse(data);
      lastRead = now;
      return manifestCache!;
    }
  } catch (error) {
    console.error("Failed to load manifest:", error);
  }

  // Return empty manifest if file doesn't exist
  return {
    lastUpdated: "",
    albums: [],
    photos: [],
    chapters: {},
  };
}

// Export data accessors
export function getAlbums(): Album[] {
  return loadManifest().albums;
}

export function getAlbumBySlug(slug: string): Album | undefined {
  return loadManifest().albums.find((a) => a.slug === slug);
}

export function getPhotosByAlbum(albumId: string): Photo[] {
  return loadManifest().photos.filter((p) => p.albumId === albumId);
}

export function getPhotoById(id: string): Photo | undefined {
  return loadManifest().photos.find((p) => p.id === id);
}

export function getChaptersByAlbum(albumSlug: string): Chapter[] {
  const manifest = loadManifest();
  const album = manifest.albums.find((a) => a.slug === albumSlug);
  if (!album) return [];

  const albumChapters = manifest.chapters[album.id];
  if (!albumChapters) return [];

  // Resolve photo IDs to actual photos
  return albumChapters.map((c) => ({
    id: c.id,
    title: c.title,
    narrative: c.narrative,
    photos: c.photoIds
      .map((pid) => manifest.photos.find((p) => p.id === pid))
      .filter((p): p is Photo => p !== undefined),
  }));
}

export function getFeaturedAlbum(): Album | undefined {
  const albums = loadManifest().albums;
  return albums.find((a) => a.featured) || albums[0];
}

// Legacy exports for compatibility (populated on first load)
export const albums: Album[] = loadManifest().albums;
export const photos: Photo[] = loadManifest().photos;
export const chapters: Record<string, Chapter[]> = {};
