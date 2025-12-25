import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * Allowed domains for URL resolution (SSRF protection)
 */
const ALLOWED_DOMAINS = ["adobe.ly", "lightroom.adobe.com"];

/**
 * Validate URL is from allowed domain
 */
function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ALLOWED_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

// Pattern for valid adobe.ly short code (alphanumeric only, 4-20 chars)
const ADOBE_SHORT_CODE_PATTERN = /^\/[a-zA-Z0-9]{4,20}$/;

/**
 * Resolve short URLs (adobe.ly) to full Lightroom URLs
 */
async function resolveShortUrl(url: string): Promise<string> {
  // Validate and parse URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    console.error("Invalid URL format:", url);
    return url;
  }

  // Only process adobe.ly short URLs with valid protocol
  if (parsedUrl.hostname !== "adobe.ly" || parsedUrl.protocol !== "https:") {
    return url;
  }

  // Strictly validate pathname format (SSRF protection)
  // Adobe.ly short codes are alphanumeric only, like /3xYz123
  if (!ADOBE_SHORT_CODE_PATTERN.test(parsedUrl.pathname)) {
    console.error("Invalid adobe.ly short code format:", parsedUrl.pathname);
    return url;
  }

  try {
    // Construct URL using only the validated short code (no query params)
    const safeUrl = `https://adobe.ly${parsedUrl.pathname}`;
    const response = await fetch(safeUrl, { method: "HEAD", redirect: "manual" });
    const location = response.headers.get("location");

    if (location) {
      const locationUrl = new URL(location);
      // Strictly validate the redirect target
      if (locationUrl.hostname === "lightroom.adobe.com" &&
          locationUrl.pathname.startsWith("/shares/") &&
          locationUrl.protocol === "https:") {
        return location;
      }
    }
  } catch (error) {
    console.error("Failed to resolve short URL:", error);
  }
  return url;
}

// GET - List all galleries with their album info
export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      include: {
        album: {
          select: {
            id: true,
            title: true,
            photoCount: true,
            lastSynced: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedGalleries = galleries.map((gallery) => ({
      id: gallery.id,
      url: gallery.url,
      albumId: gallery.albumId,
      albumName: gallery.albumName,
      type: gallery.type,
      featured: gallery.featured,
      title: gallery.album?.title || gallery.albumName,
      photoCount: gallery.album?.photoCount,
      lastSynced: gallery.album?.lastSynced?.toISOString(),
    }));

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
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { url, albumId, albumName, featured = false, type = "public" } = body;

    // Handle private album from authenticated API
    if (type === "private") {
      if (!albumId) {
        return NextResponse.json(
          { error: "Album ID is required for private albums" },
          { status: 400 }
        );
      }

      // Check for duplicates
      const existing = await prisma.gallery.findUnique({ where: { albumId } });
      if (existing) {
        return NextResponse.json(
          { error: "Album already added" },
          { status: 409 }
        );
      }

      // If setting as featured, unset others
      if (featured) {
        await prisma.gallery.updateMany({
          where: { featured: true },
          data: { featured: false },
        });
      }

      const gallery = await prisma.gallery.create({
        data: { albumId, albumName, featured, type: "private" },
      });

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

    // Validate URL format
    if (!resolvedUrl.includes("lightroom.adobe.com/shares/") && !resolvedUrl.includes("adobe.ly/")) {
      return NextResponse.json(
        { error: "Invalid Lightroom share URL" },
        { status: 400 }
      );
    }

    // Resolve short URLs
    resolvedUrl = await resolveShortUrl(resolvedUrl);

    if (!resolvedUrl.includes("lightroom.adobe.com/shares/")) {
      return NextResponse.json(
        { error: "Could not resolve short URL to a valid Lightroom gallery" },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await prisma.gallery.findUnique({ where: { url: resolvedUrl } });
    if (existing) {
      return NextResponse.json(
        { error: "Gallery already exists" },
        { status: 409 }
      );
    }

    // If setting as featured, unset others
    if (featured) {
      await prisma.gallery.updateMany({
        where: { featured: true },
        data: { featured: false },
      });
    }

    const gallery = await prisma.gallery.create({
      data: { url: resolvedUrl, featured, type: "public" },
    });

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
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, url, albumId } = body;

    if (!id && !url && !albumId) {
      return NextResponse.json(
        { error: "id, url, or albumId is required" },
        { status: 400 }
      );
    }

    // Find the gallery
    let gallery;
    if (id) {
      gallery = await prisma.gallery.findUnique({ where: { id } });
    } else if (albumId) {
      gallery = await prisma.gallery.findUnique({ where: { albumId } });
    } else if (url) {
      gallery = await prisma.gallery.findUnique({ where: { url } });
    }

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Find associated album
    const album = await prisma.album.findFirst({
      where: gallery.albumId
        ? { id: gallery.albumId }
        : { galleryUrl: gallery.url || undefined },
    });

    // Delete gallery
    await prisma.gallery.delete({ where: { id: gallery.id } });

    // Delete album and its photos if exists
    if (album) {
      // Delete photo files
      const photosDir = path.join(
        process.cwd(),
        process.env.NODE_ENV === "production" ? "data/photos" : "public/photos",
        album.slug
      );
      try {
        await fs.rm(photosDir, { recursive: true, force: true });
      } catch {
        // Folder may not exist
      }

      // Delete album (cascades to photos and chapters)
      await prisma.album.delete({ where: { id: album.id } });
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
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, url, albumId, featured } = body;

    if (!id && !url && !albumId) {
      return NextResponse.json(
        { error: "id, url, or albumId is required" },
        { status: 400 }
      );
    }

    // Find the gallery
    let gallery;
    if (id) {
      gallery = await prisma.gallery.findUnique({ where: { id } });
    } else if (albumId) {
      gallery = await prisma.gallery.findUnique({ where: { albumId } });
    } else if (url) {
      gallery = await prisma.gallery.findUnique({ where: { url } });
    }

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // If setting as featured, unset others
    if (featured) {
      await prisma.gallery.updateMany({
        where: { featured: true },
        data: { featured: false },
      });
    }

    const updated = await prisma.gallery.update({
      where: { id: gallery.id },
      data: { featured },
    });

    // Also update the album's featured status
    const album = await prisma.album.findFirst({
      where: gallery.albumId
        ? { id: gallery.albumId }
        : { galleryUrl: gallery.url || undefined },
    });

    if (album) {
      await prisma.album.update({
        where: { id: album.id },
        data: { featured },
      });
    }

    return NextResponse.json({ success: true, gallery: updated });
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}
