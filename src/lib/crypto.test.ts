import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { encrypt, decrypt, isEncrypted, getAccessToken } from "./crypto";

describe("crypto", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("encrypt", () => {
    it.each([undefined, "short"])(
      "rejects invalid production ENCRYPTION_KEY %s",
      async (key) => {
        process.env = { ...process.env, NODE_ENV: "production" };
        if (key === undefined) delete process.env.ENCRYPTION_KEY;
        else process.env.ENCRYPTION_KEY = key;
        const { encrypt: productionEncrypt } = await import("./crypto");
        expect(() => productionEncrypt("token")).toThrow(
          "ENCRYPTION_KEY must be at least 32 characters in production"
        );
      }
    );

    it("rejects a 32-character production key that is not 32 UTF-8 bytes", async () => {
      process.env = {
        ...process.env,
        NODE_ENV: "production",
        ENCRYPTION_KEY: "é".repeat(32),
      };
      const { encrypt: productionEncrypt } = await import("./crypto");

      expect(() => productionEncrypt("token")).toThrow(
        "ENCRYPTION_KEY must encode to exactly 32 bytes when provided as a 32-character key"
      );
    });

    it("should return encrypted string in iv:tag:ciphertext format", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const result = encrypt("test-plaintext");

      const parts = result.split(":");
      expect(parts).toHaveLength(3);

      const [iv, tag, ciphertext] = parts;
      // IV should be 16 bytes = 32 hex chars
      expect(iv).toHaveLength(32);
      // Tag should be 16 bytes = 32 hex chars
      expect(tag).toHaveLength(32);
      // All parts should be valid hex
      expect(/^[a-f0-9]+$/i.test(iv)).toBe(true);
      expect(/^[a-f0-9]+$/i.test(tag)).toBe(true);
      expect(/^[a-f0-9]+$/i.test(ciphertext)).toBe(true);
    });

    it("should produce different ciphertext for same plaintext (random IV)", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "same-input";
      const result1 = encrypt(plaintext);
      const result2 = encrypt(plaintext);

      // Should be different due to random IV
      expect(result1).not.toBe(result2);
    });

    it("should handle empty string", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const result = encrypt("");
      expect(result.split(":")).toHaveLength(3);
    });

    it("should handle unicode characters", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "Hello \u4e16\u754c \ud83c\udf0d";
      const result = encrypt(plaintext);
      expect(result.split(":")).toHaveLength(3);
    });

    it("should handle long strings", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "a".repeat(10000);
      const result = encrypt(plaintext);
      expect(result.split(":")).toHaveLength(3);
    });
  });

  describe("decrypt", () => {
    it("should decrypt to original plaintext", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "secret-message";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt empty string correctly", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt unicode characters correctly", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "Hello \u4e16\u754c \ud83c\udf0d";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt long strings correctly", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "a".repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should throw on invalid format (missing parts)", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      expect(() => decrypt("invalid")).toThrow("Invalid encrypted format");
      expect(() => decrypt("part1:part2")).toThrow("Invalid encrypted format");
    });

    it("should throw on tampered ciphertext", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const encrypted = encrypt("test");
      const parts = encrypted.split(":");
      // Tamper with the ciphertext
      parts[2] = "0".repeat(parts[2].length);
      const tampered = parts.join(":");

      expect(() => decrypt(tampered)).toThrow();
    });

    it("should throw on tampered authentication tag", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const encrypted = encrypt("test");
      const parts = encrypted.split(":");
      // Tamper with the tag
      parts[1] = "0".repeat(32);
      const tampered = parts.join(":");

      expect(() => decrypt(tampered)).toThrow();
    });

    it("should throw on tampered IV", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const encrypted = encrypt("test");
      const parts = encrypted.split(":");
      // Tamper with the IV
      parts[0] = "0".repeat(32);
      const tampered = parts.join(":");

      expect(() => decrypt(tampered)).toThrow();
    });
  });

  describe("encrypt/decrypt roundtrip", () => {
    it("should successfully roundtrip various inputs", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";

      const testCases = [
        "simple text",
        "",
        "special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?",
        "newlines\nand\ttabs",
        "unicode: \u00e9\u00e8\u00ea\u00eb",
        JSON.stringify({ key: "value", nested: { array: [1, 2, 3] } }),
        "x".repeat(100000),
      ];

      for (const input of testCases) {
        const encrypted = encrypt(input);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(input);
      }
    });
  });

  describe("isEncrypted", () => {
    it("should return true for valid encrypted format", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const encrypted = encrypt("test");
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it("should return false for plain text", () => {
      expect(isEncrypted("plain text")).toBe(false);
    });

    it("should return false for incomplete format", () => {
      expect(isEncrypted("part1:part2")).toBe(false);
    });

    it("should return false for wrong IV length", () => {
      // IV should be 32 hex chars, tag 32 hex chars
      expect(isEncrypted("abc:12345678901234567890123456789012:ciphertext")).toBe(false);
    });

    it("should return false for wrong tag length", () => {
      expect(isEncrypted("12345678901234567890123456789012:abc:ciphertext")).toBe(false);
    });

    it("should return false for non-hex characters", () => {
      expect(isEncrypted("1234567890123456789012345678901g:12345678901234567890123456789012:aabb")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isEncrypted("")).toBe(false);
    });
  });

  describe("key derivation", () => {
    it("should work with 64-char hex key", async () => {
      // 32 bytes = 64 hex chars
      process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

      const plaintext = "test";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should work with 32-char key", async () => {
      process.env.ENCRYPTION_KEY = "12345678901234567890123456789012";

      const plaintext = "test";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should derive key from short string", async () => {
      process.env.ENCRYPTION_KEY = "short";

      const plaintext = "test";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should produce different ciphertext with different keys", () => {
      const plaintext = "same-input";

      process.env.ENCRYPTION_KEY = "key-one-for-testing-purposes-xx";
      const encrypted1 = encrypt(plaintext);

      process.env.ENCRYPTION_KEY = "key-two-for-testing-purposes-xx";
      const encrypted2 = encrypt(plaintext);

      // IVs are random so these are always different, but even the ciphertext portion would differ
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe("getAccessToken", () => {
    it("should decrypt an encrypted token", () => {
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const plaintext = "eyJhbGciOiJSUzI1NiJ9.adobe-access-token";
      const stored = encrypt(plaintext);

      expect(getAccessToken(stored)).toBe(plaintext);
    });

    it("should pass through a plain token unchanged (pre-encryption rows)", () => {
      const plaintext = "eyJhbGciOiJSUzI1NiJ9.legacy-plain-token";
      expect(getAccessToken(plaintext)).toBe(plaintext);
    });

    it("should never return something in the stored iv:tag:ciphertext form", () => {
      // Regression guard: sync/index.ts used to send the raw stored value as a
      // Bearer token, so every Adobe rendition request 401'd and every photo
      // was skipped — the album synced to 0 photos with no visible error.
      process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing";
      const stored = encrypt("adobe-access-token");

      expect(isEncrypted(stored)).toBe(true);
      expect(isEncrypted(getAccessToken(stored))).toBe(false);
    });
  });
});
