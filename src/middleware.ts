import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedSessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for a valid, signed auth cookie
  const authCookie = request.cookies.get("admin_auth");

  if (await verifySignedSessionToken(authCookie?.value)) {
    return NextResponse.next();
  }

  // Redirect to login page
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
