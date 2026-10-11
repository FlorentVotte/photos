import { describe, expect, it } from "vitest";
import { globeRenderBudget, hotspotWrites } from "./globe-render";

describe("globeRenderBudget", () => {
  it("keeps the full budget on fine pointers", () => {
    expect(globeRenderBudget({ coarsePointer: false, devicePixelRatio: 3 })).toEqual({
      antialias: true,
      pixelRatio: 2,
      segments: 64,
    });
    expect(globeRenderBudget({ coarsePointer: false, devicePixelRatio: 1 }).pixelRatio).toBe(1);
  });

  it("lightens the budget on coarse pointers", () => {
    expect(globeRenderBudget({ coarsePointer: true, devicePixelRatio: 3 })).toEqual({
      antialias: false,
      pixelRatio: 1.5,
      segments: 48,
    });
    expect(globeRenderBudget({ coarsePointer: true, devicePixelRatio: 1 }).pixelRatio).toBe(1);
  });
});

describe("hotspotWrites", () => {
  const state = { facing: true, transform: "translate(1px, 2px)" };

  it("writes everything the first time", () => {
    expect(hotspotWrites(null, state)).toEqual({ facing: true, transform: true });
  });

  it("writes nothing when unchanged", () => {
    expect(hotspotWrites(state, { ...state })).toEqual({ facing: false, transform: false });
  });

  it("writes only what changed", () => {
    expect(hotspotWrites(state, { ...state, facing: false })).toEqual({
      facing: true,
      transform: false,
    });
    expect(hotspotWrites(state, { ...state, transform: "translate(3px, 2px)" })).toEqual({
      facing: false,
      transform: true,
    });
  });
});
