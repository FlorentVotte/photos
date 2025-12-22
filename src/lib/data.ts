import type { Album, Photo, Chapter, SiteConfig } from "./types";
import {
  getAlbums as getSyncedAlbums,
  getAlbumBySlug as getSyncedAlbumBySlug,
  getPhotosByAlbum as getSyncedPhotosByAlbum,
  getPhotoById as getSyncedPhotoById,
  getChaptersByAlbum as getSyncedChaptersByAlbum,
  getFeaturedAlbum as getSyncedFeaturedAlbum,
  getAllPhotos as getSyncedAllPhotos,
  searchPhotos as searchSyncedPhotos,
} from "./synced-data";

// In production, only use synced data (no sample fallback)
const isProduction = process.env.NODE_ENV === "production";

export async function getAlbums(): Promise<Album[]> {
  const synced = await getSyncedAlbums();
  if (synced.length > 0 || isProduction) return synced;
  return sampleAlbums;
}

export async function getFeaturedAlbum(): Promise<Album | undefined> {
  const synced = await getSyncedFeaturedAlbum();
  if (synced || isProduction) return synced;
  return sampleAlbums.find((a) => a.featured) || sampleAlbums[0];
}

export async function getAlbumBySlug(slug: string): Promise<Album | undefined> {
  const synced = await getSyncedAlbumBySlug(slug);
  if (synced || isProduction) return synced;
  return sampleAlbums.find((a) => a.slug === slug);
}

export async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const synced = await getSyncedPhotosByAlbum(albumId);
  if (synced.length > 0 || isProduction) return synced;
  return samplePhotos.filter((p) => p.albumId === albumId);
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const synced = await getSyncedPhotoById(id);
  if (synced || isProduction) return synced;
  return samplePhotos.find((p) => p.id === id);
}

export async function getChaptersByAlbum(albumSlug: string): Promise<Chapter[]> {
  const synced = await getSyncedChaptersByAlbum(albumSlug);
  if (synced.length > 0 || isProduction) return synced;
  // Fallback to sample chapters for Kyoto demo (dev only)
  if (albumSlug === "kyoto-autumn-2023") return sampleChapters;
  return [];
}

export async function getAllPhotos(): Promise<Photo[]> {
  const synced = await getSyncedAllPhotos();
  if (synced.length > 0 || isProduction) return synced;
  return samplePhotos;
}

export async function searchPhotos(query: string): Promise<Photo[]> {
  return searchSyncedPhotos(query);
}

// Sample albums for development/demo (fallback if no synced data)
const sampleAlbums: Album[] = [
  {
    id: "1",
    slug: "kyoto-autumn-2023",
    title: "Lost in Kyoto",
    subtitle: "Autumn 2023",
    description:
      "Capturing the fleeting moments between departures and arrivals. Experience the silence of the temples and the vibrant colors of the fall season.",
    location: "Japan",
    date: "October 2023",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDye5slRmUThZe5WiDW5H6mBKOwGzvXUPHbDAkXUcJ5bzjTT6DAIxO2T7zUleXiB0_aJuAuR8HuBiGhIjU0P4Sxm2a61Qy1oIMvM1VcDWNdEiPBLsxLaOcs8Ct9_gmBvrX5rJNMpuAu3F5E5hZodCvp7tSF4d69eZNVu1jfme1LbjUv4JzjPoJSjaHmRHZxslBRfSUG-bP4cci1oQNiy1tOHa2xmgbGId1r21e0JxFjKJ0b-CSYx2bwaySvV-QDEUqQNrEoi0L9M1k",
    photoCount: 42,
    featured: true,
  },
];

export const siteConfig: SiteConfig = {
  siteName: "Travelogue",
  tagline: "Capturing the fleeting moments between departures and arrivals.",
  photographerName: "Florent",
  photographerBio:
    "I travel the world documenting landscapes, cultures, and the quiet moments in between. Join me as I explore the intersection of nature and humanity.",
  socialLinks: {
    instagram: "#",
    twitter: "#",
    unsplash: "#",
  },
};

// Sample photos for the Kyoto album (fallback)
export const samplePhotos: Photo[] = [
  {
    id: "p1",
    title: "Gion at Dusk",
    src: {
      thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzyh4CcyJU0TI7_b1mFLdK40TfkgLk3vGCIupWHVTWl6oHLqs4_T3ntD7ZkqKoOqEE9rLTc5qshwmuPrpnnb6ai6T6OBxTDb_U8DP-ERlLAnaj1oHGYsslwHr80rbgKigoPIJXUPRK_br0olovdetqA9gxkiA4U-dnKAX7hMgmTgC321L6GqPGBx1XvLDnTfy_SivS4GdOQ3RMJ0A4bkawib2YxWZpziZDr8LStZajh1mcR7mJbyPMuhWoRJCjIWO6vBn1DfoXRpc",
      medium: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzyh4CcyJU0TI7_b1mFLdK40TfkgLk3vGCIupWHVTWl6oHLqs4_T3ntD7ZkqKoOqEE9rLTc5qshwmuPrpnnb6ai6T6OBxTDb_U8DP-ERlLAnaj1oHGYsslwHr80rbgKigoPIJXUPRK_br0olovdetqA9gxkiA4U-dnKAX7hMgmTgC321L6GqPGBx1XvLDnTfy_SivS4GdOQ3RMJ0A4bkawib2YxWZpziZDr8LStZajh1mcR7mJbyPMuhWoRJCjIWO6vBn1DfoXRpc",
      full: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzyh4CcyJU0TI7_b1mFLdK40TfkgLk3vGCIupWHVTWl6oHLqs4_T3ntD7ZkqKoOqEE9rLTc5qshwmuPrpnnb6ai6T6OBxTDb_U8DP-ERlLAnaj1oHGYsslwHr80rbgKigoPIJXUPRK_br0olovdetqA9gxkiA4U-dnKAX7hMgmTgC321L6GqPGBx1XvLDnTfy_SivS4GdOQ3RMJ0A4bkawib2YxWZpziZDr8LStZajh1mcR7mJbyPMuhWoRJCjIWO6vBn1DfoXRpc",
    },
    metadata: {
      date: "Oct 14, 2023",
      location: "Kyoto, Japan",
      camera: "Sony A7R IV",
      lens: "35mm f/1.4 GM",
      aperture: "f/2.8",
      shutterSpeed: "1/200s",
      iso: "100",
    },
    albumId: "1",
    sortOrder: 0,
  },
];

// Sample chapters for the Kyoto album
export const sampleChapters: Chapter[] = [
  {
    id: "ch1",
    title: "The Streets",
    narrative: "The air was crisp as we stepped off the train. Kyoto greeted us not with the bustle of Tokyo, but with a quiet, ancient dignity.",
    photos: samplePhotos.slice(0, 1),
  },
];
