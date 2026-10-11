import { describe, expect, it } from "vitest";
import { etagMatches } from "./http-cache";

describe("etagMatches", () => {
  const etag = '"123-456"';
  it("matches an identical validator", () => expect(etagMatches('"123-456"', etag)).toBe(true));
  it("matches a weak validator", () => expect(etagMatches('W/"123-456"', etag)).toBe(true));
  it("matches within a comma-separated list", () =>
    expect(etagMatches('"a", W/"123-456" , "b"', etag)).toBe(true));
  it("matches *", () => expect(etagMatches("*", etag)).toBe(true));
  it("rejects different or missing validators", () => {
    expect(etagMatches('"999-456"', etag)).toBe(false);
    expect(etagMatches(null, etag)).toBe(false);
    expect(etagMatches("", etag)).toBe(false);
  });
});
