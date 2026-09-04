import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  __resetSigningKeyForTests,
  signSessionToken,
  verifySignedSessionToken,
} from "./session";

describe("session tokens", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-04T12:00:00.000Z"));
    process.env = {
      ...originalEnv,
      SESSION_SECRET: "test-session-secret-do-not-use-in-prod",
    };
    __resetSigningKeyForTests();
  });

  afterEach(() => {
    process.env = originalEnv;
    __resetSigningKeyForTests();
    vi.useRealTimers();
  });

  it("signs and verifies a token with a two-hour expiry", async () => {
    const signed = await signSessionToken("a".repeat(64), 2 * 60 * 60);

    expect(signed).toMatch(
      /^v1\.[a-f0-9]{64}\.\d{10}\.[a-f0-9]{64}$/
    );
    expect(await verifySignedSessionToken(signed)).toBe(true);

    vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1000);
    expect(await verifySignedSessionToken(signed)).toBe(false);
  });

  it("rejects the old token.signature cookie format", async () => {
    expect(
      await verifySignedSessionToken(`${"a".repeat(64)}.${"b".repeat(64)}`)
    ).toBe(false);
  });
});
