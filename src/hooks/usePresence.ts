import { useEffect, useState } from "react";

interface UsePresenceReturn {
  /** Keep the element in the DOM (true through the whole exit animation). */
  shouldRender: boolean;
  /** Drive the "open" visual state — false for one frame on enter. */
  isVisible: boolean;
}

/**
 * Keeps a conditionally-rendered element mounted long enough to animate out.
 *
 * Components that do `if (!isOpen) return null` unmount instantly, so an exit
 * transition never gets a chance to run. This splits the two concerns: mount
 * immediately, flip the visual state a frame later so the browser has a
 * "from" state to transition out of, and delay the unmount by the exit
 * duration on the way back.
 *
 * @param isOpen       The caller's open state.
 * @param exitDuration How long the exit animation runs, in ms.
 */
export function usePresence(
  isOpen: boolean,
  exitDuration: number
): UsePresenceReturn {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      // Two frames, not one. A single rAF can still be batched into the
      // same paint as the initial mount, which leaves no "from" state and
      // the enter transition silently never runs.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setIsVisible(true));
      });

      return () => {
        cancelAnimationFrame(outer);
        if (inner) cancelAnimationFrame(inner);
      };
    }

    setIsVisible(false);

    // Timer rather than `transitionend`: that event never fires when the
    // transition is skipped (reduced motion, or a display:none ancestor),
    // which would strand the element mounted forever.
    const timer = setTimeout(() => setShouldRender(false), exitDuration);
    return () => clearTimeout(timer);
  }, [isOpen, exitDuration]);

  return { shouldRender, isVisible };
}
