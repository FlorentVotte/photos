import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Validate session token format (64-char hex string only)
 * Security: No longer accepts legacy "authenticated" token
 */
function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  return /^[a-f0-9]{64}$/.test(token);
}

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("admin_auth");

  if (isValidSessionToken(authCookie?.value)) {
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
