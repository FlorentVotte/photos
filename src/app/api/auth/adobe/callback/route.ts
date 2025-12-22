import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const ADOBE_CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const ADOBE_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/adobe/callback`
  : "http://localhost:3000/api/auth/adobe/callback";

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

    // Save tokens to database
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.adobeToken.upsert({
      where: { id: "default" },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
      create: {
        id: "default",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
    });

    console.log("Adobe tokens saved successfully to database");

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
