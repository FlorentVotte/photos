"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

interface ChapterLocation {
  center: [number, number];
  zoom: number;
  hasGps: boolean;
}

interface MapAnimatorProps {
  target: ChapterLocation | null;
}

export default function MapAnimator({ target }: MapAnimatorProps) {
  const map = useMap();
  const lastTargetRef = useRef<ChapterLocation | null>(null);

  useEffect(() => {
    if (!target || !map) return;

    // Check if target has actually changed
    const last = lastTargetRef.current;
    if (
      last &&
      last.center[0] === target.center[0] &&
      last.center[1] === target.center[1] &&
      last.zoom === target.zoom
    ) {
      return;
    }

    lastTargetRef.current = target;

    // Animate to the new location
    map.flyTo(target.center, target.zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [target, map]);

  return null;
}
