import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

const execAsync = promisify(exec);
const WEBHOOK_SECRET = process.env.SYNC_WEBHOOK_SECRET;

// GET - Get sync status
export async function GET() {
  try {
    const [albumCount, photoCount, lastAlbum] = await Promise.all([
      prisma.album.count(),
      prisma.photo.count(),
      prisma.album.findFirst({
        orderBy: { lastSynced: "desc" },
        select: { lastSynced: true },
      }),
    ]);

    return NextResponse.json({
      lastUpdated: lastAlbum?.lastSynced?.toISOString() || null,
      albumCount,
      photoCount,
    });
  } catch {
    return NextResponse.json({
      lastUpdated: null,
      albumCount: 0,
      photoCount: 0,
    });
  }
}

// POST - Trigger sync (authenticated via cookie or webhook secret)
export async function POST(request: NextRequest) {
  // Check authentication
  const authCookie = cookies().get("admin_auth");
  const webhookSecret = request.headers.get("x-webhook-secret");

  const isAuthenticated =
    authCookie?.value === "authenticated" ||
    (WEBHOOK_SECRET && webhookSecret === WEBHOOK_SECRET);

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized. Provide valid admin session or webhook secret." },
      { status: 401 }
    );
  }
  try {
    console.log("Starting sync...");

    // Run the sync script
    const { stdout, stderr } = await execAsync("npm run sync", {
      cwd: process.cwd(),
      timeout: 300000, // 5 minute timeout
    });

    console.log("Sync stdout:", stdout);
    if (stderr) console.log("Sync stderr:", stderr);

    // Parse results from the output
    const albumMatch = stdout.match(/Total albums: (\d+)/);
    const photoMatch = stdout.match(/Total photos: (\d+)/);

    const albums = albumMatch ? parseInt(albumMatch[1]) : 0;
    const photos = photoMatch ? parseInt(photoMatch[1]) : 0;

    return NextResponse.json({
      success: true,
      albums,
      photos,
      message: `Successfully synced ${albums} albums with ${photos} photos`,
    });
  } catch (error: any) {
    console.error("Sync error:", error);

    return NextResponse.json(
      {
        error: "Sync failed",
        message: error.message || "Unknown error",
        stderr: error.stderr,
      },
      { status: 500 }
    );
  }
}
