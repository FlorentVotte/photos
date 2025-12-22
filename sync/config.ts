import path from "path";

export const config = {
  // Tag that identifies albums to sync (in album title or description)
  // Set to empty string "" to sync all galleries
  syncTag: "",

  // Your Lightroom public gallery URLs
  // Add URLs here after making albums public in Lightroom
  // Format: https://lightroom.adobe.com/shares/XXXXXXXX
  galleryUrls: [] as string[],

  // Output directories
  outputDir: path.join(process.cwd(), "public", "photos"),
  manifestPath: path.join(process.cwd(), "public", "photos", "albums.json"),

  // Image sizes for thumbnails
  imageSizes: {
    thumb: 400,   // For grid thumbnails
    medium: 1200, // For album view
    full: 2400,   // For photo detail view
  },

  // Sync interval (in milliseconds) - 30 minutes
  syncInterval: 30 * 60 * 1000,

  // JPEG quality for resized images
  jpegQuality: 85,
};

export type Config = typeof config;
