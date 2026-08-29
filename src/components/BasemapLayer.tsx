"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Layer } from "leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

// OpenFreeMap serves OpenStreetMap-derived vector tiles with no API key and no
// account. It replaced CARTO's dark_all raster basemap, which started stamping
// an "API KEY REQUIRED" watermark on keyless requests in August 2026 and whose
// raster service is being retired.
//
// Attribution is not set here on purpose: the style's own tile sources carry
// their OpenFreeMap / OpenMapTiles / OpenStreetMap credits, and Leaflet renders
// them in the attribution control. Adding them again here duplicated the line.
const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

export default function BasemapLayer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let cancelled = false;
    let layer: Layer | undefined;

    // maplibre-gl touches `window` as it initialises, so it is pulled in here
    // rather than imported at module scope — PhotoLocationMap reaches the
    // server bundle through PhotoContent.
    import("@maplibre/maplibre-gl-leaflet")
      .then(({ maplibreGL }) => {
        if (cancelled) return;
        layer = maplibreGL({ style: STYLE_URL });
        layer.addTo(map);
      })
      .catch(() => {
        // A basemap that fails to load leaves the markers on a blank pane,
        // which is degraded but still readable. Nothing to recover here.
      });

    return () => {
      cancelled = true;
      layer?.remove();
    };
  }, [map]);

  return null;
}
