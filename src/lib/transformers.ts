/**
 * Data transformation functions for converting Prisma models to app types.
 * Centralizes the mapping logic to avoid duplication across data access layers.
 */

import type { Album as PrismaAlbum, Photo as PrismaPhoto } from "@prisma/client";
import type { Album, Photo } from "./types";

/**
 * Transform a Prisma Album record to the app Album type.
 */
export function transformAlbum(album: PrismaAlbum): Album {
  return {
    id: album.id,
    slug: album.slug,
    title: album.title,
    subtitle: album.subtitle || undefined,
    description: album.description || undefined,
    location: album.location || "Unknown",
    date: album.date || "",
    coverImage: album.coverImage || "",
    photoCount: album.photoCount,
    sortOrder: album.sortOrder,
    featured: album.featured,
    galleryUrl: album.galleryUrl || "",
    lastSynced: album.lastSynced?.toISOString() || "",
  };
}

/**
 * Transform a Prisma Photo record to the app Photo type.
 * Optionally include album info if the photo was queried with album relation.
 */
export function transformPhoto(
  photo: PrismaPhoto,
  albumInfo?: { title?: string; slug?: string }
): Photo {
  return {
    id: photo.id,
    title: photo.title || "",
    caption: photo.caption || undefined,
    src: {
      thumb: photo.thumbPath || "",
      medium: photo.mediumPath || "",
      full: photo.fullPath || "",
      original: photo.originalUrl || "",
    },
    metadata: {
      date: photo.date || "",
      location: photo.location || "Unknown",
      city: photo.city || undefined,
      width: photo.width || 0,
      height: photo.height || 0,
      camera: photo.camera || undefined,
      lens: photo.lens || undefined,
      aperture: photo.aperture || undefined,
      shutterSpeed: photo.shutterSpeed || undefined,
      iso: photo.iso || undefined,
      focalLength: photo.focalLength || undefined,
      latitude: photo.latitude || undefined,
      longitude: photo.longitude || undefined,
    },
    albumId: photo.albumId,
    albumTitle: albumInfo?.title,
    albumSlug: albumInfo?.slug,
    sortOrder: photo.sortOrder,
  };
}

/**
 * Transform multiple Prisma Album records to app Album types.
 */
export function transformAlbums(albums: PrismaAlbum[]): Album[] {
  return albums.map(transformAlbum);
}

/**
 * Transform multiple Prisma Photo records to app Photo types.
 */
export function transformPhotos(photos: PrismaPhoto[]): Photo[] {
  return photos.map((p) => transformPhoto(p));
}

/**
 * Transform photos with their album relation included.
 */
export function transformPhotosWithAlbum(
  photos: Array<PrismaPhoto & { album?: { title?: string; slug?: string } | null }>
): Photo[] {
  return photos.map((p) =>
    transformPhoto(p, p.album ? { title: p.album.title, slug: p.album.slug } : undefined)
  );
}
