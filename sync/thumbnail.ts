import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { config } from "./config";

interface ThumbnailResult {
  thumb: string;
  medium: string;
  full: string;
}

/**
 * Downloads an image and generates multiple thumbnail sizes.
 * Returns the relative paths to the generated images.
 *
 * @param imageUrl - URL to download from
 * @param albumSlug - Album slug for directory structure
 * @param photoId - Photo ID for filename
 * @param authHeaders - Optional auth headers for Adobe API URLs
 */
export async function generateThumbnails(
  imageUrl: string,
  albumSlug: string,
  photoId: string,
  authHeaders?: Record<string, string>
): Promise<ThumbnailResult | null> {
  try {
    console.log(`  Downloading: ${photoId}`);

    // Download the original image
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    };

    // Add auth headers for Adobe API URLs (use URL parsing for security)
    if (authHeaders) {
      Object.assign(headers, authHeaders);
    } else {
      try {
        const parsedUrl = new URL(imageUrl);
        if (parsedUrl.hostname === "lr.adobe.io" || parsedUrl.hostname.endsWith(".adobe.io")) {
          // Fallback for public gallery URLs
          headers["x-api-key"] = "LightroomMobileWeb1";
        }
      } catch {
        // Invalid URL, skip adding headers
      }
    }

    const response = await fetch(imageUrl, { headers });

    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Create output directories
    const albumDir = path.join(config.outputDir, albumSlug);
    const thumbDir = path.join(albumDir, "thumb");
    const mediumDir = path.join(albumDir, "medium");
    const fullDir = path.join(albumDir, "full");

    await fs.mkdir(thumbDir, { recursive: true });
    await fs.mkdir(mediumDir, { recursive: true });
    await fs.mkdir(fullDir, { recursive: true });

    // Generate filenames
    const filename = `${photoId}.jpg`;
    const thumbPath = path.join(thumbDir, filename);
    const mediumPath = path.join(mediumDir, filename);
    const fullPath = path.join(fullDir, filename);

    // Process image with sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Generate thumbnail (400px)
    await image
      .clone()
      .resize(config.imageSizes.thumb, config.imageSizes.thumb, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: config.jpegQuality })
      .toFile(thumbPath);

    // Generate medium (1200px width, maintain aspect ratio)
    await image
      .clone()
      .resize(config.imageSizes.medium, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: config.jpegQuality })
      .toFile(mediumPath);

    // Generate full size (2400px width, maintain aspect ratio)
    await image
      .clone()
      .resize(config.imageSizes.full, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: config.jpegQuality })
      .toFile(fullPath);

    // Return relative paths for the website
    return {
      thumb: `/photos/${albumSlug}/thumb/${filename}`,
      medium: `/photos/${albumSlug}/medium/${filename}`,
      full: `/photos/${albumSlug}/full/${filename}`,
    };
  } catch (error) {
    console.error(`Error generating thumbnails for ${photoId}:`, error);
    return null;
  }
}

/**
 * Check if thumbnails already exist for a photo
 */
export async function thumbnailsExist(
  albumSlug: string,
  photoId: string
): Promise<boolean> {
  const filename = `${photoId}.jpg`;
  const thumbPath = path.join(
    config.outputDir,
    albumSlug,
    "thumb",
    filename
  );

  try {
    await fs.access(thumbPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete all thumbnails for an album
 */
export async function deleteAlbumThumbnails(albumSlug: string): Promise<void> {
  const albumDir = path.join(config.outputDir, albumSlug);

  try {
    await fs.rm(albumDir, { recursive: true, force: true });
    console.log(`Deleted thumbnails for album: ${albumSlug}`);
  } catch (error) {
    // Directory might not exist, that's OK
  }
}
