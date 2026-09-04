import { type RefObject, useEffect } from "react";
import {
  getFocusableElements,
  resolveFocusTargetIndex,
  resolveRestoreFocusTarget,
} from "@/lib/focus-management";

interface UseModalFocusOptions {
  isOpen: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Explicit return target when an opener unmounts while the dialog opens. */
  restoreFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Optional selector for background roots when siblings alone are not enough. */
  inertRootSelector?: string;
}

interface InertState {
  element: HTMLElement;
  hadInert: boolean;
  inertValue: string | null;
  ariaHidden: string | null;
}

function getBackgroundRoots(container: HTMLElement, selector?: string): HTMLElement[] {
  const candidates = selector
    ? Array.from(document.querySelectorAll<HTMLElement>(selector))
    : Array.from(container.parentElement?.children ?? []).filter(
        (element): element is HTMLElement => element instanceof HTMLElement
      );

  return candidates.filter(
    (element) =>
      element !== container &&
      !element.contains(container) &&
      !container.contains(element)
  );
}

/**
 * Makes an already-rendered overlay behave as a keyboard modal. Background
 * siblings are temporarily inert, and every altered attribute is restored
 * verbatim when the overlay closes.
 */
export function useModalFocus({
  isOpen,
  containerRef,
  initialFocusRef,
  restoreFocusRef,
  onClose,
  inertRootSelector,
}: UseModalFocusOptions): void {
  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inertStates: InertState[] = getBackgroundRoots(container, inertRootSelector).map(
      (element) => ({
        element,
        hadInert: element.hasAttribute("inert"),
        inertValue: element.getAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      })
    );

    inertStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const focusFrame = window.requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? getFocusableElements(container)[0] ?? container;
      target.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      const isBoundary =
        currentIndex === -1 ||
        (!event.shiftKey && currentIndex === focusableElements.length - 1) ||
        (event.shiftKey && currentIndex === 0);

      if (!isBoundary) return;

      const targetIndex =
        currentIndex === -1
          ? event.shiftKey
            ? focusableElements.length - 1
            : 0
          : resolveFocusTargetIndex(currentIndex, focusableElements.length, event.shiftKey);

      if (targetIndex === null) return;
      event.preventDefault();
      focusableElements[targetIndex].focus();
    };

    // Capture puts Escape ahead of component-level shortcut listeners, while
    // allowing the existing lightbox shortcuts to keep handling their keys.
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown, true);

      inertStates.forEach(({ element, hadInert, inertValue, ariaHidden }) => {
        if (hadInert) element.setAttribute("inert", inertValue ?? "");
        else element.removeAttribute("inert");

        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });

      // Resolve this ref during cleanup so a conditionally remounted opener
      // wins over the node that was active when the dialog opened.
      const restoreTarget = resolveRestoreFocusTarget(
        // eslint-disable-next-line react-hooks/exhaustive-deps
        restoreFocusRef?.current,
        previouslyFocused
      );
      if (restoreTarget?.isConnected) restoreTarget.focus();
    };
  }, [containerRef, inertRootSelector, initialFocusRef, isOpen, onClose, restoreFocusRef]);
}
