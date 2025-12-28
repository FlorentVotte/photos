import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

interface AnimationTarget {
  center: [number, number];
  zoom: number;
}

interface UseMapAnimationOptions {
  duration?: number;
  easeLinearity?: number;
}

/**
 * Hook to manage map flyTo animations with debouncing.
 * Returns a ref callback to attach to the map and a function to trigger animations.
 */
export function useMapAnimation(options: UseMapAnimationOptions = {}) {
  const { duration = 2, easeLinearity = 0.25 } = options;
  const mapRef = useRef<LeafletMap | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setMap = (map: LeafletMap | null) => {
    mapRef.current = map;
  };

  const flyTo = (target: AnimationTarget) => {
    const map = mapRef.current;
    if (!map) return;

    // Clear any pending animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true);

    map.flyTo(target.center, target.zoom, {
      duration,
      easeLinearity,
    });

    // Set animation end timeout (slightly longer than duration to account for rendering)
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration * 1000 + 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    setMap,
    flyTo,
    isAnimating,
    mapRef,
  };
}
