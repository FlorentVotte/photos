import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { secureCompare, SimpleRateLimiter } from "@/lib/security";
import { RATE_LIMITS } from "@/lib/constants";
import type { SyncProgress } from "@/lib/sync-progress";

const WEBHOOK_SECRET = process.env.SYNC_WEBHOOK_SECRET;

// Track active syncs to prevent concurrent runs
let activeSyncAbortController: AbortController | null = null;

// Rate limiting: 1 sync per minute
const syncStreamRateLimiter = new SimpleRateLimiter(RATE_LIMITS.SYNC_WINDOW_MS);

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit sync requests
  if (syncStreamRateLimiter.isLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Please wait before triggering another sync." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check authentication (session cookie or webhook secret)
  const webhookSecret = request.headers.get("x-webhook-secret");
  const isWebhookValid =
    WEBHOOK_SECRET &&
    webhookSecret &&
    secureCompare(webhookSecret, WEBHOOK_SECRET);
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && !isWebhookValid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Record sync attempt for rate limiting
  syncStreamRateLimiter.recordAttempt(ip);

  // Check for galleryId in request body
  let galleryId: string | undefined;
  try {
    const body = await request.json();
    galleryId = body.galleryId;
    // Validate galleryId format
    if (galleryId && !/^[a-zA-Z0-9_-]+$/.test(galleryId)) {
      return new Response(JSON.stringify({ error: "Invalid gallery ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    // No body or invalid JSON, sync all
  }

  // Prevent concurrent syncs
  if (activeSyncAbortController) {
    return new Response(
      JSON.stringify({ error: "A sync is already in progress" }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Create abort controller for this sync
  activeSyncAbortController = new AbortController();
  const abortSignal = activeSyncAbortController.signal;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (progress: SyncProgress) => {
        if (abortSignal.aborted) return;
        try {
          const data = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          // Controller might be closed
        }
      };

      try {
        // Dynamic import to avoid module-level Prisma issues
        const { runSync } = await import("../../../../../sync/index");

        // Run sync with progress callback
        const result = await runSync(galleryId, sendEvent);

        // Send final completion event
        sendEvent({
          status: "completed",
          phase: "complete",
          totalGalleries: result.albums,
          currentGalleryIndex: result.albums,
          currentGalleryName: "",
          totalPhotos: result.photos,
          currentPhotoIndex: result.photos,
          currentPhotoName: "",
          message: `Synced ${result.albums} albums with ${result.photos} photos`,
          startedAt: null,
          completedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Sync stream error:", error);

        // Send error event
        sendEvent({
          status: "error",
          phase: "complete",
          totalGalleries: 0,
          currentGalleryIndex: 0,
          currentGalleryName: "",
          totalPhotos: 0,
          currentPhotoIndex: 0,
          currentPhotoName: "",
          message: "Sync failed",
          startedAt: null,
          completedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        activeSyncAbortController = null;
        controller.close();
      }
    },

    cancel() {
      // Client disconnected
      if (activeSyncAbortController) {
        activeSyncAbortController.abort();
        activeSyncAbortController = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

// GET endpoint to check if sync is in progress (authenticated)
export async function GET() {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      syncing: activeSyncAbortController !== null,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
