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

  // Reset zoom when resetKey changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [resetKey]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        isPinching.current = true;
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
            setScale(1);
            setPosition({ x: 0, y: 0 });
          } else {
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
        // Pan when zoomed
        e.preventDefault();
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
  }, []);

  return {
    scale,
    position,
    isZoomed: scale > 1,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetZoom,
  };
}
