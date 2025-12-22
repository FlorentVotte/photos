import { NextResponse } from "next/server";

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

// GET - Redirect to Adobe OAuth
export async function GET() {
  if (!ADOBE_CLIENT_ID) {
    return NextResponse.json(
      { error: "ADOBE_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const authUrl = new URL(ADOBE_AUTH_URL);
  authUrl.searchParams.set("client_id", ADOBE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
