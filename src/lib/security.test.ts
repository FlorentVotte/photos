import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { secureCompare, generateSecureToken, RateLimiter, SimpleRateLimiter } from "./security";

describe("security", () => {
  describe("secureCompare", () => {
    it("should return true for equal strings", () => {
      expect(secureCompare("password123", "password123")).toBe(true);
    });

    it("should return false for different strings", () => {
      expect(secureCompare("password123", "password124")).toBe(false);
    });

    it("should return false for different length strings", () => {
      expect(secureCompare("short", "longer-string")).toBe(false);
    });

    it("should return false for empty first string", () => {
      expect(secureCompare("", "non-empty")).toBe(false);
    });

    it("should return false for empty second string", () => {
      expect(secureCompare("non-empty", "")).toBe(false);
    });

    it("should return false for both empty strings", () => {
      // Empty strings are falsy, so this returns false
      expect(secureCompare("", "")).toBe(false);
    });

    it("should return false for undefined first argument", () => {
      expect(secureCompare(undefined as unknown as string, "test")).toBe(false);
    });

    it("should return false for undefined second argument", () => {
      expect(secureCompare("test", undefined as unknown as string)).toBe(false);
    });

    it("should return false for null arguments", () => {
      expect(secureCompare(null as unknown as string, "test")).toBe(false);
      expect(secureCompare("test", null as unknown as string)).toBe(false);
    });

    it("should handle unicode strings correctly", () => {
      expect(secureCompare("\u00e9\u00e8\u00ea", "\u00e9\u00e8\u00ea")).toBe(true);
      expect(secureCompare("\u00e9\u00e8\u00ea", "\u00e9\u00e8\u00eb")).toBe(false);
    });

    it("should handle special characters", () => {
      const special = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      expect(secureCompare(special, special)).toBe(true);
    });

    it("should handle long strings", () => {
      const longStr = "a".repeat(10000);
      expect(secureCompare(longStr, longStr)).toBe(true);
      expect(secureCompare(longStr, longStr + "b")).toBe(false);
    });
  });

  describe("generateSecureToken", () => {
    it("should generate 64-char hex string by default (32 bytes)", () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it("should generate specified number of bytes", () => {
      const token16 = generateSecureToken(16);
      expect(token16).toHaveLength(32); // 16 bytes = 32 hex chars

      const token64 = generateSecureToken(64);
      expect(token64).toHaveLength(128); // 64 bytes = 128 hex chars
    });

    it("should generate unique tokens", () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSecureToken());
      }
      expect(tokens.size).toBe(100);
    });

    it("should handle zero bytes", () => {
      const token = generateSecureToken(0);
      expect(token).toBe("");
    });
  });

  describe("RateLimiter", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should not limit first attempt", () => {
      const limiter = new RateLimiter(60000, 5);
      expect(limiter.isLimited("user1")).toBe(false);
    });

    it("should not limit until max attempts reached", () => {
      const limiter = new RateLimiter(60000, 3);

      limiter.recordAttempt("user1");
      expect(limiter.isLimited("user1")).toBe(false);

      limiter.recordAttempt("user1");
      expect(limiter.isLimited("user1")).toBe(false);

      limiter.recordAttempt("user1");
      expect(limiter.isLimited("user1")).toBe(true);
    });

    it("should limit after max attempts reached", () => {
      const limiter = new RateLimiter(60000, 2);

      limiter.recordAttempt("user1");
      limiter.recordAttempt("user1");

      expect(limiter.isLimited("user1")).toBe(true);
    });

    it("should reset after window expires", () => {
      const limiter = new RateLimiter(60000, 2);

      limiter.recordAttempt("user1");
      limiter.recordAttempt("user1");
      expect(limiter.isLimited("user1")).toBe(true);

      // Advance time past the window
      vi.advanceTimersByTime(60001);

      expect(limiter.isLimited("user1")).toBe(false);
    });

    it("should track different keys independently", () => {
      const limiter = new RateLimiter(60000, 2);

      limiter.recordAttempt("user1");
      limiter.recordAttempt("user1");

      expect(limiter.isLimited("user1")).toBe(true);
      expect(limiter.isLimited("user2")).toBe(false);
    });

    it("should clear attempts for a key", () => {
      const limiter = new RateLimiter(60000, 2);

      limiter.recordAttempt("user1");
      limiter.recordAttempt("user1");
      expect(limiter.isLimited("user1")).toBe(true);

      limiter.clearAttempts("user1");
      expect(limiter.isLimited("user1")).toBe(false);
    });

    it("should reset count when window passes during recording", () => {
      const limiter = new RateLimiter(60000, 3);

      limiter.recordAttempt("user1");
      limiter.recordAttempt("user1");

      // Advance past window
      vi.advanceTimersByTime(60001);

      // This should reset the count
      limiter.recordAttempt("user1");

      // Should not be limited (only 1 attempt in new window)
      expect(limiter.isLimited("user1")).toBe(false);
    });

    it("should extend window on each attempt within window", () => {
      const limiter = new RateLimiter(60000, 5);

      limiter.recordAttempt("user1"); // t=0
      vi.advanceTimersByTime(30000); // t=30s

      limiter.recordAttempt("user1"); // t=30s, window extends
      vi.advanceTimersByTime(30000); // t=60s

      limiter.recordAttempt("user1"); // t=60s, still in window (last attempt was at t=30s)
      vi.advanceTimersByTime(30000); // t=90s

      // At t=90s, last attempt was at t=60s, so window hasn't expired (60s + 60000ms = 120s)
      expect(limiter.isLimited("user1")).toBe(false);

      limiter.recordAttempt("user1");
      limiter.recordAttempt("user1");

      // Now we have 5 attempts
      expect(limiter.isLimited("user1")).toBe(true);
    });
  });

  describe("SimpleRateLimiter", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should not limit first attempt", () => {
      const limiter = new SimpleRateLimiter(60000);
      expect(limiter.isLimited("key1")).toBe(false);
    });

    it("should limit immediately after first attempt", () => {
      const limiter = new SimpleRateLimiter(60000);

      limiter.recordAttempt("key1");
      expect(limiter.isLimited("key1")).toBe(true);
    });

    it("should allow attempt after window expires", () => {
      const limiter = new SimpleRateLimiter(60000);

      limiter.recordAttempt("key1");
      expect(limiter.isLimited("key1")).toBe(true);

      vi.advanceTimersByTime(60001);
      expect(limiter.isLimited("key1")).toBe(false);
    });

    it("should track different keys independently", () => {
      const limiter = new SimpleRateLimiter(60000);

      limiter.recordAttempt("key1");

      expect(limiter.isLimited("key1")).toBe(true);
      expect(limiter.isLimited("key2")).toBe(false);
    });

    it("should reset timer on new attempt after window", () => {
      const limiter = new SimpleRateLimiter(60000);

      limiter.recordAttempt("key1");
      vi.advanceTimersByTime(60001);

      // Window expired, new attempt
      limiter.recordAttempt("key1");
      expect(limiter.isLimited("key1")).toBe(true);

      // Need to wait another full window
      vi.advanceTimersByTime(30000);
      expect(limiter.isLimited("key1")).toBe(true);

      vi.advanceTimersByTime(30001);
      expect(limiter.isLimited("key1")).toBe(false);
    });
  });
});
