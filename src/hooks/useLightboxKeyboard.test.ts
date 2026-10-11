import { describe, expect, it } from "vitest";
import { isInteractiveTarget } from "./useLightboxKeyboard";

const el = (tagName: string, attrs: Record<string, string> = {}) => ({
  tagName,
  getAttribute: (name: string) => attrs[name] ?? null,
});

describe("isInteractiveTarget", () => {
  it.each(["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT", "button"])(
    "treats <%s> as interactive",
    (tag) => {
      expect(isInteractiveTarget(el(tag))).toBe(true);
    }
  );

  it("treats role=button as interactive", () => {
    expect(isInteractiveTarget(el("DIV", { role: "button" }))).toBe(true);
  });

  it("ignores plain containers and missing targets", () => {
    expect(isInteractiveTarget(el("DIV"))).toBe(false);
    expect(isInteractiveTarget(el("DIV", { role: "dialog" }))).toBe(false);
    expect(isInteractiveTarget(null)).toBe(false);
    expect(isInteractiveTarget({})).toBe(false);
  });
});
