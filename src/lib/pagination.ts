/** Return the next visible item count without exceeding the collection size. */
export function nextVisibleCount(
  current: number,
  total: number,
  batchSize: number
): number {
  return Math.min(current + batchSize, total);
}

/** Stop decorative globe motion while a pointer is over it or motion is reduced. */
export function resolveAutoRotateSpeed(
  pointerOver: boolean,
  prefersReducedMotion: boolean
): number {
  return pointerOver || prefersReducedMotion ? 0 : 0.3;
}
