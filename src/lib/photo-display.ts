import type { Album, Photo } from "@/lib/types";
import { t } from "@/lib/translations";
import type { Locale } from "@/lib/translations";
import { cleanLocationParts } from "@/lib/transformers";

const FILENAME_PREFIX_RE = /^(DSC|DSCF|DSCN|IMG|MOV|GOPR|P\d|_DSC)/i;
const FILE_EXTENSION_RE = /\.[a-z0-9]{2,5}$/i;

/**
 * Heuristic: does this look like a raw camera filename (DSCF0678, IMG_0964.HEIC)
 * rather than a human-authored title?
 */
export function looksLikeCameraFilename(title: string | undefined | null): boolean {
  if (!title) return true;
  const trimmed = title.trim();
  if (!trimmed) return true;
  if (FILE_EXTENSION_RE.test(trimmed)) return true;
  if (FILENAME_PREFIX_RE.test(trimmed)) return true;
  return false;
}

/**
 * Return a human-friendly display title for a photo. If the underlying title is
 * a raw camera filename, fall back to album + positional index (or location).
 */
export function formatPhotoTitle(
  photo: Pick<Photo, "title" | "metadata">,
  album?: Pick<Album, "title"> | null,
  index?: number
): string {
  if (!looksLikeCameraFilename(photo.title)) return photo.title;

  const positional =
    typeof index === "number" && index >= 0
      ? ` · ${String(index + 1).padStart(2, "0")}`
      : "";

  if (album?.title) return `${album.title}${positional}`;

  const city = photo.metadata?.city;
  const location = photo.metadata?.location;
  const place = city && location ? `${city}, ${location}` : city || location;
  if (place) return `${place}${positional}`;

  return photo.title || "Untitled";
}

/** Provides a useful photo name without exposing camera filenames as link text. */
export function formatPhotoAccessibleLabel(
  photo: Pick<Photo, "title" | "caption">,
  album: Pick<Album, "title"> | string | null | undefined,
  index: number,
  locale: Locale
): string {
  const caption = photo.caption?.trim();
  if (caption) return caption;

  const title = photo.title?.trim();
  if (!looksLikeCameraFilename(title)) return title;

  const albumTitle =
    typeof album === "string" ? album.trim() : album?.title?.trim();
  const photoNumber = `${t("photo", "fallbackLabel", locale)} ${index + 1}`;

  return albumTitle ? `${albumTitle} — ${photoNumber}` : photoNumber;
}

type PhotoCopyInput = {
  caption?: string;
  metadata: Partial<
    Pick<Photo["metadata"], "city" | "locationDetail" | "location">
  >;
};

/** Returns one cleaned, display-ready location for UI and metadata copy. */
export function formatPhotoLocation(photo: PhotoCopyInput): string {
  return cleanLocationParts(
    photo.metadata.city,
    photo.metadata.locationDetail,
    photo.metadata.location
  ).join(", ");
}

export function formatPhotoShareText(
  photo: PhotoCopyInput,
  displayTitle: string
): string {
  if (photo.caption) return photo.caption;
  const location = formatPhotoLocation(photo);
  return location ? `${displayTitle} - ${location}` : displayTitle;
}

export function formatPhotoMetadataDescription(
  photo: PhotoCopyInput,
  displayTitle: string
): string {
  if (photo.caption) return photo.caption;
  const location = formatPhotoLocation(photo);
  return location ? `Photo from ${location}` : displayTitle;
}

const MEDIUM_SEGMENT_RE = /^\/photos\/[^/]+\/medium\/[^/]+$/;

/**
 * Derive the thumb/medium/full variants of an album cover from its medium path
 * (`/photos/<slug>/medium/<id>.jpg`). Anything else (external or unexpected
 * URLs) only has the one source we were given.
 */
export function coverSources(coverImage: string): {
  thumb?: string;
  medium: string;
  full?: string;
} {
  if (!MEDIUM_SEGMENT_RE.test(coverImage)) return { medium: coverImage };
  return {
    thumb: coverImage.replace("/medium/", "/thumb/"),
    medium: coverImage,
    full: coverImage.replace("/medium/", "/full/"),
  };
}

/** Cover sources for non-square slots: the square thumb crop would be upscaled. */
export function wideCoverSources(coverImage: string): {
  medium: string;
  full?: string;
} {
  const { medium, full } = coverSources(coverImage);
  return full ? { medium, full } : { medium };
}
