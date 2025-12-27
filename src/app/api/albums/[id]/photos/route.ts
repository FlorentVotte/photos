import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - Get photos for an album (for cover picker)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;

    // Get album to verify it exists
    const album = await prisma.album.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!album) {
      return NextResponse.json(
        { error: "Album not found" },
        { status: 404 }
      );
    }

    // Get photos for this album (just thumbnails for picker)
    const photos = await prisma.photo.findMany({
      where: { albumId: id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        mediumPath: true,
        thumbPath: true,
      },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching album photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
