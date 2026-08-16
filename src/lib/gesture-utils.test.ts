import { describe, it, expect } from "vitest";
import {
  computeRecentVelocity,
  resolveSwipe,
  type SwipeSample,
} from "./gesture-utils";

describe("computeRecentVelocity", () => {
  it("returns 0 with fewer than two samples", () => {
    expect(computeRecentVelocity([])).toBe(0);
    expect(computeRecentVelocity([{ x: 10, t: 0 }])).toBe(0);
  });

  it("computes px/ms across the sample window", () => {
    const samples: SwipeSample[] = [
      { x: 0, t: 0 },
      { x: 50, t: 100 },
    ];
    expect(computeRecentVelocity(samples)).toBeCloseTo(0.5);
  });

  it("keeps the sign of the movement direction", () => {
    const samples: SwipeSample[] = [
      { x: 0, t: 0 },
      { x: -30, t: 100 },
    ];
    expect(computeRecentVelocity(samples)).toBeCloseTo(-0.3);
  });

  it("only measures the recent window, so a drag-hold-flick still reads fast", () => {
    // Finger travels slowly, pauses a long time, then flicks at the very end.
    // Whole-gesture velocity would be ~0.06 px/ms; the recent window is ~0.4.
    const samples: SwipeSample[] = [
      { x: 0, t: 0 },
      { x: 20, t: 500 },
      { x: 20, t: 1400 }, // held still
      { x: 60, t: 1500 }, // flick
    ];
    const wholeGesture = 60 / 1500;
    expect(wholeGesture).toBeLessThan(0.11);
    expect(computeRecentVelocity(samples, 100)).toBeCloseTo(0.4);
  });

  it("returns 0 when the recent window has no elapsed time", () => {
    const samples: SwipeSample[] = [
      { x: 0, t: 200 },
      { x: 40, t: 200 },
    ];
    expect(computeRecentVelocity(samples, 100)).toBe(0);
  });

  it("ignores samples older than the window", () => {
    const samples: SwipeSample[] = [
      { x: 1000, t: 0 }, // ancient outlier, must not skew the result
      { x: 0, t: 900 },
      { x: 10, t: 1000 },
    ];
    expect(computeRecentVelocity(samples, 100)).toBeCloseTo(0.1);
  });
});

describe("resolveSwipe", () => {
  const opts = { minDistance: 50, minVelocity: 0.11 };

  it("commits to next when dragged far enough to the left", () => {
    expect(resolveSwipe({ distance: -80, velocity: 0, ...opts })).toBe("next");
  });

  it("commits to prev when dragged far enough to the right", () => {
    expect(resolveSwipe({ distance: 80, velocity: 0, ...opts })).toBe("prev");
  });

  it("does nothing for a short, slow drag", () => {
    expect(resolveSwipe({ distance: -20, velocity: 0.02, ...opts })).toBe("none");
  });

  it("commits on a fast flick that never reached the distance threshold", () => {
    expect(resolveSwipe({ distance: -18, velocity: -0.4, ...opts })).toBe("next");
  });

  it("lets velocity direction win over a small opposite offset", () => {
    // User overshot right, then flicked left: intent is 'next'.
    expect(resolveSwipe({ distance: 12, velocity: -0.5, ...opts })).toBe("next");
  });

  it("falls back to distance when the flick is below the velocity threshold", () => {
    expect(resolveSwipe({ distance: -70, velocity: -0.01, ...opts })).toBe("next");
  });

  it("treats the thresholds as inclusive", () => {
    expect(resolveSwipe({ distance: -50, velocity: 0, ...opts })).toBe("next");
    expect(resolveSwipe({ distance: 0, velocity: -0.11, ...opts })).toBe("next");
  });
});
