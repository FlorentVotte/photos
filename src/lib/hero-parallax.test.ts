import { describe, expect, it } from "vitest";
import { heroParallax } from "./hero-parallax";

describe("heroParallax", () => {
  it("is at rest at scroll 0", () => {
    expect(heroParallax(0, 600)).toEqual({ imageY: 0, textY: 0, textOpacity: 1 });
  });

  it("moves the image at 0.35x and the text at 0.18x", () => {
    const p = heroParallax(100, 1000);
    expect(p.imageY).toBeCloseTo(35);
    expect(p.textY).toBeCloseTo(18);
  });

  it("fades the text out over 60% of the hero height", () => {
    expect(heroParallax(300, 1000).textOpacity).toBeCloseTo(0.5);
    expect(heroParallax(600, 1000).textOpacity).toBe(0);
    expect(heroParallax(5000, 1000).textOpacity).toBe(0);
  });

  it("ignores overscroll above the top", () => {
    expect(heroParallax(-50, 600)).toEqual({ imageY: 0, textY: 0, textOpacity: 1 });
  });
});
