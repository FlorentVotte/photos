"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Layer } from "leaflet";
import type { Map as MapLibreMap } from "maplibre-gl";
// Both stylesheets ship from node_modules rather than a CDN. Leaflet's used to
// be a <link> to unpkg.com in each map component, which sent a visitor's IP to
// a third party on every map view.
import "leaflet/dist/leaflet.css";
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
const NOOP = () => {};

interface BasemapLayerProps {
  onError?: () => void;
}

export default function BasemapLayer({ onError = NOOP }: BasemapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let cancelled = false;
    let layer: Layer | undefined;
    let maplibreMap: MapLibreMap | undefined;

    const handleError = () => {
      if (!cancelled) onError();
    };

    // maplibre-gl touches `window` as it initialises, so it is pulled in here
    // rather than imported at module scope — PhotoLocationMap reaches the
    // server bundle through PhotoContent.
    import("@maplibre/maplibre-gl-leaflet")
      .then(({ maplibreGL }) => {
        if (cancelled) return;
        const nextLayer = maplibreGL({ style: STYLE_URL });
        nextLayer.addTo(map);
        layer = nextLayer;
        maplibreMap = nextLayer.getMaplibreMap();
        maplibreMap.on("error", handleError);
      })
      .catch(handleError);

    return () => {
      cancelled = true;
      maplibreMap?.off("error", handleError);
      layer?.remove();
    };
  }, [map, onError]);

  return null;
}
