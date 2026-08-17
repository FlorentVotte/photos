/**
 * Pure gesture physics, following Apple's *Designing Fluid Interfaces*.
 *
 * Kept out of the components so it can be unit tested in the node test
 * environment — the gesture wiring itself needs a DOM.
 */

/** Normal scroll feel. Use ~0.99 for a snappier, shorter throw. */
export const DECELERATION_RATE = 0.998;

/**
 * Where a flick would come to rest, given its release velocity.
 *
 * This is the exponential-decay form Apple actually ships, *not* the
 * physics-textbook `v² / 2a`. Using it means a flick animates to where the
 * gesture was going rather than snapping back from where the finger happened
 * to leave the screen.
 *
 * @param initialVelocity  Release velocity in px/s.
 * @returns Distance in px, carrying the sign of the velocity.
 */
export function project(
  initialVelocity: number,
  decelerationRate: number = DECELERATION_RATE
): number {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export type SwipeResolution = "next" | "prev" | "none";

interface ResolveProjectedSwipeInput {
  /** Horizontal drag offset in px. Negative is leftward. */
  offset: number;
  /** Release velocity in px/s. Negative is leftward. */
  velocity: number;
  /** How far the projected resting point must reach to commit. */
  commitDistance: number;
  decelerationRate?: number;
}

/**
 * Decide what a released drag should do, based on where its momentum is
 * heading rather than where it was let go.
 *
 * Because the projection is added to the offset, a hard flick back toward
 * centre correctly *cancels* a drag that had already passed the threshold —
 * the user changed their mind mid-gesture and the interface should agree.
 */
export function resolveProjectedSwipe({
  offset,
  velocity,
  commitDistance,
  decelerationRate = DECELERATION_RATE,
}: ResolveProjectedSwipeInput): SwipeResolution {
  const projected = offset + project(velocity, decelerationRate);

  if (Math.abs(projected) < commitDistance) return "none";
  return projected < 0 ? "next" : "prev";
}

/**
 * Progressive resistance past a boundary.
 *
 * A hard stop reads as "frozen"; continuous resistance reads as "responsive,
 * but there is nothing more here". The further past the bound the user pulls,
 * the less the element follows — and it never stops following entirely.
 *
 * @param overshoot  How far past the boundary the raw gesture went.
 * @param dimension  The size of the axis being resisted against.
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant: number = 0.55
): number {
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}
