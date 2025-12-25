"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

export default function PhotoLocationMap({ latitude, longitude, title }: PhotoLocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof LeafletTypes | null>(null);

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      // Clear webpack-bundled icon URLs to use custom ones
      delete (leaflet.default.Icon.Default.prototype as LeafletTypes.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div className="w-full h-[200px] bg-surface-dark rounded-lg flex items-center justify-center">
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
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        className="w-full h-[200px] rounded-lg overflow-hidden z-0"
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker
          position={[latitude, longitude]}
          icon={customIcon}
        />
      </MapContainer>
      <p className="text-xs text-text-muted mt-2 text-center">
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </p>
    </>
  );
}
