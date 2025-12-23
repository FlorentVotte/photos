import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - List all synced albums
export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { lastSynced: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        location: true,
        date: true,
        photoCount: true,
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
