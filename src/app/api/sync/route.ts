import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import prisma from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { secureCompare, SimpleRateLimiter } from "@/lib/security";
import { RATE_LIMITS, SYNC } from "@/lib/constants";
import { JSON_BODY_LIMITS, JsonBodyError, readJsonBody } from "@/lib/request-json";

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
    // Check for galleryId in request body. An absent body retains the existing
    // sync-all behavior, while malformed and oversized bodies are client errors.
    let galleryId: string | undefined;
    if (request.body) {
      const body = await readJsonBody<{ galleryId?: string }>(request, JSON_BODY_LIMITS.METADATA);
      galleryId = body.galleryId;
      // Validate galleryId format to prevent command injection
      if (galleryId && !/^[a-zA-Z0-9_-]+$/.test(galleryId)) {
        return NextResponse.json({ error: "Invalid gallery ID" }, { status: 400 });
      }
    }

    // Build command arguments safely (no string concatenation).
    // Invoke the compiled sync script with the running node binary rather than
    // `npm run sync`. The npm script is literally `node dist/sync/index.js`, so
    // this is the same command with one less process layer — and npm is not
    // present in the runner image (removed because its bundled dependencies
    // are a recurring source of scanner CVEs that no package.json change can
    // reach). process.execPath is the node binary already running this server.
    // Note: no `--` separator here; that was only needed to pass args through npm.
    const args = ["dist/sync/index.js"];
    if (galleryId) {
      args.push("--gallery", galleryId);
    }

    console.log(`Starting sync... ${galleryId ? `(gallery: ${galleryId})` : "(all)"}`);

    // Run the sync script using execFile (prevents command injection)
    const { stdout, stderr } = await execFileAsync(process.execPath, args, {
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
    if (error instanceof JsonBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Sync error:", error);

    // Don't leak error details to client
    return NextResponse.json(
      { error: "Sync failed. Please check server logs." },
      { status: 500 }
    );
  }
}
