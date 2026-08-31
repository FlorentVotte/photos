"use client";

import { useEffect, useRef } from "react";

/**
 * Reveals an element the first time it scrolls into view by stamping
 * `data-revealed` on it — the `.gh-reveal` rules in globals.css do the
 * animating. Stamping an attribute rather than setting React state keeps this
 * out of the render path and avoids a setState-in-effect.
 *
 * Elements are revealed immediately when the viewer prefers reduced motion, so
 * nothing depends on an animation that will not run.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      element.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
