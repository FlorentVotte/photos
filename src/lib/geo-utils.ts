import type {
  Album,
  AlbumMarker,
  ChapterStats,
  GeoPoint,
  LocationSummary,
  Photo,
} from "./types";

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

/**
 * Build one globe marker per album, positioned at the mean coordinate of that
 * album's geotagged photos. Albums without a geotagged photo or without a cover
 * image are dropped, and the album order is preserved.
 *
 * Note: the mean is computed on raw degrees, so an album straddling the
 * antimeridian would land on the wrong side of the globe. No album in this
 * archive does, and handling it would cost more than it buys.
 */
export function albumMarkers(photos: Photo[], albums: Album[]): AlbumMarker[] {
  const sums = new Map<string, { lat: number; lng: number; count: number }>();

  for (const photo of photos) {
    const { latitude, longitude } = photo.metadata;
    // Explicit finite check rather than truthiness: lat/lng of exactly 0 is a
    // real place, not a missing value.
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    const sum = sums.get(photo.albumId) ?? { lat: 0, lng: 0, count: 0 };
    sum.lat += latitude!;
    sum.lng += longitude!;
    sum.count += 1;
    sums.set(photo.albumId, sum);
  }

  return albums.flatMap((album) => {
    const sum = sums.get(album.id);
    if (!sum) return [];
    // transformAlbum turns a null coverImage into "". A marker is nothing but
    // its thumbnail, so pin only albums that have one.
    if (!album.coverImage) return [];

    return [
      {
        lat: sum.lat / sum.count,
        lng: sum.lng / sum.count,
        src: album.coverImage,
        label: album.title,
        slug: album.slug,
        photoCount: album.photoCount,
        year: albumYear(album.date),
        date: album.date ?? "",
      },
    ];
  });
}

/**
 * Pull the year out of an album's display date. Sync writes these as human
 * strings — "Nov 24, 2025", "July 2026" — so this looks for a standalone
 * four-digit run rather than assuming a format. Returns "" when there is none.
 */
export function albumYear(date?: string): string {
  return date?.match(/(?<!\d)(\d{4})(?!\d)/)?.[1] ?? "";
}

/**
 * Order markers by when their album was shot, oldest first — the order the
 * globe draws its travel arcs in.
 *
 * The dates are display strings, so sorting them as text would read "Apr" <
 * "Jul" < "May". Date.parse handles every format sync produces; anything it
 * cannot read sorts last, keeping the input order among those so the result
 * stays deterministic.
 */
export function sortMarkersByDate(markers: AlbumMarker[]): AlbumMarker[] {
  const key = (marker: AlbumMarker) => {
    const parsed = Date.parse(marker.date);
    return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
  };

  return markers
    .map((marker, index) => ({ marker, index }))
    .sort((a, b) => key(a.marker) - key(b.marker) || a.index - b.index)
    .map(({ marker }) => marker);
}
