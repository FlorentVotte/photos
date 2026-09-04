import type { Album, Photo } from "@/lib/types";
import { t } from "@/lib/translations";
import type { Locale } from "@/lib/translations";

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
