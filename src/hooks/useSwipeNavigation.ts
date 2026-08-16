import { useCallback, useEffect, useRef, useState } from "react";
import { UI } from "@/lib/constants";
import {
  computeRecentVelocity,
  resolveSwipe,
  type SwipeSample,
} from "@/lib/gesture-utils";

/** Movement needed before we commit to treating the drag as horizontal. */
const AXIS_LOCK_THRESHOLD_PX = 10;
/** Release speed that commits a short flick, in px/ms. */
const FLICK_VELOCITY_PX_PER_MS = 0.11;
/** How many position samples to retain for the velocity calculation. */
const MAX_SAMPLES = 10;

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
  /** Touch move handler - call this in onTouchMove */
  handleSwipeMove: (e: React.TouchEvent) => void;
  /** Touch end handler - call this in onTouchEnd */
  handleSwipeEnd: (e: React.TouchEvent) => void;
  /** Live horizontal offset in px while the finger is down. */
  dragOffset: number;
  /** Whether the offset should transition. False while tracking a finger. */
  shouldAnimateOffset: boolean;
}

/**
 * Handles swipe left/right gestures for navigation.
 *
 * The content tracks the finger 1:1 while dragging, then either commits to a
 * navigation or settles back. Commit is distance *or* velocity based, so a
 * short fast flick counts as much as a long slow drag.
 */
export function useSwipeNavigation({
  enabled,
  onNext,
  onPrev,
}: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  /** null = undecided, true = horizontal drag, false = abandoned */
  const isHorizontal = useRef<boolean | null>(null);
  const samples = useRef<SwipeSample[]>([]);

  const [dragOffset, setDragOffset] = useState(0);
  // Defaults to true so the element's own enter/exit transition works before
  // any dragging has happened.
  const [shouldAnimateOffset, setShouldAnimateOffset] = useState(true);
  const restoreRaf = useRef<number | null>(null);

  const cancelDrag = useCallback(() => {
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontal.current = null;
    samples.current = [];
  }, []);

  // Re-enable transitions on the next frame. Used after a commit, where the
  // offset has to reset instantly — without this the flag would stay off and
  // the lightbox's own exit animation would be skipped.
  const restoreAnimationNextFrame = useCallback(() => {
    if (restoreRaf.current !== null) cancelAnimationFrame(restoreRaf.current);
    restoreRaf.current = requestAnimationFrame(() => {
      restoreRaf.current = null;
      setShouldAnimateOffset(true);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (restoreRaf.current !== null) cancelAnimationFrame(restoreRaf.current);
    };
  }, []);

  const handleSwipeStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isHorizontal.current = null;
        samples.current = [{ x: e.touches[0].clientX, t: Date.now() }];
      } else {
        // A second finger means this is a pinch, not a swipe. Abandon the
        // drag and let the zoom hook take over.
        cancelDrag();
        setShouldAnimateOffset(true);
        setDragOffset(0);
      }
    },
    [cancelDrag]
  );

  const handleSwipeMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return;
      if (touchStartX.current === null || touchStartY.current === null) return;
      if (isHorizontal.current === false) return;

      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Lock the axis on the first meaningful movement so a vertical drag
      // never drags the photo sideways.
      if (isHorizontal.current === null) {
        const travelled = Math.max(Math.abs(deltaX), Math.abs(deltaY));
        if (travelled < AXIS_LOCK_THRESHOLD_PX) return;
        isHorizontal.current = Math.abs(deltaX) > Math.abs(deltaY);
        if (!isHorizontal.current) return;
      }

      samples.current.push({ x: e.touches[0].clientX, t: Date.now() });
      if (samples.current.length > MAX_SAMPLES) samples.current.shift();

      // No transition while the finger is down — the photo must track it 1:1.
      setShouldAnimateOffset(false);
      setDragOffset(deltaX);
    },
    [enabled]
  );

  const handleSwipeEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isHorizontal.current !== true) {
        cancelDrag();
        if (dragOffset !== 0) {
          setShouldAnimateOffset(true);
          setDragOffset(0);
        }
        return;
      }

      if (touchStartX.current === null) return;

      const distance = e.changedTouches[0].clientX - touchStartX.current;
      const velocity = computeRecentVelocity(samples.current);
      const resolution = resolveSwipe({
        distance,
        velocity,
        minDistance: UI.MIN_SWIPE_DISTANCE_PX,
        minVelocity: FLICK_VELOCITY_PX_PER_MS,
      });

      cancelDrag();

      if (resolution === "none") {
        // Settle back to centre.
        setShouldAnimateOffset(true);
        setDragOffset(0);
        return;
      }

      // Committing: snap the offset back with no transition, because the
      // photo underneath is being swapped. The swap drops the image to
      // opacity 0 (see the loading crossfade in Lightbox), so the reset is
      // hidden — whereas animating it would visibly slide the *incoming*
      // photo in from the edge it was never dragged from.
      setShouldAnimateOffset(false);
      setDragOffset(0);
      restoreAnimationNextFrame();

      if (resolution === "next") {
        onNext();
      } else {
        onPrev();
      }
    },
    [enabled, dragOffset, onNext, onPrev, cancelDrag, restoreAnimationNextFrame]
  );

  return {
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
    dragOffset,
    shouldAnimateOffset,
  };
}
