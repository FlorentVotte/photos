import { useEffect, useState } from "react";

/**
 * Whether the page has scrolled past a threshold.
 *
 * Used to show a scroll edge effect only when content is genuinely passing
 * underneath floating chrome — a divider drawn against nothing is noise.
 */
export function useScrolled(threshold: number = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const read = () => setScrolled(window.scrollY > threshold);
    read();

    // Passive: this never calls preventDefault, and marking it so keeps it
    // off the scrolling critical path.
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, [threshold]);

  return scrolled;
}
