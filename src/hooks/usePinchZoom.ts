import { useState, useCallback, useRef, useEffect } from "react";
import { UI } from "@/lib/constants";

interface Position {
  x: number;
  y: number;
}

interface UsePinchZoomOptions {
  /** Reset zoom when this value changes */
  resetKey?: string | number;
  /** Maximum zoom scale */
  maxScale?: number;
  /** Default zoom scale for double-tap */
  doubleTapScale?: number;
}

interface UsePinchZoomReturn {
  /** Current zoom scale */
  scale: number;
  /** Current pan position */
  position: Position;
  /** Whether currently zoomed in */
  isZoomed: boolean;
  /**
   * Whether the transform should animate. False while a finger is driving
   * the transform (a transition there lags the finger) and false for the
   * snap-to-1 that happens when the photo changes.
   */
  shouldAnimate: boolean;
  /** CSS transform-origin for the zoom, e.g. "42% 61%". */
  transformOrigin: string;
  /** Touch start handler */
  handleTouchStart: (e: React.TouchEvent) => void;
  /** Touch move handler */
  handleTouchMove: (e: React.TouchEvent) => void;
  /** Touch end handler */
  handleTouchEnd: (e: React.TouchEvent) => void;
  /** Reset zoom to default */
  resetZoom: () => void;
}

/**
 * Handles pinch-to-zoom and pan gestures for images
 * Also handles double-tap to zoom
 */
export function usePinchZoom({
  resetKey,
  maxScale = UI.MAX_ZOOM_SCALE,
  doubleTapScale = 2.5,
}: UsePinchZoomOptions = {}): UsePinchZoomReturn {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  // True only while a finger is actively driving the transform.
  const [isGesturing, setIsGesturing] = useState(false);
  // True for the one frame in which we jump back to scale 1 on photo change.
  const [isSnapping, setIsSnapping] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  // Touch tracking refs
  const lastTapTime = useRef<number>(0);
  const initialPinchDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);
  const isPinching = useRef<boolean>(false);
  const lastPanPosition = useRef<Position | null>(null);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Reset zoom when resetKey changes. This is a hard snap, not an animation:
  // the photo is being swapped underneath, and an animated zoom-out layered
  // on top of the image crossfade reads as broken rather than smooth.
  useEffect(() => {
    setIsSnapping(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setTransformOrigin("center center");

    const raf = requestAnimationFrame(() => setIsSnapping(false));
    return () => cancelAnimationFrame(raf);
  }, [resetKey]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setTransformOrigin("center center");
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start. Only a two-finger touch marks the gesture as active
        // here — a single tap must NOT, or the double-tap zoom below would
        // have its own transition disabled and snap instead of animating.
        isPinching.current = true;
        setIsGesturing(true);
        initialPinchDistance.current = getTouchDistance(e.touches);
        initialScale.current = scale;
      } else if (e.touches.length === 1) {
        // Track for panning when zoomed
        if (scale > 1) {
          lastPanPosition.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        }

        // Double-tap detection
        const now = Date.now();
        if (now - lastTapTime.current < UI.DOUBLE_TAP_WINDOW_MS) {
          // Double tap - toggle zoom
          if (scale > 1) {
            // Keep the existing origin so it animates back out about the
            // same point it zoomed in on.
            setScale(1);
            setPosition({ x: 0, y: 0 });
          } else {
            // Zoom toward whatever was tapped rather than the centre.
            // Only safe to move the origin from a resting scale of 1 —
            // changing it mid-zoom would make the image jump.
            const rect = e.currentTarget.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const originX =
                ((e.touches[0].clientX - rect.left) / rect.width) * 100;
              const originY =
                ((e.touches[0].clientY - rect.top) / rect.height) * 100;
              setTransformOrigin(`${originX.toFixed(2)}% ${originY.toFixed(2)}%`);
            }
            setScale(doubleTapScale);
          }
          lastTapTime.current = 0;
        } else {
          lastTapTime.current = now;
        }
      }
    },
    [scale, doubleTapScale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance.current !== null) {
        // Pinch zoom
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);
        const scaleChange = currentDistance / initialPinchDistance.current;
        const newScale = Math.min(
          Math.max(initialScale.current * scaleChange, 1),
          maxScale
        );
        setScale(newScale);

        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
      } else if (e.touches.length === 1 && scale > 1 && lastPanPosition.current) {
        // Pan when zoomed. The gesture only counts as active once the finger
        // actually moves, so a stationary tap keeps its animation.
        e.preventDefault();
        setIsGesturing(true);
        const deltaX = e.touches[0].clientX - lastPanPosition.current.x;
        const deltaY = e.touches[0].clientY - lastPanPosition.current.y;

        setPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));

        lastPanPosition.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    },
    [scale, maxScale]
  );

  const handleTouchEnd = useCallback(() => {
    if (isPinching.current) {
      isPinching.current = false;
      initialPinchDistance.current = null;
    }
    lastPanPosition.current = null;
    setIsGesturing(false);
  }, []);

  return {
    scale,
    position,
    isZoomed: scale > 1,
    shouldAnimate: !isGesturing && !isSnapping,
    transformOrigin,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetZoom,
  };
}
