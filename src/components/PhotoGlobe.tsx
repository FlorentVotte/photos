"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe3D, type GlobeMarker } from "./Globe3D";
import { albumMarkers } from "@/lib/geo-utils";
import { useLocale } from "@/lib/LocaleContext";
import type { Album, AlbumMarker, Photo } from "@/lib/types";

interface PhotoGlobeProps {
  photos: Photo[];
  albums: Album[];
}

export default function PhotoGlobe({ photos, albums }: PhotoGlobeProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [hovered, setHovered] = useState<AlbumMarker | null>(null);
  const [pointerOver, setPointerOver] = useState(false);

  const markers = useMemo(
    () => albumMarkers(photos, albums),
    [photos, albums]
  );

  // Globe3D hands back the very object it was given, so a lookup by identity
  // recovers the album fields without casting.
  const resolve = useCallback(
    (marker: GlobeMarker | null) =>
      marker ? markers.find((m) => m === marker) ?? null : null,
    [markers]
  );

  const handleClick = useCallback(
    (marker: GlobeMarker) => {
      const album = resolve(marker);
      if (album) router.push(`/album/${album.slug}`);
    },
    [resolve, router]
  );

  const handleHover = useCallback(
    (marker: GlobeMarker | null) => setHovered(resolve(marker)),
    [resolve]
  );

  const config = useMemo(
    () => ({
      showAtmosphere: false,
      // The globe drifts on its own to reveal markers on the far side, but
      // freezes as soon as the pointer enters — a moving marker is a moving
      // click target.
      autoRotateSpeed: pointerOver ? 0 : 0.3,
      ambientIntensity: 0.85,
      enableZoom: true,
      minDistance: 4,
      maxDistance: 12,
      markerSize: 18,
    }),
    [pointerOver]
  );

  if (markers.length === 0) {
    return (
      <div className="w-full h-[400px] bg-surface-dark flex flex-col items-center justify-center gap-3 border-y border-surface-border">
        <p className="font-sans text-sm text-text-muted">
          {t("map", "noGeoAlbums")}
        </p>
        <p className="font-sans text-xs text-text-muted/60">
          {t("map", "gpsNote")}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* No panel or border: the canvas is transparent, so the globe sits
          straight on the page background. */}
      <div
        className="relative w-full"
        onPointerEnter={() => setPointerOver(true)}
        onPointerLeave={() => setPointerOver(false)}
      >
        <Globe3D
          markers={markers}
          // The camera frames the globe vertically, so a tall narrow viewport
          // crops it sideways — keep the canvas closer to square on mobile.
          className="h-[420px] md:h-[600px]"
          config={config}
          onMarkerClick={handleClick}
          onMarkerHover={handleHover}
        />

        {hovered && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-6">
            <div className="mx-auto w-fit max-w-full bg-surface-dark/90 px-4 py-2 backdrop-blur-sm">
              <p className="font-sans text-sm font-medium text-foreground truncate">
                {hovered.label}
              </p>
              <p className="font-sans text-xs text-text-muted">
                {hovered.photoCount} {t("about", "photos")}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center font-sans text-eyebrow uppercase text-text-muted mt-6">
        {markers.length} {t("map", "albumsOnGlobe")}
      </p>
    </>
  );
}
