const SIGNATURE_LENGTH_BYTES = 32; // SHA-256 output
const SIGNATURE_LENGTH_HEX = SIGNATURE_LENGTH_BYTES * 2;
const TOKEN_LENGTH_HEX = 64; // 32 bytes as hex
const HEX_REGEX = /^[a-f0-9]+$/;

let cachedKeyPromise: Promise<CryptoKey> | null = null;

/**
 * Derive a stable session-signing key.
 *
 * Precedence:
 *   1. SESSION_SECRET env var (explicit opt-in)
 *   2. ENCRYPTION_KEY env var (already required for Adobe tokens in prod)
 *   3. ADMIN_PASSWORD env var (always required to log in)
 *
 * Rotating ADMIN_PASSWORD also invalidates existing sessions, which is
 * the expected behavior.
 *
 * Uses Web Crypto API so the same module works in the Node runtime
 * (API routes) and the Edge runtime (middleware).
 */
async function getSigningKey(): Promise<CryptoKey> {
  if (cachedKeyPromise) return cachedKeyPromise;

  const base =
    process.env.SESSION_SECRET ||
    process.env.ENCRYPTION_KEY ||
    process.env.ADMIN_PASSWORD;

  if (!base) {
    throw new Error(
      "Cannot sign session: SESSION_SECRET, ENCRYPTION_KEY, or ADMIN_PASSWORD must be set"
    );
  }

  cachedKeyPromise = (async () => {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(base),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const derivedBytes = await crypto.subtle.sign(
      "HMAC",
      baseKey,
      enc.encode("photobook-session-signing-v1")
    );
    return crypto.subtle.importKey(
      "raw",
      derivedBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  })();

  return cachedKeyPromise;
}

/** Internal: reset the cached key. Used only in tests. */
export function __resetSigningKeyForTests(): void {
  cachedKeyPromise = null;
}

function bytesToHex(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < view.length; i++) {
    out += view[i].toString(16).padStart(2, "0");
  }
  return out;
}

async function computeSignature(tokenHex: string): Promise<string> {
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(tokenHex)
  );
  return bytesToHex(sig);
}

/**
 * Timing-safe hex string comparison. Both inputs must be the same length
 * and valid hex — callers validate format before calling this.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Wrap a random hex token with an HMAC signature.
 * Output format: "<tokenHex>.<signatureHex>"
 */
export async function signSessionToken(tokenHex: string): Promise<string> {
  const signature = await computeSignature(tokenHex);
  return `${tokenHex}.${signature}`;
}

/**
 * Validate a signed session cookie value.
 * Checks both the token format and the HMAC signature.
 */
export async function verifySignedSessionToken(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;

  const dot = value.indexOf(".");
  if (dot === -1) return false;

  const tokenHex = value.slice(0, dot);
  const signatureHex = value.slice(dot + 1);

  if (tokenHex.length !== TOKEN_LENGTH_HEX) return false;
  if (signatureHex.length !== SIGNATURE_LENGTH_HEX) return false;
  if (!HEX_REGEX.test(tokenHex)) return false;
  if (!HEX_REGEX.test(signatureHex)) return false;

  try {
    const expected = await computeSignature(tokenHex);
    return timingSafeEqualHex(signatureHex, expected);
  } catch {
    return false;
  }
}
