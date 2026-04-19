import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySignedSessionToken } from "./session";

/**
 * Validate a signed session cookie value.
 * Re-exported so other modules have a single entry point.
 */
export function isValidSessionToken(
  value: string | undefined
): Promise<boolean> {
  return verifySignedSessionToken(value);
}

/**
 * Check if the current request is authenticated.
 * Returns true if a valid, signed admin session cookie is present.
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  return verifySignedSessionToken(authCookie?.value);
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
