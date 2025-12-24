import { NextRequest } from "next/server";
import crypto from "crypto";
import { isAuthenticated } from "@/lib/auth";
import type { SyncProgress } from "@/lib/sync-progress";

const WEBHOOK_SECRET = process.env.SYNC_WEBHOOK_SECRET;

// Track active syncs to prevent concurrent runs
let activeSyncAbortController: AbortController | null = null;

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

export async function POST(request: NextRequest) {
  // Check authentication (session cookie or webhook secret)
  const webhookSecret = request.headers.get("x-webhook-secret");
  const isWebhookValid =
    WEBHOOK_SECRET &&
    webhookSecret &&
    secureCompare(webhookSecret, WEBHOOK_SECRET);

  if (!isAuthenticated() && !isWebhookValid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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

// GET endpoint to check if sync is in progress
export async function GET() {
  return new Response(
    JSON.stringify({
      syncing: activeSyncAbortController !== null,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
