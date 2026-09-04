/**
 * Return the next item in a roving focus sequence, wrapping at either end.
 * Kept DOM-free so the keyboard wrapping contract can run in Vitest's Node
 * environment.
 */
export function resolveFocusTargetIndex(
  currentIndex: number,
  count: number,
  shiftKey: boolean
): number | null {
  if (count <= 0) return null;
  return (currentIndex + (shiftKey ? -1 : 1) + count) % count;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "iframe",
  "object",
  "embed",
  "[contenteditable=true]",
  "[tabindex]",
].join(",");

/**
 * Finds keyboard-focusable descendants while excluding disabled, hidden, and
 * intentionally untabbable elements.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      if (element.matches(":disabled") || element.tabIndex < 0) return false;
      if (element.closest('[hidden], [aria-hidden="true"]')) return false;

      const styles = window.getComputedStyle(element);
      return styles.display !== "none" && styles.visibility !== "hidden";
    }
  );
}
