import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const GALLERIES_FILE = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/galleries.json" : "sync/galleries.json"
);
const ALBUMS_FILE = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/photos/albums.json" : "public/photos/albums.json"
);

/**
 * Resolve short URLs (adobe.ly) to full Lightroom URLs
 */
async function resolveShortUrl(url: string): Promise<string> {
  if (url.includes("adobe.ly/")) {
    try {
      // Follow redirect to get the real URL
      const response = await fetch(url, { method: "HEAD", redirect: "manual" });
      const location = response.headers.get("location");
      if (location && location.includes("lightroom.adobe.com/shares/")) {
        return location;
      }
    } catch (error) {
      console.error("Failed to resolve short URL:", error);
    }
  }
  return url;
}

interface Gallery {
  url?: string;           // For public galleries
  albumId?: string;       // For private albums (from authenticated API)
  albumName?: string;     // Name of the private album
  featured: boolean;
  type: "public" | "private";
}

interface AlbumManifest {
  lastUpdated: string;
  albums: Array<{
    id: string;
    slug: string;
    title: string;
    photoCount: number;
    galleryUrl: string;
    lastSynced: string;
    featured?: boolean;
  }>;
}

async function readGalleries(): Promise<Gallery[]> {
  try {
    const data = await fs.readFile(GALLERIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeGalleries(galleries: Gallery[]): Promise<void> {
  await fs.writeFile(GALLERIES_FILE, JSON.stringify(galleries, null, 2));
}

async function readAlbums(): Promise<AlbumManifest | null> {
  try {
    const data = await fs.readFile(ALBUMS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// GET - List all galleries with their album info
export async function GET() {
  try {
    const galleries = await readGalleries();
    const albumManifest = await readAlbums();

    // Enrich galleries with album info
    const enrichedGalleries = galleries.map((gallery) => {
      // Match by URL for public galleries, or by albumId for private
      const album = albumManifest?.albums.find((a) =>
        (gallery.type === "public" && a.galleryUrl === gallery.url) ||
        (gallery.type === "private" && a.id === gallery.albumId)
      );
      return {
        ...gallery,
        title: album?.title || gallery.albumName,
        photoCount: album?.photoCount,
        lastSynced: album?.lastSynced,
      };
    });

    return NextResponse.json({ galleries: enrichedGalleries });
  } catch (error) {
    console.error("Error reading galleries:", error);
    return NextResponse.json(
      { error: "Failed to read galleries" },
      { status: 500 }
    );
  }
}

// POST - Add a new gallery (public URL or private album)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, albumId, albumName, featured = false, type = "public" } = body;

    const galleries = await readGalleries();

    // Handle private album from authenticated API
    if (type === "private") {
      if (!albumId) {
        return NextResponse.json(
          { error: "Album ID is required for private albums" },
          { status: 400 }
        );
      }

      // Check for duplicates
      if (galleries.some((g) => g.albumId === albumId)) {
        return NextResponse.json(
          { error: "Album already added" },
          { status: 409 }
        );
      }

      // If setting as featured, unset other featured
      if (featured) {
        galleries.forEach((g) => (g.featured = false));
      }

      const gallery: Gallery = { albumId, albumName, featured, type: "private" };
      galleries.push(gallery);
      await writeGalleries(galleries);

      return NextResponse.json({ success: true, gallery });
    }

    // Handle public gallery URL
    let resolvedUrl = url;

    if (!resolvedUrl) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format (accept both full URLs and short links)
    if (!resolvedUrl.includes("lightroom.adobe.com/shares/") && !resolvedUrl.includes("adobe.ly/")) {
      return NextResponse.json(
        { error: "Invalid Lightroom share URL" },
        { status: 400 }
      );
    }

    // Resolve short URLs to full URLs
    resolvedUrl = await resolveShortUrl(resolvedUrl);

    // Verify the resolved URL is valid
    if (!resolvedUrl.includes("lightroom.adobe.com/shares/")) {
      return NextResponse.json(
        { error: "Could not resolve short URL to a valid Lightroom gallery" },
        { status: 400 }
      );
    }

    // Check for duplicates
    if (galleries.some((g) => g.url === resolvedUrl)) {
      return NextResponse.json(
        { error: "Gallery already exists" },
        { status: 409 }
      );
    }

    // If setting as featured, unset other featured
    if (featured) {
      galleries.forEach((g) => (g.featured = false));
    }

    const gallery: Gallery = { url: resolvedUrl, featured, type: "public" };
    galleries.push(gallery);
    await writeGalleries(galleries);

    return NextResponse.json({ success: true, gallery });
  } catch (error) {
    console.error("Error adding gallery:", error);
    return NextResponse.json(
      { error: "Failed to add gallery" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a gallery and its synced data
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, albumId } = body;

    if (!url && !albumId) {
      return NextResponse.json(
        { error: "URL or albumId is required" },
        { status: 400 }
      );
    }

    const galleries = await readGalleries();
    const filtered = galleries.filter((g) =>
      albumId ? g.albumId !== albumId : g.url !== url
    );

    if (filtered.length === galleries.length) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    await writeGalleries(filtered);

    // Also remove the album from albums.json
    const albumManifest = await readAlbums();
    if (albumManifest) {
      const albumToRemove = albumManifest.albums.find((a) =>
        albumId ? a.id === albumId : a.galleryUrl === url
      );
      if (albumToRemove) {
        // Remove album from manifest
        albumManifest.albums = albumManifest.albums.filter((a) =>
          albumId ? a.id !== albumId : a.galleryUrl !== url
        );
        albumManifest.lastUpdated = new Date().toISOString();
        await fs.writeFile(ALBUMS_FILE, JSON.stringify(albumManifest, null, 2));

        // Optionally delete the album's photo folder
        const photosDir = path.join(
          process.cwd(),
          process.env.NODE_ENV === "production" ? "data/photos" : "public/photos",
          albumToRemove.slug
        );
        try {
          await fs.rm(photosDir, { recursive: true, force: true });
        } catch {
          // Folder may not exist, ignore
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing gallery:", error);
    return NextResponse.json(
      { error: "Failed to remove gallery" },
      { status: 500 }
    );
  }
}

// PATCH - Update gallery (toggle featured)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, albumId, featured } = body;

    if (!url && !albumId) {
      return NextResponse.json(
        { error: "URL or albumId is required" },
        { status: 400 }
      );
    }

    const galleries = await readGalleries();
    const gallery = galleries.find((g) =>
      albumId ? g.albumId === albumId : g.url === url
    );

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // If setting as featured, unset others
    if (featured) {
      galleries.forEach((g) => (g.featured = false));
    }

    gallery.featured = featured;
    await writeGalleries(galleries);

    return NextResponse.json({ success: true, gallery });
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}
