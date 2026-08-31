"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a media query. Read through useSyncExternalStore so the server
 * snapshot is a definite `false` and the client swaps in the real answer during
 * hydration — no mismatch, and no state to set from an effect.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
