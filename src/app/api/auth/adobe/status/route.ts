import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TOKENS_FILE = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/adobe-tokens.json" : "adobe-tokens.json"
);

export async function GET() {
  const hasClientId = !!process.env.ADOBE_CLIENT_ID;
  const hasClientSecret = !!process.env.ADOBE_CLIENT_SECRET;

  let connected = false;
  let expiresAt: string | null = null;
  let updatedAt: string | null = null;

  try {
    const data = await fs.readFile(TOKENS_FILE, "utf-8");
    const tokens = JSON.parse(data);

    if (tokens.access_token) {
      connected = true;
      expiresAt = tokens.expires_at ? new Date(tokens.expires_at).toISOString() : null;
      updatedAt = tokens.updated_at || null;

      // Check if token is expired
      if (tokens.expires_at && Date.now() > tokens.expires_at) {
        connected = false;
      }
    }
  } catch {
    // No tokens file or invalid
  }

  return NextResponse.json({
    configured: hasClientId && hasClientSecret,
    connected,
    expiresAt,
    updatedAt,
  });
}
