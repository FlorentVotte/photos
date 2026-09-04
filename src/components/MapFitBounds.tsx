"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface FitBoundsProps {
  bounds: [[number, number], [number, number]];
}

export default function MapFitBounds({ bounds }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !bounds) return;

    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    });

    return () => cancelAnimationFrame(frame);
  }, [map, bounds]);

  return null;
}
