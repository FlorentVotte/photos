import { useEffect, useState, RefObject } from "react";

/**
 * Tracks which element is currently in view using Intersection Observer.
 * Returns the index of the active element based on which one is closest to the center.
 */
export function useScrollSpy(
  refs: RefObject<HTMLElement | null>[],
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (refs.length === 0) return;

    const { threshold = 0.5, rootMargin = "-40% 0px -40% 0px" } = options;

    // Track visibility ratios for each element
    const visibilityMap = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap.set(entry.target, entry.intersectionRatio);
        });

        // Find the element with highest visibility
        let maxRatio = 0;
        let maxIndex = activeIndex;

        refs.forEach((ref, index) => {
          if (ref.current) {
            const ratio = visibilityMap.get(ref.current) || 0;
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxIndex = index;
            }
          }
        });

        if (maxRatio > 0) {
          setActiveIndex(maxIndex);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin,
      }
    );

    // Observe all elements
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [refs, options.threshold, options.rootMargin]);

  return activeIndex;
}
