import { describe, expect, it } from "vitest";
import {
  resolveFocusTargetIndex,
  resolveRestoreFocusTarget,
} from "./focus-management";

describe("resolveFocusTargetIndex", () => {
  it("wraps Tab from the final control to the first", () => {
    expect(resolveFocusTargetIndex(2, 3, false)).toBe(0);
  });

  it("wraps Shift+Tab from the first control to the final", () => {
    expect(resolveFocusTargetIndex(0, 3, true)).toBe(2);
  });

  it("does not resolve a target when the dialog has no controls", () => {
    expect(resolveFocusTargetIndex(0, 0, false)).toBeNull();
  });

  it("keeps focus on the only control", () => {
    expect(resolveFocusTargetIndex(0, 1, false)).toBe(0);
    expect(resolveFocusTargetIndex(0, 1, true)).toBe(0);
  });
});

describe("resolveRestoreFocusTarget", () => {
  it("uses the current explicit target instead of the opener that was active at open", () => {
    expect(resolveRestoreFocusTarget("remounted opener", "old opener")).toBe(
      "remounted opener"
    );
  });

  it("falls back to the active element captured when the dialog opened", () => {
    expect(resolveRestoreFocusTarget(null, "old opener")).toBe("old opener");
  });
});
