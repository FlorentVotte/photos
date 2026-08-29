"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BasemapAttribution from "./BasemapAttribution";
import type * as LeafletTypes from "leaflet";

interface PhotoLocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const BasemapLayer = dynamic(() => import("./BasemapLayer"), { ssr: false });

export default function PhotoLocationMap({ latitude, longitude, title }: PhotoLocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof LeafletTypes | null>(null);

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div className="w-full min-h-[200px] flex-1 bg-surface-dark rounded-lg flex items-center justify-center">
        <span className="material-symbols-outlined text-2xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-black text-xs">photo_camera</span>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

  return (
    <div className="flex flex-col flex-1 min-h-[200px]">
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        className="w-full flex-1 min-h-[200px] rounded-lg overflow-hidden z-0"
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <BasemapLayer />
        <Marker
          position={[latitude, longitude]}
          icon={customIcon}
        />
      </MapContainer>
      <p className="text-xs text-text-muted mt-2 text-center">
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </p>
      {/* This map runs without Leaflet's attribution control — too heavy for a
          thumbnail — so the basemap credit sits under it instead. */}
      <BasemapAttribution className="mt-1 text-center" />
    </div>
  );
}
