"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lets the heavy globe wait until its container is (nearly) on screen and the
 * browser has a spare moment, so three.js never competes with hydration.
 * Once true it stays true.
 */
export function useGlobeMount<T extends Element>() {
  const ref = useRef<T>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let intersecting = false;
    let idle = false;
    let done = false;
    const maybeMount = () => {
      if (!done && intersecting && idle) {
        done = true;
        setReady(true);
        observer.disconnect();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        intersecting = entries[entries.length - 1].isIntersecting;
        maybeMount();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);

    let cancelIdle: () => void;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(
        () => {
          idle = true;
          maybeMount();
        },
        { timeout: 1500 }
      );
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(() => {
        idle = true;
        maybeMount();
      }, 200);
      cancelIdle = () => window.clearTimeout(id);
    }

    return () => {
      observer.disconnect();
      cancelIdle();
    };
  }, []);

  return [ref, ready] as const;
}
