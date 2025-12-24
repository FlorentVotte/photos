"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Photo } from "@/lib/types";

interface ChapterRouteMapProps {
  photos: Photo[];
  height?: string;
  showMarkers?: boolean;
  interactive?: boolean;
}

// Dynamically import Leaflet components to avoid SSR issues
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
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

// Dynamically import the FitBounds component
const FitBoundsComponent = dynamic(() => import("./MapFitBounds"), {
  ssr: false,
});

export default function ChapterRouteMap({
  photos,
  height = "350px",
  showMarkers = true,
  interactive = true,
}: ChapterRouteMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  // Filter and sort photos with GPS data by date
  const geoPhotos = photos
    .filter((p) => p.metadata?.latitude && p.metadata?.longitude)
    .sort((a, b) => {
      const dateA = a.metadata.date || "";
      const dateB = b.metadata.date || "";
      return dateA.localeCompare(dateB);
    });

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      // Fix marker icons
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div
        className="w-full bg-surface-dark rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (geoPhotos.length === 0) {
    return (
      <div
        className="w-full bg-surface-dark rounded-xl flex flex-col items-center justify-center gap-2 border border-surface-border"
        style={{ height }}
      >
        <span className="material-symbols-outlined text-4xl text-text-muted/30">
          location_off
        </span>
        <p className="text-text-muted text-sm">No GPS data available</p>
      </div>
    );
  }

  // Calculate bounds
  const lats = geoPhotos.map((p) => p.metadata.latitude!);
  const lngs = geoPhotos.map((p) => p.metadata.longitude!);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
  const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
  const centerLng = (bounds[0][1] + bounds[1][1]) / 2;

  // Create route coordinates
  const routeCoordinates: [number, number][] = geoPhotos.map((p) => [
    p.metadata.latitude!,
    p.metadata.longitude!,
  ]);

  // Create numbered marker icons
  const createNumberedIcon = (index: number, isFirst: boolean, isLast: boolean) => {
    let iconHtml: string;
    if (isFirst) {
      iconHtml = `<div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <span class="material-symbols-outlined text-black text-sm">play_arrow</span>
      </div>`;
    } else if (isLast) {
      iconHtml = `<div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <span class="material-symbols-outlined text-black text-sm">flag</span>
      </div>`;
    } else {
      iconHtml = `<div class="w-6 h-6 bg-white rounded-full border-2 border-primary shadow-lg flex items-center justify-center">
        <span class="text-xs font-bold text-primary">${index + 1}</span>
      </div>`;
    }

    return L.divIcon({
      className: "custom-marker",
      html: iconHtml,
      iconSize: isFirst || isLast ? [32, 32] : [24, 24],
      iconAnchor: isFirst || isLast ? [16, 32] : [12, 24],
      popupAnchor: [0, isFirst || isLast ? -32 : -24],
    });
  };

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
        .leaflet-popup-content-wrapper {
          background: #1a2e22;
          color: white;
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-tip {
          background: #1a2e22;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 180px !important;
        }
      `}</style>
      <div className="rounded-xl overflow-hidden border border-surface-border">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={10}
          className="w-full z-0"
          style={{ height }}
          scrollWheelZoom={interactive}
          dragging={interactive}
        >
          <FitBoundsComponent bounds={bounds} />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Route line */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#1dc964",
                weight: 3,
                opacity: 0.8,
                dashArray: "10, 10",
              }}
            />
          )}

          {/* Photo markers */}
          {showMarkers &&
            geoPhotos.map((photo, index) => (
              <Marker
                key={photo.id}
                position={[photo.metadata.latitude!, photo.metadata.longitude!]}
                icon={createNumberedIcon(
                  index,
                  index === 0,
                  index === geoPhotos.length - 1
                )}
              >
                <Popup>
                  <Link href={`/photo/${photo.id}`} className="block">
                    <img
                      src={photo.src.thumb}
                      alt={photo.title}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2">
                      <p className="font-medium text-foreground text-sm truncate">
                        {photo.title}
                      </p>
                      {photo.metadata.city && (
                        <p className="text-xs text-primary mt-1">
                          {photo.metadata.city}
                        </p>
                      )}
                    </div>
                  </Link>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
      <p className="text-center text-text-muted text-sm mt-3">
        {geoPhotos.length} locations along the route
      </p>
    </>
  );
}
