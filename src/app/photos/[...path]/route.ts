import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { Readable } from "stream";
import path from "path";
import { etagMatches } from "@/lib/http-cache";

// Serve photos from the data directory (for standalone mode)
const PHOTOS_DIR = path.resolve(
  process.env.NODE_ENV === "production"
    ? "/app/data/photos"
    : path.join(process.cwd(), "public/photos")
);
const PHOTOS_DIR_PREFIX = PHOTOS_DIR + path.sep;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  // Reject any segment that contains separators or null bytes outright;
  // these should never appear in a legitimate path segment.
  for (const segment of pathSegments) {
    if (
      typeof segment !== "string" ||
      segment.includes("\0") ||
      segment.includes("/") ||
      segment.includes("\\")
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const filePath = path.resolve(PHOTOS_DIR, ...pathSegments);

  // Security: ensure path is inside photos directory (or is the dir itself).
  if (filePath !== PHOTOS_DIR && !filePath.startsWith(PHOTOS_DIR_PREFIX)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    // Stat the resolved, validated path; ENOENT means not found.
    let stat: fs.Stats;
    try {
      stat = await fs.promises.stat(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return new NextResponse("Not Found", { status: 404 });
      }
      throw err;
    }
    if (!stat.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const etag = `"${stat.mtime.getTime()}-${stat.size}"`;
    const cacheControl = "public, max-age=31536000, immutable";

    if (etagMatches(request.headers.get("if-none-match"), etag)) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: etag, "Cache-Control": cacheControl },
      });
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "application/octet-stream";

    // Return with aggressive caching (images don't change)
    const body = Readable.toWeb(
      fs.createReadStream(filePath)
    ) as unknown as ReadableStream;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": cacheControl,
        ETag: etag,
      },
    });
  } catch (error) {
    console.error("Error serving photo:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
