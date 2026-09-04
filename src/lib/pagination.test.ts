import { describe, expect, it } from "vitest";
import { nextVisibleCount, resolveAutoRotateSpeed } from "./pagination";

describe("nextVisibleCount", () => {
  it("reveals photos in batches of 25 until all are visible", () => {
    expect(nextVisibleCount(25, 73, 25)).toBe(50);
    expect(nextVisibleCount(50, 73, 25)).toBe(73);
  });

  it("clamps a final partial batch to the total", () => {
    expect(nextVisibleCount(50, 63, 25)).toBe(63);
    expect(nextVisibleCount(63, 63, 25)).toBe(63);
  });
});

describe("resolveAutoRotateSpeed", () => {
  it("stops auto-rotation when reduced motion is preferred", () => {
    expect(resolveAutoRotateSpeed(false, true)).toBe(0);
    expect(resolveAutoRotateSpeed(true, true)).toBe(0);
  });

  it("rotates only while idle when motion is allowed", () => {
    expect(resolveAutoRotateSpeed(false, false)).toBe(0.3);
    expect(resolveAutoRotateSpeed(true, false)).toBe(0);
  });
});
