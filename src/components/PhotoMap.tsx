"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";

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

// Dynamically import the FitBounds component
const FitBoundsComponent = dynamic(
  () => import("./MapFitBounds"),
  { ssr: false }
);

export default function PhotoMap({ photos }: PhotoMapProps) {
  const { t } = useLocale();
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  // Filter photos with GPS data
  const geoPhotos = photos.filter(
    (p) => p.metadata?.latitude && p.metadata?.longitude
  );

  // Debug: log in browser console
  useEffect(() => {
    console.log("PhotoMap received photos:", photos.length);
    console.log("Photos with GPS:", geoPhotos.length);
    if (photos.length > 0) {
      console.log("Sample photo metadata:", photos[0].metadata);
    }
  }, [photos, geoPhotos.length]);

  useEffect(() => {
    setIsClient(true);
    // Import Leaflet on client side
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      // Fix marker icons
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div className="w-full h-[600px] bg-surface-dark rounded-xl flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (geoPhotos.length === 0) {
    return (
      <div className="w-full h-[400px] bg-surface-dark rounded-xl flex flex-col items-center justify-center gap-4 border border-surface-border">
        <span className="material-symbols-outlined text-6xl text-text-muted/30">
          location_off
        </span>
        <p className="text-text-muted">{t("map", "noGpsPhotos")}</p>
        <p className="text-sm text-text-muted/70">
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

  // Custom marker icon
  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-black text-sm">photo_camera</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
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
        className="w-full h-[600px] rounded-xl overflow-hidden z-0"
        scrollWheelZoom={true}
      >
        <FitBoundsComponent bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
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
      <p className="text-center text-text-muted text-sm mt-4">
        {geoPhotos.length} {t("map", "photosWithGps")}
      </p>
    </>
  );
}
