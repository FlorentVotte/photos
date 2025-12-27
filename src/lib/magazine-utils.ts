import { Photo, Chapter } from "./types";

/**
 * Represents a group of photos from the same day
 */
export interface MagazineDay {
  date: string; // ISO date (YYYY-MM-DD)
  displayDate: string; // Formatted for display (e.g., "October 14, 2023")
  location?: string; // Primary location for the day
  city?: string;
  photos: Photo[];
}

/**
 * Organized content for magazine view
 */
export interface MagazineContent {
  type: "chapters" | "days" | "flat";
  sections: MagazineSection[];
  allPhotos: Photo[]; // Flat list for slideshow navigation
  totalPhotos: number;
}

export type MagazineSection =
  | { type: "chapter"; chapter: Chapter; index: number }
  | { type: "day"; day: MagazineDay; index: number };

/**
 * Layout variant for photo sections in magazine view
 */
export type MagazineLayout = "full" | "left" | "right" | "center";

/**
 * Determines the layout for a photo based on its index
 * Creates a visually interesting pattern
 */
export function getLayoutForIndex(index: number): MagazineLayout {
  // Pattern: full, left, right, center, left, right, full, ...
  const patterns: MagazineLayout[] = [
    "full",
    "left",
    "right",
    "center",
    "left",
    "right",
  ];
  return patterns[index % patterns.length];
}

/**
 * Formats a date string for display in the magazine
 */
export function formatMagazineDate(
  dateStr: string,
  locale: "en" | "fr" = "en"
): string {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Extracts just the date portion (YYYY-MM-DD) from a datetime string
 */
function extractDateOnly(dateStr: string): string {
  if (!dateStr) return "";
  // Handle ISO format or just date
  return dateStr.split("T")[0];
}

/**
 * Groups photos by date, creating day sections
 */
export function groupPhotosByDate(photos: Photo[]): MagazineDay[] {
  if (!photos || photos.length === 0) return [];

  // Group photos by date
  const photosByDate = new Map<string, Photo[]>();

  for (const photo of photos) {
    const dateKey = extractDateOnly(photo.metadata.date);
    if (!dateKey) continue;

    const existing = photosByDate.get(dateKey) || [];
    existing.push(photo);
    photosByDate.set(dateKey, existing);
  }

  // Convert to array and sort by date
  const days: MagazineDay[] = [];

  // Sort dates chronologically
  const sortedDates = Array.from(photosByDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const dayPhotos = photosByDate.get(dateKey) || [];

    // Sort photos within the day by their original order or timestamp
    dayPhotos.sort((a, b) => {
      // Try to sort by full datetime if available
      const dateA = new Date(a.metadata.date).getTime();
      const dateB = new Date(b.metadata.date).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateA - dateB;
      }
      // Fallback to sort order
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    // Get primary location from most common city
    const cities = dayPhotos
      .map((p) => p.metadata.city)
      .filter((c): c is string => !!c);
    const cityCount = new Map<string, number>();
    for (const city of cities) {
      cityCount.set(city, (cityCount.get(city) || 0) + 1);
    }
    const primaryCity =
      cities.length > 0
        ? Array.from(cityCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
        : undefined;

    // Get primary location (country)
    const locations = dayPhotos
      .map((p) => p.metadata.location)
      .filter((l): l is string => !!l);
    const primaryLocation = locations[0];

    days.push({
      date: dateKey,
      displayDate: formatMagazineDate(dateKey),
      location: primaryLocation,
      city: primaryCity,
      photos: dayPhotos,
    });
  }

  return days;
}

/**
 * Organizes album content for magazine view
 * Uses chapters if available, otherwise groups by date
 */
export function organizeMagazineContent(
  chapters: Chapter[],
  photos: Photo[]
): MagazineContent {
  // If chapters exist and have photos, use them
  if (chapters.length > 0 && chapters.some((c) => c.photos.length > 0)) {
    const sections: MagazineSection[] = chapters.map((chapter, index) => ({
      type: "chapter" as const,
      chapter,
      index,
    }));

    const allPhotos = chapters.flatMap((c) => c.photos);

    return {
      type: "chapters",
      sections,
      allPhotos,
      totalPhotos: allPhotos.length,
    };
  }

  // Group by date
  const days = groupPhotosByDate(photos);

  if (days.length > 0) {
    const sections: MagazineSection[] = days.map((day, index) => ({
      type: "day" as const,
      day,
      index,
    }));

    const allPhotos = days.flatMap((d) => d.photos);

    return {
      type: "days",
      sections,
      allPhotos,
      totalPhotos: allPhotos.length,
    };
  }

  // Fallback: flat list (no date information)
  return {
    type: "flat",
    sections: [],
    allPhotos: photos,
    totalPhotos: photos.length,
  };
}

/**
 * Gets the absolute index of a photo across all sections
 */
export function getAbsolutePhotoIndex(
  content: MagazineContent,
  sectionIndex: number,
  photoIndex: number
): number {
  let absoluteIndex = 0;

  for (let i = 0; i < sectionIndex; i++) {
    const section = content.sections[i];
    if (section.type === "chapter") {
      absoluteIndex += section.chapter.photos.length;
    } else {
      absoluteIndex += section.day.photos.length;
    }
  }

  return absoluteIndex + photoIndex;
}

/**
 * Gets section and photo index from absolute index
 */
export function getSectionFromAbsoluteIndex(
  content: MagazineContent,
  absoluteIndex: number
): { sectionIndex: number; photoIndex: number } | null {
  let currentIndex = 0;

  for (let sectionIndex = 0; sectionIndex < content.sections.length; sectionIndex++) {
    const section = content.sections[sectionIndex];
    const sectionPhotos =
      section.type === "chapter" ? section.chapter.photos : section.day.photos;
    const sectionLength = sectionPhotos.length;

    if (currentIndex + sectionLength > absoluteIndex) {
      return {
        sectionIndex,
        photoIndex: absoluteIndex - currentIndex,
      };
    }

    currentIndex += sectionLength;
  }

  return null;
}
