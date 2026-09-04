"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Photo } from "@/lib/types";
import type * as LeafletTypes from "leaflet";
import { useLocale } from "@/lib/LocaleContext";
import { formatPhotoAccessibleLabel } from "@/lib/photo-display";

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

const BasemapLayer = dynamic(() => import("./BasemapLayer"), { ssr: false });

export default function ChapterRouteMap({
  photos,
  height = "350px",
  showMarkers = true,
  interactive = true,
}: ChapterRouteMapProps) {
  const { locale, t } = useLocale();
  const [L, setL] = useState<typeof LeafletTypes | null>(null);

  // Filter and sort photos with GPS data by date
  const geoPhotos = photos
    .filter(
      (p) =>
        Number.isFinite(p.metadata?.latitude) &&
        Number.isFinite(p.metadata?.longitude)
    )
    .sort((a, b) => {
      const dateA = a.metadata.date || "";
      const dateB = b.metadata.date || "";
      return dateA.localeCompare(dateB);
    });

  useEffect(() => {
    let isActive = true;

    import("leaflet").then((leaflet) => {
      if (isActive) setL(leaflet.default);
    });

    return () => {
      isActive = false;
    };
  }, []);

  if (!L) {
    return (
      <div
        className="w-full bg-surface-dark flex items-center justify-center"
        style={{ height }}
      >
        <p className="font-sans text-eyebrow uppercase text-text-muted animate-pulse">
          {t("stats", "loadingMap")}
        </p>
      </div>
    );
  }

  if (geoPhotos.length === 0) {
    return (
      <div
        className="w-full bg-surface-dark flex items-center justify-center border-y border-surface-border"
        style={{ height }}
      >
        <p className="font-sans text-sm text-text-muted">{t("stats", "noGpsData")}</p>
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

  // Numbered marker icons — small, restrained, themed via CSS vars
  const createNumberedIcon = (index: number, isFirst: boolean, isLast: boolean) => {
    let iconHtml: string;
    if (isFirst || isLast) {
      const letter = isFirst ? "A" : "B";
      iconHtml = `<div class="w-6 h-6 rounded-full bg-primary ring-4 ring-primary/30 flex items-center justify-center">
        <span class="text-[0.625rem] font-semibold text-background-dark tracking-wider">${letter}</span>
      </div>`;
    } else {
      iconHtml = `<div class="w-4 h-4 rounded-full bg-primary/70 ring-2 ring-primary/20 flex items-center justify-center">
        <span class="text-[0.5rem] font-semibold text-background-dark">${index + 1}</span>
      </div>`;
    }

    return L.divIcon({
      className: "custom-marker",
      html: iconHtml,
      iconSize: isFirst || isLast ? [24, 24] : [16, 16],
      iconAnchor: isFirst || isLast ? [12, 12] : [8, 8],
      popupAnchor: [0, isFirst || isLast ? -16 : -10],
    });
  };

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
          margin: 0;
          width: 180px !important;
        }
      `}</style>
      <div className="overflow-hidden border-y border-surface-border">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={10}
          className="w-full z-0"
          style={{ height }}
          scrollWheelZoom={interactive}
          dragging={interactive}
        >
          <FitBoundsComponent bounds={bounds} />
          <BasemapLayer />

          {/* Route line */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#7ba88e",
                weight: 2,
                opacity: 0.7,
                dashArray: "8, 8",
              }}
            />
          )}

          {/* Photo markers */}
          {showMarkers &&
            geoPhotos.map((photo, index) => {
              const label = formatPhotoAccessibleLabel(photo, photo.albumTitle, index, locale);

              return (
              <Marker
                key={photo.id}
                keyboard={false}
                position={[photo.metadata.latitude!, photo.metadata.longitude!]}
                icon={createNumberedIcon(
                  index,
                  index === 0,
                  index === geoPhotos.length - 1
                )}
              >
                <Popup>
                  <Link
                    href={`/photo/${photo.id}`}
                    className="block"
                    aria-label={label}
                  >
                    <img
                      src={photo.src.thumb}
                      alt={label}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2">
                      <p className="font-medium text-foreground text-sm truncate">
                        {label}
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
              );
            })}
        </MapContainer>
      </div>
      <p className="text-center font-sans text-eyebrow uppercase text-text-muted mt-6">
        {geoPhotos.length} {t("stats", "locationsAlongRoute")}
      </p>
    </>
  );
}
