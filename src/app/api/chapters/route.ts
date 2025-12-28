import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import type { Chapter, Photo } from "@prisma/client";

interface ChapterInput {
  id: string;
  title: string;
  titleFr?: string;
  narrative?: string;
  narrativeFr?: string;
  photoIds: string[];
  coverPhotoId?: string;
  featuredPhotoIds?: string[];
}

// GET - Get chapters and photos for an album
export async function GET(request: NextRequest) {
  const albumId = request.nextUrl.searchParams.get("albumId");

  if (!albumId) {
    return NextResponse.json({ error: "albumId required" }, { status: 400 });
  }

  try {
    // Get chapters from database
    const dbChapters = await prisma.chapter.findMany({
      where: { albumId },
      orderBy: { sortOrder: "asc" },
    });

    const chapters = dbChapters.map((c: Chapter) => ({
      id: c.id,
      title: c.title,
      titleFr: c.titleFr || "",
      narrative: c.content || "",
      narrativeFr: c.contentFr || "",
      photoIds: JSON.parse(c.photoIds) as string[],
      coverPhotoId: c.coverPhotoId || undefined,
      featuredPhotoIds: c.featuredPhotoIds
        ? (JSON.parse(c.featuredPhotoIds) as string[])
        : [],
    }));

    // Get photos from database
    const dbPhotos = await prisma.photo.findMany({
      where: { albumId },
      orderBy: { sortOrder: "asc" },
    });

    const photos = dbPhotos.map((p: Photo) => ({
      id: p.id,
      title: p.title || "",
      src: {
        thumb: p.thumbPath || "",
        medium: p.mediumPath || "",
      },
      albumId: p.albumId,
    }));

    return NextResponse.json({ chapters, photos });
  } catch (error) {
    console.error("Error loading chapters:", error);
    return NextResponse.json({ error: "Failed to load chapters" }, { status: 500 });
  }
}

// POST - Create or update chapters for an album
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { albumId, chapters } = (await request.json()) as {
      albumId: string;
      chapters: ChapterInput[];
    };

    if (!albumId || !chapters) {
      return NextResponse.json({ error: "albumId and chapters required" }, { status: 400 });
    }

    // Delete existing chapters for this album
    await prisma.chapter.deleteMany({ where: { albumId } });

    // Create new chapters
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      await prisma.chapter.create({
        data: {
          id: chapter.id.startsWith("chapter-") ? undefined : chapter.id, // Let Prisma generate ID for new chapters
          albumId,
          title: chapter.title,
          titleFr: chapter.titleFr || null,
          content: chapter.narrative || null,
          contentFr: chapter.narrativeFr || null,
          photoIds: JSON.stringify(chapter.photoIds),
          coverPhotoId: chapter.coverPhotoId || null,
          featuredPhotoIds: chapter.featuredPhotoIds?.length
            ? JSON.stringify(chapter.featuredPhotoIds)
            : null,
          sortOrder: i,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving chapters:", error);
    return NextResponse.json({ error: "Failed to save chapters" }, { status: 500 });
  }
}

// DELETE - Remove all chapters for an album
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { albumId } = await request.json();

    if (!albumId) {
      return NextResponse.json({ error: "albumId required" }, { status: 400 });
    }

    await prisma.chapter.deleteMany({ where: { albumId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chapters:", error);
    return NextResponse.json({ error: "Failed to delete chapters" }, { status: 500 });
  }
}
