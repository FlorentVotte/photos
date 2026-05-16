import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateSecureToken } from "@/lib/security";

// Adobe OAuth configuration
const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const ADOBE_AUTH_URL = "https://ims-na1.adobelogin.com/ims/authorize/v2";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/adobe/callback`
  : "http://localhost:3000/api/auth/adobe/callback";

// Scopes needed for Lightroom API
const SCOPES = [
  "openid",
  "lr_partner_apis",
  "lr_partner_rendition_apis",
].join(",");

export const ADOBE_OAUTH_STATE_COOKIE = "adobe_oauth_state";
const STATE_MAX_AGE_SECONDS = 600;

// GET - Redirect to Adobe OAuth
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  if (!ADOBE_CLIENT_ID) {
    return NextResponse.json(
      { error: "ADOBE_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const state = generateSecureToken(32);

  const authUrl = new URL(ADOBE_AUTH_URL);
  authUrl.searchParams.set("client_id", ADOBE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  const cookieStore = await cookies();
  cookieStore.set(ADOBE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  });

  return NextResponse.redirect(authUrl.toString());
}
