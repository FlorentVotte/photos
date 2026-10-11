import { useEffect } from "react";

interface UseLightboxKeyboardOptions {
  /** Whether keyboard handling is active */
  isActive: boolean;
  /** Navigate to next item */
  onNext: () => void;
  /** Navigate to previous item */
  onPrev: () => void;
  /** Close the lightbox */
  onClose: () => void;
  /** Toggle slideshow play/pause */
  onToggleSlideshow: () => void;
  /** Navigate to photo details */
  onViewDetails: () => void;
}

interface TargetLike {
  tagName?: string;
  getAttribute?: (name: string) => string | null;
}

const INTERACTIVE_TAGS = new Set(["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"]);

/**
 * Whether a key event's target is a control that the browser activates
 * itself on Space/Enter (so a global Space shortcut must stay out of its way).
 */
export function isInteractiveTarget(target: unknown): boolean {
  if (!target || typeof target !== "object") return false;
  const { tagName, getAttribute } = target as TargetLike;
  if (tagName && INTERACTIVE_TAGS.has(tagName.toUpperCase())) return true;
  return typeof getAttribute === "function" && getAttribute.call(target, "role") === "button";
}

/**
 * Handles keyboard navigation for lightbox
 * - Arrow keys: navigate
 * - Escape: close
 * - Space: toggle slideshow (unless a button/link/field is focused)
 * - I: view details
 */
export function useLightboxKeyboard({
  isActive,
  onNext,
  onPrev,
  onClose,
  onToggleSlideshow,
  onViewDetails,
}: UseLightboxKeyboardOptions): void {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let handler: (() => void) | null = null;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          handler = onNext;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          handler = onPrev;
          break;
        case "Escape":
          handler = onClose;
          break;
        case " ": // Space toggles the slideshow, unless a control has focus
          if (isInteractiveTarget(e.target)) return;
          handler = onToggleSlideshow;
          break;
        case "i":
        case "I":
          handler = onViewDetails;
          break;
      }

      // Only swallow keys we handle: Tab, Enter and everything else must
      // reach the focus trap and the focused control untouched.
      if (!handler) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      handler();
    };

    // Use capture phase to intercept events before other handlers
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isActive, onNext, onPrev, onClose, onToggleSlideshow, onViewDetails]);
}
