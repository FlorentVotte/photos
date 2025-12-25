import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Serve photos from the data directory (for standalone mode)
const PHOTOS_DIR = process.env.NODE_ENV === "production"
  ? "/app/data/photos"
  : path.join(process.cwd(), "public/photos");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filePath = path.join(PHOTOS_DIR, ...pathSegments);

  // Security: ensure path doesn't escape photos directory
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(PHOTOS_DIR)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

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
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": `"${stat.mtime.getTime()}-${stat.size}"`,
      },
    });
  } catch (error) {
    console.error("Error serving photo:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
