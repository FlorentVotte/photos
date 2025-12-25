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

/**
 * Handles keyboard navigation for lightbox
 * - Arrow keys: navigate
 * - Escape: close
 * - Space: toggle slideshow
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
      // Stop other keyboard handlers from running
      e.stopImmediatePropagation();

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          onNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          onPrev();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case " ": // Space bar toggles slideshow
          e.preventDefault();
          onToggleSlideshow();
          break;
        case "i":
        case "I":
          e.preventDefault();
          onViewDetails();
          break;
      }
    };

    // Use capture phase to intercept events before other handlers
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isActive, onNext, onPrev, onClose, onToggleSlideshow, onViewDetails]);
}
