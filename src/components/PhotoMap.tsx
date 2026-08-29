"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import type * as LeafletTypes from "leaflet";

interface Photo {
  id: string;
  title: string;
  src: { thumb: string };
  metadata: {
    date?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  };
  albumId: string;
  albumTitle?: string;
  albumSlug?: string;
}

interface PhotoMapProps {
  photos: Photo[];
}

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
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

// Dynamically import the FitBounds component
const FitBoundsComponent = dynamic(
  () => import("./MapFitBounds"),
  { ssr: false }
);

const BasemapLayer = dynamic(() => import("./BasemapLayer"), { ssr: false });

export default function PhotoMap({ photos }: PhotoMapProps) {
  const { t } = useLocale();
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof LeafletTypes | null>(null);

  // Filter photos with GPS data
  const geoPhotos = photos.filter(
    (p) => p.metadata?.latitude && p.metadata?.longitude
  );

  useEffect(() => {
    setIsClient(true);
    // Import Leaflet on client side
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div className="w-full h-[600px] bg-surface-dark flex items-center justify-center">
        <p className="font-sans text-eyebrow uppercase text-text-muted animate-pulse">
          Loading map
        </p>
      </div>
    );
  }

  if (geoPhotos.length === 0) {
    return (
      <div className="w-full h-[400px] bg-surface-dark flex flex-col items-center justify-center gap-3 border-y border-surface-border">
        <p className="font-sans text-sm text-text-muted">{t("map", "noGpsPhotos")}</p>
        <p className="font-sans text-xs text-text-muted/60">
          GPS coordinates are extracted from photo EXIF data during sync
        </p>
      </div>
    );
  }

  // Calculate bounds to fit all markers
  const lats = geoPhotos.map((p) => p.metadata.latitude!);
  const lngs = geoPhotos.map((p) => p.metadata.longitude!);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lats), Math.min(...lngs)], // Southwest
    [Math.max(...lats), Math.max(...lngs)], // Northeast
  ];
  const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
  const centerLng = (bounds[0][1] + bounds[1][1]) / 2;

  // Custom marker — a small ring, no icon
  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/30"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });

  return (
    <>
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: var(--color-surface);
          color: var(--color-text-primary);
          border-radius: 0;
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-tip {
          background: var(--color-surface);
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 180px !important;
        }
        .leaflet-popup-content p {
          margin: 0 !important;
        }
      `}</style>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={4}
        className="w-full h-[600px] overflow-hidden z-0"
        scrollWheelZoom={true}
      >
        <FitBoundsComponent bounds={bounds} />
        <BasemapLayer />
        {geoPhotos.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.metadata.latitude!, photo.metadata.longitude!]}
            icon={customIcon}
          >
            <Popup>
              <Link href={`/photo/${photo.id}`} className="block">
                <img
                  src={photo.src.thumb}
                  alt={photo.title}
                  className="w-full h-32 object-cover"
                />
                <div className="px-3 pt-1.5 pb-2">
                  <p className="font-medium text-foreground truncate text-sm">{photo.title}</p>
                  {photo.albumTitle && (
                    <p className="text-xs text-primary truncate">{photo.albumTitle}</p>
                  )}
                  <p className="text-xs text-text-muted">
                    {[photo.metadata.date, photo.metadata.location].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="text-center font-sans text-eyebrow uppercase text-text-muted mt-6">
        {geoPhotos.length} {t("map", "photosWithGps")}
      </p>
    </>
  );
}
