import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeInternalRedirect } from "@/lib/redirects";
import { verifySignedSessionToken } from "@/lib/session";

export function buildContentSecurityPolicy(
  nonce: string,
  isDevelopment: boolean
): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDevelopment ? " 'unsafe-eval'" : ""
    }`,
    "style-src 'self'",
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data: https://tiles.openfreemap.org",
    "connect-src 'self' https://tiles.openfreemap.org wss://tiles.openfreemap.org",
    "font-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "development"
  );

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const authCookie = request.cookies.get("admin_auth");

    if (!(await verifySignedSessionToken(authCookie?.value))) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "redirect",
        safeInternalRedirect(request.nextUrl.pathname)
      );
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("Content-Security-Policy", contentSecurityPolicy);
      return response;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|photos|globe).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
