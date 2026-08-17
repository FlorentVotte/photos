import { describe, it, expect } from "vitest";
import { project, resolveProjectedSwipe, rubberband } from "./gesture-utils";

describe("project", () => {
  it("returns 0 for no velocity", () => {
    expect(project(0)).toBe(0);
  });

  it("projects further the faster the flick", () => {
    const slow = project(300);
    const fast = project(1200);
    expect(fast).toBeGreaterThan(slow);
    expect(slow).toBeGreaterThan(0);
  });

  it("keeps the sign of the velocity", () => {
    expect(project(-800)).toBeLessThan(0);
    expect(project(800)).toBeGreaterThan(0);
  });

  it("matches Apple's exponential-decay formula, not v^2/2a", () => {
    // (v / 1000) * d / (1 - d) with d = 0.998 → v * 0.499
    expect(project(1000, 0.998)).toBeCloseTo(499, 0);
    expect(project(500, 0.998)).toBeCloseTo(249.5, 0);
  });

  it("projects a shorter distance with a snappier deceleration rate", () => {
    expect(project(1000, 0.99)).toBeLessThan(project(1000, 0.998));
  });
});

describe("resolveProjectedSwipe", () => {
  const base = { commitDistance: 120 };

  it("does nothing for a small, slow drag", () => {
    expect(resolveProjectedSwipe({ offset: -20, velocity: 0, ...base })).toBe("none");
  });

  it("commits when the drag alone clears the threshold", () => {
    expect(resolveProjectedSwipe({ offset: -140, velocity: 0, ...base })).toBe("next");
    expect(resolveProjectedSwipe({ offset: 140, velocity: 0, ...base })).toBe("prev");
  });

  it("commits a short flick because momentum carries it past the threshold", () => {
    // 30px dragged, but thrown at 800px/s → projects ~430px total.
    expect(resolveProjectedSwipe({ offset: -30, velocity: -800, ...base })).toBe("next");
  });

  it("does not commit a short drag released at rest", () => {
    expect(resolveProjectedSwipe({ offset: -30, velocity: 0, ...base })).toBe("none");
  });

  it("lets a reversing flick beat the raw offset", () => {
    // Dragged right, but flicked hard left at release — intent is 'next'.
    expect(resolveProjectedSwipe({ offset: 40, velocity: -900, ...base })).toBe("next");
  });

  it("cancels when a moderate flick opposes a drag that would otherwise commit", () => {
    // Dragged past the threshold, then eased back toward centre: the
    // projection lands inside the dead zone, so nothing happens.
    expect(resolveProjectedSwipe({ offset: -130, velocity: 300, ...base })).toBe("none");
  });

  it("reverses when the opposing flick is hard enough to carry past centre", () => {
    // Same drag, thrown back three times as fast. Velocity sign wins over
    // position — the user changed their mind and threw it the other way.
    expect(resolveProjectedSwipe({ offset: -130, velocity: 900, ...base })).toBe("prev");
  });
});

describe("rubberband", () => {
  it("returns 0 with no overshoot", () => {
    expect(rubberband(0, 400)).toBe(0);
  });

  it("resists — always travels less than the raw overshoot", () => {
    expect(rubberband(100, 400)).toBeLessThan(100);
    expect(rubberband(300, 400)).toBeLessThan(300);
  });

  it("resists progressively: each extra pixel of pull yields less movement", () => {
    const first = rubberband(50, 400) - rubberband(0, 400);
    const later = rubberband(300, 400) - rubberband(250, 400);
    expect(later).toBeLessThan(first);
  });

  it("is symmetric about zero", () => {
    expect(rubberband(-120, 400)).toBeCloseTo(-rubberband(120, 400));
  });

  it("never hard-stops — keeps yielding movement even far past the bound", () => {
    expect(rubberband(5000, 400)).toBeGreaterThan(rubberband(2000, 400));
  });
});
