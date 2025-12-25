import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { VALIDATION } from "@/lib/constants";

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
  const authError = await requireAuth();
  if (authError) return authError;

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
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, title, subtitle, description, location, date } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      );
    }

    // Validate ID format
    if (typeof id !== "string" || id.length > VALIDATION.MAX_ID_LENGTH) {
      return NextResponse.json(
        { error: "Invalid album ID" },
        { status: 400 }
      );
    }

    // Validate string lengths
    if (title && (typeof title !== "string" || title.length > VALIDATION.MAX_TITLE_LENGTH)) {
      return NextResponse.json(
        { error: `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (subtitle && (typeof subtitle !== "string" || subtitle.length > VALIDATION.MAX_SUBTITLE_LENGTH)) {
      return NextResponse.json(
        { error: `Subtitle must be less than ${VALIDATION.MAX_SUBTITLE_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (description && (typeof description !== "string" || description.length > VALIDATION.MAX_DESCRIPTION_LENGTH)) {
      return NextResponse.json(
        { error: `Description must be less than ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (location && (typeof location !== "string" || location.length > VALIDATION.MAX_LOCATION_LENGTH)) {
      return NextResponse.json(
        { error: `Location must be less than ${VALIDATION.MAX_LOCATION_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (date && (typeof date !== "string" || date.length > VALIDATION.MAX_DATE_LENGTH)) {
      return NextResponse.json(
        { error: `Date must be less than ${VALIDATION.MAX_DATE_LENGTH} characters` },
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
