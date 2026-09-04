import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { MobileMenuDialog } from "./Header";

interface ElementProps {
  children?: ReactNode;
  className?: string;
  role?: string;
  "aria-label"?: string;
}

function descendants(node: ReactNode): ReactElement<ElementProps>[] {
  if (!isValidElement<ElementProps>(node)) return [];

  return [
    node,
    ...Children.toArray(node.props.children).flatMap((child) => descendants(child)),
  ];
}

describe("MobileMenuDialog", () => {
  it("keeps the localized close button inside the modal dialog", () => {
    const dialog = MobileMenuDialog({
      containerRef: { current: null },
      initialFocusRef: { current: null },
      locale: "en",
      onClose: () => undefined,
      onToggleLocale: () => undefined,
      t: (_section, key) => (key === "closeMenu" ? "Close menu" : key),
    });

    expect(dialog.props.role).toBe("dialog");
    const closeButton = descendants(dialog).find(
      (element) =>
        element.type === "button" && element.props["aria-label"] === "Close menu"
    );

    expect(closeButton).toBeDefined();
    expect(closeButton?.props.className).toContain("min-h-11");
    expect(closeButton?.props.className).toContain("min-w-11");
  });
});
