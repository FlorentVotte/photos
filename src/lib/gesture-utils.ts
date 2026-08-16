/**
 * Pure decision logic for touch gestures.
 *
 * Kept out of the hooks so it can be unit tested in the node test
 * environment — the hooks themselves need a DOM.
 */

/** A single position sample taken during a drag. */
export interface SwipeSample {
  /** Horizontal position in px. */
  x: number;
  /** Timestamp in ms. */
  t: number;
}

/** Default window used to measure release velocity. */
export const VELOCITY_WINDOW_MS = 100;

/**
 * Velocity in px/ms over the most recent `windowMs` of a drag.
 *
 * Deliberately *not* measured across the whole gesture: a drag-hold-flick
 * has a near-zero whole-gesture velocity and would never register as a
 * flick, even though the user clearly threw it at the end.
 *
 * Positive is rightward.
 */
export function computeRecentVelocity(
  samples: SwipeSample[],
  windowMs: number = VELOCITY_WINDOW_MS
): number {
  if (samples.length < 2) return 0;

  const last = samples[samples.length - 1];

  // Walk back to the oldest sample still inside the window. Starting from
  // the end means samples older than the window can never skew the result.
  let oldest = last;
  for (let i = samples.length - 2; i >= 0; i--) {
    if (last.t - samples[i].t > windowMs) break;
    oldest = samples[i];
  }

  const elapsed = last.t - oldest.t;
  if (elapsed <= 0) return 0;

  return (last.x - oldest.x) / elapsed;
}

export type SwipeResolution = "next" | "prev" | "none";

interface ResolveSwipeInput {
  /** Total horizontal offset in px. Negative is leftward. */
  distance: number;
  /** Release velocity in px/ms. Negative is leftward. */
  velocity: number;
  /** Minimum offset that commits a slow drag. */
  minDistance: number;
  /** Minimum speed that commits a short flick. */
  minVelocity: number;
}

/**
 * Decide what a released drag should do.
 *
 * A flick wins over the raw offset, so overshooting one way and flicking
 * back resolves to the direction the finger was actually moving at release.
 */
export function resolveSwipe({
  distance,
  velocity,
  minDistance,
  minVelocity,
}: ResolveSwipeInput): SwipeResolution {
  if (Math.abs(velocity) >= minVelocity) {
    return velocity < 0 ? "next" : "prev";
  }

  if (Math.abs(distance) >= minDistance) {
    return distance < 0 ? "next" : "prev";
  }

  return "none";
}
