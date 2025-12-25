import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Validate session token format (64-char hex string only)
 * No longer accepts legacy "authenticated" token for security
 */
export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Check if the current request is authenticated
 * Returns true if valid admin session exists
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  return isValidSessionToken(authCookie?.value);
}

/**
 * Returns 401 Unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

/**
 * Require authentication for an API route
 * Call at the start of mutation handlers (POST, PUT, PATCH, DELETE)
 * Returns null if authenticated, or a 401 response to return
 */
export async function requireAuth(): Promise<NextResponse | null> {
  if (!(await isAuthenticated())) {
    return unauthorizedResponse();
  }
  return null;
}
