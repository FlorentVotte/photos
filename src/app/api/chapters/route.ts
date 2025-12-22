import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALBUMS_FILE = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/photos/albums.json" : "public/photos/albums.json"
);

interface Chapter {
  id: string;
  title: string;
  narrative?: string;
  photoIds: string[];
}

interface AlbumManifest {
  lastUpdated: string;
  albums: any[];
  photos: any[];
  chapters: Record<string, Chapter[]>;
}

async function loadManifest(): Promise<AlbumManifest> {
  try {
    const data = await fs.readFile(ALBUMS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { lastUpdated: "", albums: [], photos: [], chapters: {} };
  }
}

async function saveManifest(manifest: AlbumManifest): Promise<void> {
  manifest.lastUpdated = new Date().toISOString();
  await fs.writeFile(ALBUMS_FILE, JSON.stringify(manifest, null, 2));
}

// GET - Get chapters for an album
export async function GET(request: NextRequest) {
  const albumId = request.nextUrl.searchParams.get("albumId");

  if (!albumId) {
    return NextResponse.json({ error: "albumId required" }, { status: 400 });
  }

  try {
    const manifest = await loadManifest();
    const chapters = manifest.chapters?.[albumId] || [];
    const photos = manifest.photos.filter((p: any) => p.albumId === albumId);

    return NextResponse.json({ chapters, photos });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load chapters" }, { status: 500 });
  }
}

// POST - Create or update chapters for an album
export async function POST(request: NextRequest) {
  try {
    const { albumId, chapters } = await request.json();

    if (!albumId || !chapters) {
      return NextResponse.json({ error: "albumId and chapters required" }, { status: 400 });
    }

    const manifest = await loadManifest();

    if (!manifest.chapters) {
      manifest.chapters = {};
    }

    manifest.chapters[albumId] = chapters;
    await saveManifest(manifest);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving chapters:", error);
    return NextResponse.json({ error: "Failed to save chapters" }, { status: 500 });
  }
}

// DELETE - Remove all chapters for an album
export async function DELETE(request: NextRequest) {
  try {
    const { albumId } = await request.json();

    if (!albumId) {
      return NextResponse.json({ error: "albumId required" }, { status: 400 });
    }

    const manifest = await loadManifest();

    if (manifest.chapters?.[albumId]) {
      delete manifest.chapters[albumId];
      await saveManifest(manifest);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete chapters" }, { status: 500 });
  }
}
