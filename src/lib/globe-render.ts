export interface GlobeRenderBudget {
  antialias: boolean;
  pixelRatio: number;
  segments: number;
}

/**
 * How much the home globe may spend per frame. Touch devices get a lighter
 * budget: no MSAA, a lower pixel ratio and a coarser sphere.
 */
export function globeRenderBudget({
  coarsePointer,
  devicePixelRatio,
}: {
  coarsePointer: boolean;
  devicePixelRatio: number;
}): GlobeRenderBudget {
  if (coarsePointer) {
    return {
      antialias: false,
      pixelRatio: Math.min(devicePixelRatio, 1.5),
      segments: 48,
    };
  }
  return {
    antialias: true,
    pixelRatio: Math.min(devicePixelRatio, 2),
    segments: 64,
  };
}

export interface HotspotState {
  facing: boolean;
  transform: string;
}

/** Which parts of a hotspot's DOM need writing, given what was written last. */
export function hotspotWrites(
  previous: HotspotState | null,
  next: HotspotState
): { facing: boolean; transform: boolean } {
  return {
    facing: previous === null || previous.facing !== next.facing,
    transform: previous === null || previous.transform !== next.transform,
  };
}
