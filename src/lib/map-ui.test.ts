import { describe, it, expect } from "vitest";
import { globeTouchConfig, resolveColor, touchTargetHtml } from "./map-ui";

describe("resolveColor", () => {
  it("uses the variable when set, trimmed", () => {
    expect(resolveColor("  #123456 ", "#000")).toBe("#123456");
  });
  it("falls back when empty or missing", () => {
    expect(resolveColor("", "#000")).toBe("#000");
    expect(resolveColor("   ", "#000")).toBe("#000");
    expect(resolveColor(undefined, "#000")).toBe("#000");
  });
});

describe("globeTouchConfig", () => {
  it("keeps desktop behaviour unchanged", () => {
    expect(globeTouchConfig({ coarsePointer: false })).toEqual({
      touchAction: null,
      lockPolar: false,
      enableZoom: true,
    });
  });
  it("lets coarse pointers scroll vertically, spin only, no zoom", () => {
    expect(globeTouchConfig({ coarsePointer: true })).toEqual({
      touchAction: "pan-y",
      lockPolar: true,
      enableZoom: false,
    });
  });
});

describe("touchTargetHtml", () => {
  it("wraps content in a centred 44px box", () => {
    const html = touchTargetHtml("<i></i>");
    expect(html).toContain("width:44px;height:44px");
    expect(html).toContain("<i></i>");
  });
});
