import type { Photo, ChapterStats, LocationSummary, GeoPoint } from "./types";

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate distance between two GPS points using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total route distance from array of photos
 * Photos are sorted by date before calculating
 * @returns Total distance in kilometers
 */
export function calculateRouteDistance(photos: Photo[]): number {
  const geoPhotos = photos
    .filter((p) => p.metadata.latitude && p.metadata.longitude)
    .sort((a, b) => {
      const dateA = a.metadata.date || "";
      const dateB = b.metadata.date || "";
      return dateA.localeCompare(dateB);
    });

  let totalDistance = 0;
  for (let i = 1; i < geoPhotos.length; i++) {
    totalDistance += calculateDistance(
      geoPhotos[i - 1].metadata.latitude!,
      geoPhotos[i - 1].metadata.longitude!,
      geoPhotos[i].metadata.latitude!,
      geoPhotos[i].metadata.longitude!
    );
  }
  return totalDistance;
}

/**
 * Extract unique locations from photos
 */
export function extractLocations(photos: Photo[]): LocationSummary {
  const cities = Array.from(
    new Set(
      photos.map((p) => p.metadata.city).filter((c): c is string => !!c)
    )
  );

  const countries = Array.from(
    new Set(
      photos.map((p) => p.metadata.location).filter((c): c is string => !!c)
    )
  );

  const coordinates: GeoPoint[] = photos
    .filter((p) => p.metadata.latitude && p.metadata.longitude)
    .sort((a, b) => {
      const dateA = a.metadata.date || "";
      const dateB = b.metadata.date || "";
      return dateA.localeCompare(dateB);
    })
    .map((p) => ({
      lat: p.metadata.latitude!,
      lng: p.metadata.longitude!,
      photoId: p.id,
      date: p.metadata.date,
      city: p.metadata.city,
    }));

  return { cities, countries, coordinates };
}

/**
 * Compute chapter statistics from photos
 */
export function computeChapterStats(photos: Photo[]): ChapterStats {
  const dates = photos
    .map((p) => p.metadata.date)
    .filter((d): d is string => !!d)
    .sort();

  const photosWithGps = photos.filter(
    (p) => p.metadata.latitude && p.metadata.longitude
  ).length;

  return {
    photoCount: photos.length,
    photosWithGps,
    distanceKm: Math.round(calculateRouteDistance(photos)),
    dateRange:
      dates.length > 0
        ? {
            start: dates[0],
            end: dates[dates.length - 1],
          }
        : undefined,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toLocaleString()} km`;
}
