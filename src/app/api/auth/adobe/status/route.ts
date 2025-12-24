import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

export async function GET() {
  // Require authentication to prevent info leakage
  if (!isAuthenticated()) {
    return NextResponse.json(
      { configured: false, connected: false },
      { status: 401 }
    );
  }

  const hasClientId = !!process.env.ADOBE_CLIENT_ID;
  const hasClientSecret = !!process.env.ADOBE_CLIENT_SECRET;

  let connected = false;
  let expiresAt: string | null = null;
  let updatedAt: string | null = null;

  try {
    const token = await prisma.adobeToken.findUnique({
      where: { id: "default" },
    });

    if (token) {
      expiresAt = token.expiresAt.toISOString();
      updatedAt = token.updatedAt.toISOString();

      // Check if token is expired
      if (new Date() < token.expiresAt) {
        connected = true;
      }
    }
  } catch (err) {
    console.error("Error checking Adobe token:", err);
  }

  return NextResponse.json({
    configured: hasClientId && hasClientSecret,
    connected,
    expiresAt,
    updatedAt,
  });
}
