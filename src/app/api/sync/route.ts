import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import crypto from "crypto";
import prisma from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

const execFileAsync = promisify(execFile);
const WEBHOOK_SECRET = process.env.SYNC_WEBHOOK_SECRET;

// Rate limiting for sync endpoint
const syncAttempts = new Map<string, number>();
const SYNC_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isSyncRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastAttempt = syncAttempts.get(ip);

  if (!lastAttempt) return false;
  if (now - lastAttempt > SYNC_RATE_LIMIT_WINDOW) {
    syncAttempts.delete(ip);
    return false;
  }

  return true;
}

// Timing-safe comparison for webhook secret
function secureCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  // Rate limit sync requests
  if (isSyncRateLimited(ip)) {
    return NextResponse.json(
      { error: "Please wait before triggering another sync." },
      { status: 429 }
    );
  }

  // Check authentication (session cookie or webhook secret)
  const webhookSecret = request.headers.get("x-webhook-secret");
  const isWebhookValid = WEBHOOK_SECRET && webhookSecret && secureCompare(webhookSecret, WEBHOOK_SECRET);

  if (!isAuthenticated() && !isWebhookValid) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Record sync attempt for rate limiting
  syncAttempts.set(ip, Date.now());

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
      timeout: 300000, // 5 minute timeout
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
