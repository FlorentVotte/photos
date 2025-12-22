import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const GALLERIES_FILE = path.join(process.cwd(), "sync", "galleries.json");
const ALBUMS_FILE = path.join(process.cwd(), "public", "photos", "albums.json");

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
  url: string;
  featured: boolean;
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
      const album = albumManifest?.albums.find(
        (a) => a.galleryUrl === gallery.url
      );
      return {
        ...gallery,
        title: album?.title,
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

// POST - Add a new gallery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { url, featured = false } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format (accept both full URLs and short links)
    if (!url.includes("lightroom.adobe.com/shares/") && !url.includes("adobe.ly/")) {
      return NextResponse.json(
        { error: "Invalid Lightroom share URL" },
        { status: 400 }
      );
    }

    // Resolve short URLs to full URLs
    url = await resolveShortUrl(url);

    // Verify the resolved URL is valid
    if (!url.includes("lightroom.adobe.com/shares/")) {
      return NextResponse.json(
        { error: "Could not resolve short URL to a valid Lightroom gallery" },
        { status: 400 }
      );
    }

    const galleries = await readGalleries();

    // Check for duplicates
    if (galleries.some((g) => g.url === url)) {
      return NextResponse.json(
        { error: "Gallery already exists" },
        { status: 409 }
      );
    }

    // If setting as featured, unset other featured
    if (featured) {
      galleries.forEach((g) => (g.featured = false));
    }

    galleries.push({ url, featured });
    await writeGalleries(galleries);

    return NextResponse.json({ success: true, gallery: { url, featured } });
  } catch (error) {
    console.error("Error adding gallery:", error);
    return NextResponse.json(
      { error: "Failed to add gallery" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a gallery
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const galleries = await readGalleries();
    const filtered = galleries.filter((g) => g.url !== url);

    if (filtered.length === galleries.length) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    await writeGalleries(filtered);
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
    const { url, featured } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const galleries = await readGalleries();
    const gallery = galleries.find((g) => g.url === url);

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
