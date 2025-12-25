import { useCallback, useRef } from "react";
import { UI } from "@/lib/constants";

interface UseSwipeNavigationOptions {
  /** Whether swipe is enabled (disabled when zoomed) */
  enabled: boolean;
  /** Navigate to next item */
  onNext: () => void;
  /** Navigate to previous item */
  onPrev: () => void;
}

interface UseSwipeNavigationReturn {
  /** Touch start handler - call this in onTouchStart */
  handleSwipeStart: (e: React.TouchEvent) => void;
  /** Touch end handler - call this in onTouchEnd */
  handleSwipeEnd: (e: React.TouchEvent) => void;
}

/**
 * Handles swipe left/right gestures for navigation
 */
export function useSwipeNavigation({
  enabled,
  onNext,
  onPrev,
}: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleSwipeStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleSwipeEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) {
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }

      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // Ensure horizontal swipe is dominant and meets minimum distance
      if (
        Math.abs(deltaX) > UI.MIN_SWIPE_DISTANCE_PX &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        if (deltaX > 0) {
          onPrev();
        } else {
          onNext();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [enabled, onNext, onPrev]
  );

  return {
    handleSwipeStart,
    handleSwipeEnd,
  };
}
