import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - List all synced albums
export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      orderBy: [{ sortOrder: "asc" }, { lastSynced: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        location: true,
        date: true,
        photoCount: true,
        sortOrder: true,
        featured: true,
        lastSynced: true,
      },
    });

    return NextResponse.json({ albums });
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

// PUT - Reorder albums (batch update sortOrder)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { albumOrder } = body;

    if (!albumOrder || !Array.isArray(albumOrder)) {
      return NextResponse.json(
        { error: "albumOrder array is required" },
        { status: 400 }
      );
    }

    // Update each album's sortOrder
    await Promise.all(
      albumOrder.map((albumId: string, index: number) =>
        prisma.album.update({
          where: { id: albumId },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering albums:", error);
    return NextResponse.json(
      { error: "Failed to reorder albums" },
      { status: 500 }
    );
  }
}

// PATCH - Update album metadata
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subtitle, description, location, date } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      );
    }

    // Build update data object with only provided fields
    const updateData: Record<string, string | null> = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle || null;
    if (description !== undefined) updateData.description = description || null;
    if (location !== undefined) updateData.location = location || null;
    if (date !== undefined) updateData.date = date || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const album = await prisma.album.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, album });
  } catch (error) {
    console.error("Error updating album:", error);
    return NextResponse.json(
      { error: "Failed to update album" },
      { status: 500 }
    );
  }
}
