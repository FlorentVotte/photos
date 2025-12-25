import crypto from "crypto";

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Compares two strings in constant time regardless of their length or content.
 */
export function secureCompare(a: string, b: string): boolean {
  if (!a || !b) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  // Pad both buffers to the same length to prevent length-based timing attacks
  const maxLen = Math.max(bufA.length, bufB.length);
  const paddedA = Buffer.alloc(maxLen);
  const paddedB = Buffer.alloc(maxLen);
  bufA.copy(paddedA);
  bufB.copy(paddedB);

  // Perform timing-safe comparison
  const contentEqual = crypto.timingSafeEqual(paddedA, paddedB);

  // Only return true if lengths were equal AND content matches
  return bufA.length === bufB.length && contentEqual;
}

/**
 * Generate a cryptographically secure random token.
 * @param bytes - Number of random bytes (default: 32, produces 64 hex chars)
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Rate limiter for tracking attempts with automatic cleanup.
 */
export class RateLimiter {
  private attempts = new Map<string, { count: number; lastAttempt: number }>();
  private readonly windowMs: number;
  private readonly maxAttempts: number;

  constructor(windowMs: number, maxAttempts: number) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) return false;

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.delete(key);
      return false;
    }

    return record.count >= this.maxAttempts;
  }

  recordAttempt(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now - record.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
    } else {
      record.count++;
      record.lastAttempt = now;
    }
  }

  clearAttempts(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Simple rate limiter that only tracks last attempt time (for sync endpoint).
 */
export class SimpleRateLimiter {
  private attempts = new Map<string, number>();
  private readonly windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const lastAttempt = this.attempts.get(key);

    if (!lastAttempt) return false;
    if (now - lastAttempt > this.windowMs) {
      this.attempts.delete(key);
      return false;
    }

    return true;
  }

  recordAttempt(key: string): void {
    this.attempts.set(key, Date.now());
  }
}
