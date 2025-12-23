// Runtime data loader for synced albums
// Reads from SQLite database at runtime

import prisma from "./db";
import type { Album, Photo, Chapter } from "./types";

// Get all albums
export async function getAlbums(): Promise<Album[]> {
  const albums = await prisma.album.findMany({
    orderBy: { lastSynced: "desc" },
  });

  return albums.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    location: a.location || "Unknown",
    date: a.date || "",
    coverImage: a.coverImage || "",
    photoCount: a.photoCount,
    featured: a.featured,
    galleryUrl: a.galleryUrl || "",
    lastSynced: a.lastSynced?.toISOString() || "",
  }));
}

// Get album by slug
export async function getAlbumBySlug(slug: string): Promise<Album | undefined> {
  const album = await prisma.album.findUnique({
    where: { slug },
  });

  if (!album) return undefined;

  return {
    id: album.id,
    slug: album.slug,
    title: album.title,
    location: album.location || "Unknown",
    date: album.date || "",
    coverImage: album.coverImage || "",
    photoCount: album.photoCount,
    featured: album.featured,
    galleryUrl: album.galleryUrl || "",
    lastSynced: album.lastSynced?.toISOString() || "",
  };
}

// Get photos for an album
export async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const photos = await prisma.photo.findMany({
    where: { albumId },
    orderBy: { sortOrder: "asc" },
  });

  return photos.map((p) => ({
    id: p.id,
    title: p.title || "",
    caption: p.caption || undefined,
    src: {
      thumb: p.thumbPath || "",
      medium: p.mediumPath || "",
      full: p.fullPath || "",
      original: p.originalUrl || "",
    },
    metadata: {
      date: p.date || "",
      location: p.location || "Unknown",
      city: p.city || undefined,
      width: p.width || 0,
      height: p.height || 0,
      camera: p.camera || undefined,
      lens: p.lens || undefined,
      aperture: p.aperture || undefined,
      shutterSpeed: p.shutterSpeed || undefined,
      iso: p.iso || undefined,
      focalLength: p.focalLength || undefined,
      latitude: p.latitude || undefined,
      longitude: p.longitude || undefined,
    },
    albumId: p.albumId,
    sortOrder: p.sortOrder,
  }));
}

// Get photo by ID
export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const p = await prisma.photo.findUnique({
    where: { id },
  });

  if (!p) return undefined;

  return {
    id: p.id,
    title: p.title || "",
    caption: p.caption || undefined,
    src: {
      thumb: p.thumbPath || "",
      medium: p.mediumPath || "",
      full: p.fullPath || "",
      original: p.originalUrl || "",
    },
    metadata: {
      date: p.date || "",
      location: p.location || "Unknown",
      city: p.city || undefined,
      width: p.width || 0,
      height: p.height || 0,
      camera: p.camera || undefined,
      lens: p.lens || undefined,
      aperture: p.aperture || undefined,
      shutterSpeed: p.shutterSpeed || undefined,
      iso: p.iso || undefined,
      focalLength: p.focalLength || undefined,
      latitude: p.latitude || undefined,
      longitude: p.longitude || undefined,
    },
    albumId: p.albumId,
    sortOrder: p.sortOrder,
  };
}

// Get chapters for an album
export async function getChaptersByAlbum(albumSlug: string): Promise<Chapter[]> {
  const album = await prisma.album.findUnique({
    where: { slug: albumSlug },
    include: {
      chapters: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!album || !album.chapters.length) return [];

  // Get all photos for this album
  const photos = await getPhotosByAlbum(album.id);
  const photoMap = new Map(photos.map((p) => [p.id, p]));

  return album.chapters.map((c) => {
    const photoIds = JSON.parse(c.photoIds) as string[];
    const chapterPhotos = photoIds
      .map((pid) => photoMap.get(pid))
      .filter((p): p is Photo => p !== undefined);

    // Determine cover photo: use selected cover or first photo
    const coverPhoto = c.coverPhotoId
      ? photoMap.get(c.coverPhotoId)
      : chapterPhotos[0];

    return {
      id: c.id,
      title: c.title,
      titleFr: c.titleFr || undefined,
      narrative: c.content || "",
      narrativeFr: c.contentFr || undefined,
      photos: chapterPhotos,
      coverPhotoId: c.coverPhotoId || undefined,
      coverPhoto,
    };
  });
}

// Get featured album
export async function getFeaturedAlbum(): Promise<Album | undefined> {
  const album = await prisma.album.findFirst({
    where: { featured: true },
    orderBy: { lastSynced: "desc" },
  });

  if (album) {
    // If no cover image, get first photo's medium thumbnail as fallback
    let coverImage = album.coverImage || "";
    if (!coverImage) {
      const firstPhoto = await prisma.photo.findFirst({
        where: { albumId: album.id },
        orderBy: { sortOrder: "asc" },
        select: { mediumPath: true },
      });
      coverImage = firstPhoto?.mediumPath || "";
    }

    return {
      id: album.id,
      slug: album.slug,
      title: album.title,
      location: album.location || "Unknown",
      date: album.date || "",
      coverImage,
      photoCount: album.photoCount,
      featured: album.featured,
      galleryUrl: album.galleryUrl || "",
      lastSynced: album.lastSynced?.toISOString() || "",
    };
  }

  // Fallback to first album
  const albums = await getAlbums();
  return albums[0];
}

// Get all photos (for search, map, etc.)
export async function getAllPhotos(): Promise<Photo[]> {
  const photos = await prisma.photo.findMany({
    orderBy: [{ albumId: "asc" }, { sortOrder: "asc" }],
  });

  return photos.map((p) => ({
    id: p.id,
    title: p.title || "",
    caption: p.caption || undefined,
    src: {
      thumb: p.thumbPath || "",
      medium: p.mediumPath || "",
      full: p.fullPath || "",
      original: p.originalUrl || "",
    },
    metadata: {
      date: p.date || "",
      location: p.location || "Unknown",
      city: p.city || undefined,
      width: p.width || 0,
      height: p.height || 0,
      camera: p.camera || undefined,
      lens: p.lens || undefined,
      aperture: p.aperture || undefined,
      shutterSpeed: p.shutterSpeed || undefined,
      iso: p.iso || undefined,
      focalLength: p.focalLength || undefined,
      latitude: p.latitude || undefined,
      longitude: p.longitude || undefined,
    },
    albumId: p.albumId,
    sortOrder: p.sortOrder,
  }));
}

// Search photos
export async function searchPhotos(query: string): Promise<Photo[]> {
  const photos = await prisma.photo.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { caption: { contains: query } },
        { location: { contains: query } },
        { camera: { contains: query } },
        { lens: { contains: query } },
      ],
    },
    orderBy: { sortOrder: "asc" },
    take: 50,
  });

  return photos.map((p) => ({
    id: p.id,
    title: p.title || "",
    caption: p.caption || undefined,
    src: {
      thumb: p.thumbPath || "",
      medium: p.mediumPath || "",
      full: p.fullPath || "",
      original: p.originalUrl || "",
    },
    metadata: {
      date: p.date || "",
      location: p.location || "Unknown",
      city: p.city || undefined,
      width: p.width || 0,
      height: p.height || 0,
      camera: p.camera || undefined,
      lens: p.lens || undefined,
      aperture: p.aperture || undefined,
      shutterSpeed: p.shutterSpeed || undefined,
      iso: p.iso || undefined,
      focalLength: p.focalLength || undefined,
      latitude: p.latitude || undefined,
      longitude: p.longitude || undefined,
    },
    albumId: p.albumId,
    sortOrder: p.sortOrder,
  }));
}

// Get unique gear (cameras and lenses) with photo counts
export async function getGearStats(): Promise<{
  cameras: { name: string; count: number }[];
  lenses: { name: string; count: number }[];
}> {
  const photos = await prisma.photo.findMany({
    select: {
      camera: true,
      lens: true,
    },
  });

  // Count cameras
  const cameraMap = new Map<string, number>();
  for (const p of photos) {
    if (p.camera) {
      cameraMap.set(p.camera, (cameraMap.get(p.camera) || 0) + 1);
    }
  }

  // Count lenses
  const lensMap = new Map<string, number>();
  for (const p of photos) {
    if (p.lens) {
      lensMap.set(p.lens, (lensMap.get(p.lens) || 0) + 1);
    }
  }

  // Sort by count (most used first)
  const cameras = Array.from(cameraMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const lenses = Array.from(lensMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { cameras, lenses };
}
