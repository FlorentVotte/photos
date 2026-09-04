import { AUTH } from "./constants";

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

async function computeSignature(payload: string): Promise<string> {
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
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
 * Wrap a random hex token and expiry with an HMAC signature.
 * Output format: "v1.<tokenHex>.<expiryUnixSeconds>.<signatureHex>"
 */
export async function signSessionToken(
  tokenHex: string,
  expirySeconds = AUTH.SESSION_EXPIRY_SECONDS
): Promise<string> {
  if (tokenHex.length !== TOKEN_LENGTH_HEX || !HEX_REGEX.test(tokenHex)) {
    throw new Error("Session token must be 64 lowercase hexadecimal characters");
  }
  if (!Number.isInteger(expirySeconds) || expirySeconds <= 0) {
    throw new Error("Session expiry must be a positive integer");
  }

  const expiryUnixSeconds = Math.floor(Date.now() / 1000) + expirySeconds;
  const payload = `v1.${tokenHex}.${expiryUnixSeconds}`;
  const signature = await computeSignature(payload);
  return `${payload}.${signature}`;
}

/**
 * Validate a signed session cookie value.
 * Checks both the token format and the HMAC signature.
 */
export async function verifySignedSessionToken(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 4) return false;

  const [version, tokenHex, expiryText, signatureHex] = parts;

  if (version !== "v1") return false;
  if (tokenHex.length !== TOKEN_LENGTH_HEX) return false;
  if (signatureHex.length !== SIGNATURE_LENGTH_HEX) return false;
  if (!HEX_REGEX.test(tokenHex)) return false;
  if (!HEX_REGEX.test(signatureHex)) return false;
  if (!/^\d+$/.test(expiryText)) return false;

  const expiryUnixSeconds = Number(expiryText);
  if (
    !Number.isSafeInteger(expiryUnixSeconds) ||
    expiryUnixSeconds <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  try {
    const expected = await computeSignature(`v1.${tokenHex}.${expiryText}`);
    return timingSafeEqualHex(signatureHex, expected);
  } catch {
    return false;
  }
}
