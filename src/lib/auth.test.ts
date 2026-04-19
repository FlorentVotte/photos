import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { isValidSessionToken, unauthorizedResponse } from "./auth";
import {
  signSessionToken,
  verifySignedSessionToken,
  __resetSigningKeyForTests,
} from "./session";

describe("auth", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-session-secret-do-not-use-in-prod";
    __resetSigningKeyForTests();
  });

  describe("isValidSessionToken", () => {
    it("should accept a freshly signed token", async () => {
      const raw = crypto.randomBytes(32).toString("hex");
      const signed = await signSessionToken(raw);
      expect(await isValidSessionToken(signed)).toBe(true);
    });

    it("should reject undefined", async () => {
      expect(await isValidSessionToken(undefined)).toBe(false);
    });

    it("should reject empty string", async () => {
      expect(await isValidSessionToken("")).toBe(false);
    });

    it("should reject a raw 64-char hex token without signature", async () => {
      // This is the pre-fix format — it must no longer authenticate.
      expect(await isValidSessionToken("a".repeat(64))).toBe(false);
    });

    it("should reject a forged cookie with an arbitrary signature", async () => {
      const forged = `${"a".repeat(64)}.${"b".repeat(64)}`;
      expect(await isValidSessionToken(forged)).toBe(false);
    });

    it("should reject a token with tampered payload", async () => {
      const raw = crypto.randomBytes(32).toString("hex");
      const signed = await signSessionToken(raw);
      // Flip the first character of the token portion.
      const tampered =
        (signed[0] === "a" ? "b" : "a") + signed.slice(1);
      expect(await isValidSessionToken(tampered)).toBe(false);
    });

    it("should reject a token signed with a different secret", async () => {
      const raw = crypto.randomBytes(32).toString("hex");
      const signed = await signSessionToken(raw);

      process.env.SESSION_SECRET = "rotated-secret";
      __resetSigningKeyForTests();

      expect(await verifySignedSessionToken(signed)).toBe(false);
    });

    it("should reject missing separator", async () => {
      expect(await isValidSessionToken("a".repeat(128))).toBe(false);
    });

    it("should reject non-hex characters in token", async () => {
      const signed = `${"g".repeat(64)}.${"a".repeat(64)}`;
      expect(await isValidSessionToken(signed)).toBe(false);
    });

    it("should reject uppercase hex (case sensitive)", async () => {
      const raw = crypto.randomBytes(32).toString("hex");
      const signed = await signSessionToken(raw);
      expect(await isValidSessionToken(signed.toUpperCase())).toBe(false);
    });

    it("should reject the legacy 'authenticated' token", async () => {
      expect(await isValidSessionToken("authenticated")).toBe(false);
    });
  });

  describe("unauthorizedResponse", () => {
    it("should return 401 status", () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
    });

    it("should return JSON body with error message", async () => {
      const response = unauthorizedResponse();
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should have application/json content type", () => {
      const response = unauthorizedResponse();
      expect(response.headers.get("content-type")).toContain("application/json");
    });
  });
});
