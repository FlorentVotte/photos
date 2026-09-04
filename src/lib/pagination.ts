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
  prefersReducedMotion: boolean,
  markerFocused: boolean = false
): number {
  return pointerOver || prefersReducedMotion || markerFocused ? 0 : 0.3;
}

/** Keep markers that are not facing the viewer out of the keyboard tab order. */
export function resolveMarkerTabIndex(isVisible: boolean): 0 | -1 {
  return isVisible ? 0 : -1;
}
