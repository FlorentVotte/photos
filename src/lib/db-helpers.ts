import prisma from "./db";
import type { Gallery, Album, Photo, Chapter, AdobeToken } from "@prisma/client";
import { PAGINATION } from "./constants";

// ==================== GALLERY OPERATIONS ====================

export async function getGalleries() {
  return prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getGallery(id: string) {
  return prisma.gallery.findUnique({ where: { id } });
}

export async function getGalleryByUrl(url: string) {
  return prisma.gallery.findUnique({ where: { url } });
}

export async function getGalleryByAlbumId(albumId: string) {
  return prisma.gallery.findUnique({ where: { albumId } });
}

export async function createGallery(data: {
  url?: string;
  albumId?: string;
  albumName?: string;
  type?: string;
  tag?: string;
  featured?: boolean;
}) {
  return prisma.gallery.create({ data });
}

export async function updateGallery(id: string, data: Partial<Gallery>) {
  return prisma.gallery.update({ where: { id }, data });
}

export async function deleteGallery(id: string) {
  return prisma.gallery.delete({ where: { id } });
}

// ==================== ALBUM OPERATIONS ====================

export async function getAlbums(featuredOnly = false) {
  return prisma.album.findMany({
    where: featuredOnly ? { featured: true } : undefined,
    orderBy: { lastSynced: "desc" },
  });
}

export async function getAlbum(id: string) {
  return prisma.album.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } }, chapters: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAlbumBySlug(slug: string) {
  return prisma.album.findUnique({
    where: { slug },
    include: { photos: { orderBy: { sortOrder: "asc" } }, chapters: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function upsertAlbum(data: {
  id: string;
  slug: string;
  title: string;
  location?: string;
  date?: string;
  coverImage?: string;
  photoCount?: number;
  featured?: boolean;
  galleryUrl?: string;
  galleryId?: string;
  lastSynced?: Date;
}) {
  const { id, ...rest } = data;
  return prisma.album.upsert({
    where: { id },
    update: { ...rest, lastSynced: rest.lastSynced || new Date() },
    create: { id, ...rest, lastSynced: rest.lastSynced || new Date() },
  });
}

export async function updateAlbumFeatured(id: string, featured: boolean) {
  return prisma.album.update({ where: { id }, data: { featured } });
}

export async function deleteAlbum(id: string) {
  // This will cascade delete photos and chapters
  return prisma.album.delete({ where: { id } });
}

// ==================== PHOTO OPERATIONS ====================

export async function getPhotos(albumId?: string) {
  return prisma.photo.findMany({
    where: albumId ? { albumId } : undefined,
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPhoto(id: string) {
  return prisma.photo.findUnique({
    where: { id },
    include: { album: true },
  });
}

export async function getAllPhotosWithAlbum() {
  return prisma.photo.findMany({
    include: { album: { select: { id: true, slug: true, title: true } } },
    orderBy: [{ album: { lastSynced: "desc" } }, { sortOrder: "asc" }],
  });
}

export async function upsertPhoto(data: {
  id: string;
  albumId: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
  thumbPath?: string;
  mediumPath?: string;
  fullPath?: string;
  originalUrl?: string;
  date?: string;
  location?: string;
  width?: number;
  height?: number;
  camera?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  focalLength?: string;
  latitude?: number;
  longitude?: number;
}) {
  const { id, ...rest } = data;
  return prisma.photo.upsert({
    where: { id },
    update: rest,
    create: { id, ...rest },
  });
}

export async function deletePhotosForAlbum(albumId: string) {
  return prisma.photo.deleteMany({ where: { albumId } });
}

// ==================== CHAPTER OPERATIONS ====================

export async function getChapters(albumId: string) {
  return prisma.chapter.findMany({
    where: { albumId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function upsertChapter(data: {
  id?: string;
  albumId: string;
  title: string;
  content?: string;
  sortOrder?: number;
  photoIds: string[];
}) {
  const { id, photoIds, ...rest } = data;
  const photoIdsJson = JSON.stringify(photoIds);

  if (id) {
    return prisma.chapter.upsert({
      where: { id },
      update: { ...rest, photoIds: photoIdsJson },
      create: { ...rest, photoIds: photoIdsJson },
    });
  }
  return prisma.chapter.create({
    data: { ...rest, photoIds: photoIdsJson },
  });
}

export async function deleteChapter(id: string) {
  return prisma.chapter.delete({ where: { id } });
}

export async function deleteChaptersForAlbum(albumId: string) {
  return prisma.chapter.deleteMany({ where: { albumId } });
}

// ==================== ADOBE TOKEN OPERATIONS ====================

export async function getAdobeToken() {
  return prisma.adobeToken.findUnique({ where: { id: "default" } });
}

export async function saveAdobeToken(data: {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}) {
  return prisma.adobeToken.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
}

export async function deleteAdobeToken() {
  return prisma.adobeToken.delete({ where: { id: "default" } }).catch(() => null);
}

// ==================== UTILITY FUNCTIONS ====================

// Get manifest-like data for compatibility with existing code
export async function getManifestData() {
  const albums = await prisma.album.findMany({
    orderBy: { lastSynced: "desc" },
  });

  const photos = await prisma.photo.findMany({
    orderBy: [{ albumId: "asc" }, { sortOrder: "asc" }],
  });

  return {
    lastUpdated: new Date().toISOString(),
    albums: albums.map((a) => ({
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
    })),
    photos: photos.map((p) => ({
      id: p.id,
      title: p.title || "",
      caption: p.caption,
      src: {
        thumb: p.thumbPath || "",
        medium: p.mediumPath || "",
        full: p.fullPath || "",
        original: p.originalUrl || "",
      },
      metadata: {
        date: p.date || "",
        location: p.location || "Unknown",
        width: p.width || 0,
        height: p.height || 0,
        camera: p.camera,
        lens: p.lens,
        aperture: p.aperture,
        shutterSpeed: p.shutterSpeed,
        iso: p.iso,
        focalLength: p.focalLength,
        latitude: p.latitude,
        longitude: p.longitude,
      },
      albumId: p.albumId,
      sortOrder: p.sortOrder,
    })),
  };
}

// Search photos by text
export async function searchPhotos(query: string) {
  const lowerQuery = `%${query.toLowerCase()}%`;
  return prisma.photo.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { caption: { contains: query } },
        { location: { contains: query } },
        { camera: { contains: query } },
        { lens: { contains: query } },
      ],
    },
    include: { album: { select: { id: true, slug: true, title: true } } },
    orderBy: { sortOrder: "asc" },
    take: PAGINATION.SEARCH_LIMIT,
  });
}
