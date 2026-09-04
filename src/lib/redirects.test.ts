import { describe, expect, it } from "vitest";
import { safeInternalRedirect } from "./redirects";

describe("safeInternalRedirect", () => {
  it("accepts an internal path with a query string", () => {
    expect(safeInternalRedirect("/admin/albums?tab=all")).toBe(
      "/admin/albums?tab=all"
    );
  });

  it.each(["//evil.example", "https://evil.example", "javascript:alert(1)", "admin"])(
    "falls back for unsafe redirect %s",
    (unsafe) => {
      expect(safeInternalRedirect(unsafe)).toBe("/admin");
    }
  );
});
