import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import prisma from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { secureCompare, SimpleRateLimiter } from "@/lib/security";
import { RATE_LIMITS, SYNC } from "@/lib/constants";

const execFileAsync = promisify(execFile);
const WEBHOOK_SECRET = process.env.SYNC_WEBHOOK_SECRET;

// Rate limiting: 1 sync per minute
const syncRateLimiter = new SimpleRateLimiter(RATE_LIMITS.SYNC_WINDOW_MS);

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
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json({
      lastUpdated: null,
      albumCount: 0,
      photoCount: 0,
    });
  }
}

// POST - Trigger sync (authenticated via cookie or webhook secret)
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  // Rate limit sync requests
  if (syncRateLimiter.isLimited(ip)) {
    return NextResponse.json(
      { error: "Please wait before triggering another sync." },
      { status: 429 }
    );
  }

  // Check authentication (session cookie or webhook secret)
  const webhookSecret = request.headers.get("x-webhook-secret");
  const isWebhookValid = WEBHOOK_SECRET && webhookSecret && secureCompare(webhookSecret, WEBHOOK_SECRET);
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && !isWebhookValid) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Record sync attempt for rate limiting
  syncRateLimiter.recordAttempt(ip);

  try {
    // Check for galleryId in request body
    let galleryId: string | undefined;
    try {
      const body = await request.json();
      galleryId = body.galleryId;
      // Validate galleryId format to prevent command injection
      if (galleryId && !/^[a-zA-Z0-9_-]+$/.test(galleryId)) {
        return NextResponse.json({ error: "Invalid gallery ID" }, { status: 400 });
      }
    } catch {
      // No body or invalid JSON, sync all
    }

    // Build command arguments safely (no string concatenation)
    const args = ["run", "sync"];
    if (galleryId) {
      args.push("--", "--gallery", galleryId);
    }

    console.log(`Starting sync... ${galleryId ? `(gallery: ${galleryId})` : "(all)"}`);

    // Run the sync script using execFile (prevents command injection)
    const { stdout, stderr } = await execFileAsync("npm", args, {
      cwd: process.cwd(),
      timeout: SYNC.PROCESS_TIMEOUT_MS,
    });

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
      galleryId,
      message: galleryId
        ? `Successfully synced gallery`
        : `Successfully synced ${albums} albums with ${photos} photos`,
    });
  } catch (error: unknown) {
    console.error("Sync error:", error);

    // Don't leak error details to client
    return NextResponse.json(
      { error: "Sync failed. Please check server logs." },
      { status: 500 }
    );
  }
}
