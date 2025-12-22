import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const ADOBE_CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const ADOBE_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/adobe/callback`
  : "http://localhost:3000/api/auth/adobe/callback";

const TOKENS_FILE = path.join(
  process.cwd(),
  process.env.NODE_ENV === "production" ? "data/adobe-tokens.json" : "adobe-tokens.json"
);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code" }, { status: 400 });
  }

  if (!ADOBE_CLIENT_ID || !ADOBE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Adobe credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(ADOBE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: ADOBE_CLIENT_ID,
        client_secret: ADOBE_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.json(
        { error: "Token exchange failed", details: errorText },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();

    // Save tokens to file (in production, use a secure database)
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
      updated_at: new Date().toISOString(),
    };

    // Ensure directory exists
    const dir = path.dirname(TOKENS_FILE);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch {
      // Directory may already exist
    }

    console.log("Saving tokens to:", TOKENS_FILE);
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokenData, null, 2));

    console.log("Adobe tokens saved successfully to:", TOKENS_FILE);

    // Redirect to admin page with success message
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/admin?adobe_auth=success`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
