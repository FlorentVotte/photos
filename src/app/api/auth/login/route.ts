import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { secureCompare, generateSecureToken, RateLimiter } from "@/lib/security";
import { signSessionToken } from "@/lib/session";
import { RATE_LIMITS, AUTH } from "@/lib/constants";

function createLoginRateLimiter(): RateLimiter {
  return new RateLimiter(
    RATE_LIMITS.LOGIN_WINDOW_MS,
    RATE_LIMITS.LOGIN_MAX_ATTEMPTS
  );
}

function createGlobalLoginRateLimiter(): RateLimiter {
  return new RateLimiter(
    RATE_LIMITS.LOGIN_WINDOW_MS,
    RATE_LIMITS.LOGIN_GLOBAL_MAX_ATTEMPTS
  );
}

let loginRateLimiter = createLoginRateLimiter();
let globalLoginRateLimiter = createGlobalLoginRateLimiter();

/** Internal reset hook so route tests do not share module state. */
export function __resetLoginRateLimitersForTests(): void {
  loginRateLimiter = createLoginRateLimiter();
  globalLoginRateLimiter = createGlobalLoginRateLimiter();
}

function firstNonEmptyAddress(value: string | null): string | undefined {
  return value
    ?.split(",")
    .map((part) => part.trim())
    .find((part) => part.length > 0);
}

function clientKey(request: NextRequest): string {
  const address =
    firstNonEmptyAddress(request.headers.get("x-forwarded-for")) ??
    firstNonEmptyAddress(request.headers.get("x-real-ip")) ??
    "unknown";
  return address.slice(0, 200);
}

export async function POST(request: NextRequest) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  // Fail if password not configured
  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Get a bounded, normalized proxy address for per-client rate limiting.
  const ip = clientKey(request);

  // Check rate limit
  if (
    loginRateLimiter.isLimited(ip) ||
    globalLoginRateLimiter.isLimited(RATE_LIMITS.LOGIN_GLOBAL_KEY)
  ) {
    return NextResponse.json(
      { error: "Too many failed attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (secureCompare(password, ADMIN_PASSWORD)) {
      // Generate a random token and sign it so the server can later verify
      // this cookie was issued by us (prevents forged cookies from passing
      // the format-only check in middleware).
      loginRateLimiter.clearAttempts(ip);
      const signedToken = await signSessionToken(
        generateSecureToken(),
        AUTH.SESSION_EXPIRY_SECONDS
      );

      // Set auth cookie (expires in 2 hours for security)
      const cookieStore = await cookies();
      cookieStore.set("admin_auth", signedToken, {
        httpOnly: true,
        secure: true, // Always secure
        // "lax" is required, not a weakening: the Adobe OAuth callback is
        // reached by a cross-site top-level redirect from adobelogin.com,
        // and browsers never send SameSite=Strict cookies on those. With
        // "strict" the callback's requireAuth() failed on every connect.
        // Lax still withholds the cookie on cross-site POST, which is what
        // the CSRF protection actually relies on — every mutating route
        // here is POST/PUT/DELETE.
        sameSite: "lax",
        maxAge: AUTH.SESSION_EXPIRY_SECONDS,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    loginRateLimiter.recordAttempt(ip);
    globalLoginRateLimiter.recordAttempt(RATE_LIMITS.LOGIN_GLOBAL_KEY);
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
