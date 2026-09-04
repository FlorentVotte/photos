"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { formatPhotoTitle } from "@/lib/photo-display";
import { nextVisibleCount } from "@/lib/pagination";
import type { Photo } from "@/lib/types";
import type * as LeafletTypes from "leaflet";

interface PhotoMapProps {
  photos: Photo[];
}

type GeoPhoto = Photo & {
  metadata: Photo["metadata"] & { latitude: number; longitude: number };
};

const MAPPED_PHOTO_BATCH_SIZE = 25;

function hasCoordinates(photo: Photo): photo is GeoPhoto {
  return (
    Number.isFinite(photo.metadata.latitude) &&
    Number.isFinite(photo.metadata.longitude)
  );
}

function photoTitle(photo: Photo, index: number): string {
  return formatPhotoTitle(
    photo,
    photo.albumTitle ? { title: photo.albumTitle } : undefined,
    index
  );
}

function photoLabel(photo: Photo, index: number): string {
  const title = photoTitle(photo, index);
  return photo.caption ? `${title}: ${photo.caption}` : title;
}

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

const FitBoundsComponent = dynamic(() => import("./MapFitBounds"), {
  ssr: false,
});

const BasemapLayer = dynamic(() => import("./BasemapLayer"), { ssr: false });

export default function PhotoMap({ photos }: PhotoMapProps) {
  const { t } = useLocale();
  const [L, setL] = useState<typeof LeafletTypes | null>(null);
  const [pagination, setPagination] = useState(() => ({
    photos,
    visibleCount: MAPPED_PHOTO_BATCH_SIZE,
  }));
  const [basemapFailed, setBasemapFailed] = useState(false);

  const geoPhotos = photos.filter(hasCoordinates);
  if (pagination.photos !== photos) {
    setPagination({ photos, visibleCount: MAPPED_PHOTO_BATCH_SIZE });
  }
  const visibleCount =
    pagination.photos === photos ? pagination.visibleCount : MAPPED_PHOTO_BATCH_SIZE;
  const visibleGeoPhotos = geoPhotos.slice(0, visibleCount);

  const handleBasemapError = useCallback(() => setBasemapFailed(true), []);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  if (geoPhotos.length === 0) {
    return (
      <div className="w-full h-[400px] bg-surface-dark flex flex-col items-center justify-center gap-3 border-y border-surface-border">
        <p className="font-sans text-sm text-text-muted">{t("map", "noPhotos")}</p>
        <p className="font-sans text-xs text-text-muted/60">{t("map", "gpsNote")}</p>
      </div>
    );
  }

  const mappedPhotoList = (
    <section className="mt-8" aria-labelledby="mapped-photos-heading">
      <h2
        id="mapped-photos-heading"
        className="font-display text-2xl font-semibold text-foreground"
      >
        {t("map", "mappedPhotos")}
      </h2>
      <p aria-live="polite" className="mt-2 font-sans text-sm text-text-muted">
        {t("common", "showing")} {visibleGeoPhotos.length} {t("common", "of")} {geoPhotos.length} {t("map", "mappedPhotos").toLocaleLowerCase()}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visibleGeoPhotos.map((photo, index) => (
          <li key={photo.id}>
            <Link
              href={`/photo/${photo.id}`}
              aria-label={photoLabel(photo, index)}
              className="block border border-surface-border px-4 py-3 font-sans text-sm text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark"
            >
              <span className="block truncate">{photoTitle(photo, index)}</span>
              {photo.caption && (
                <span className="mt-1 block truncate text-xs text-text-muted">
                  {photo.caption}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {visibleGeoPhotos.length < geoPhotos.length && (
        <button
          type="button"
          onClick={() =>
            setPagination((current) => ({
              photos,
              visibleCount: nextVisibleCount(
                current.visibleCount,
                geoPhotos.length,
                MAPPED_PHOTO_BATCH_SIZE
              ),
            }))
          }
          className="mt-5 border border-primary px-5 py-2 font-sans text-eyebrow uppercase text-primary transition-colors hover:bg-primary hover:text-background-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark"
        >
          {t("map", "loadMore")}
        </button>
      )}
    </section>
  );

  if (!L) {
    return (
      <>
        <div className="w-full h-[600px] bg-surface-dark flex items-center justify-center">
          <p className="font-sans text-eyebrow uppercase text-text-muted animate-pulse">
            {t("map", "loadingMap")}
          </p>
        </div>
        {mappedPhotoList}
      </>
    );
  }

  const lats = geoPhotos.map((photo) => photo.metadata.latitude);
  const lngs = geoPhotos.map((photo) => photo.metadata.longitude);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
  const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
  const centerLng = (bounds[0][1] + bounds[1][1]) / 2;

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
      <div className="relative bg-surface-dark">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={4}
          className="w-full h-[600px] overflow-hidden z-0 bg-surface-dark"
          scrollWheelZoom={true}
        >
          <FitBoundsComponent bounds={bounds} />
          <BasemapLayer onError={handleBasemapError} />
          {geoPhotos.map((photo, index) => (
            <Marker
              key={photo.id}
              position={[photo.metadata.latitude, photo.metadata.longitude]}
              icon={customIcon}
              keyboard={false}
            >
              <Popup>
                <Link href={`/photo/${photo.id}`} className="block">
                  <img
                    src={photo.src.thumb}
                    alt={photoLabel(photo, index)}
                    className="w-full h-32 object-cover"
                  />
                  <div className="px-3 pt-1.5 pb-2">
                    <p className="font-medium text-foreground truncate text-sm">
                      {photoTitle(photo, index)}
                    </p>
                    {photo.albumTitle && (
                      <p className="text-xs text-primary truncate">{photo.albumTitle}</p>
                    )}
                    <p className="text-xs text-text-muted">
                      {[photo.metadata.date, photo.metadata.location]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {basemapFailed && (
          <p
            role="status"
            className="pointer-events-none absolute bottom-3 left-3 z-[1000] max-w-[min(24rem,calc(100%-1.5rem))] bg-surface-dark/95 px-3 py-2 font-sans text-xs text-text-muted shadow-lg"
          >
            {t("map", "basemapUnavailable")}
          </p>
        )}
      </div>
      <p className="text-center font-sans text-eyebrow uppercase text-text-muted mt-6">
        {geoPhotos.length} {t("map", "photosWithGps")}
      </p>
      {mappedPhotoList}
    </>
  );
}
