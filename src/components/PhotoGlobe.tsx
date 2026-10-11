"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe3D, type GlobeMarker } from "./Globe3D";
import { albumMarkers } from "@/lib/geo-utils";
import { resolveAutoRotateSpeed } from "@/lib/pagination";
import { useLocale } from "@/lib/LocaleContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const [markerFocused, setMarkerFocused] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const markers = useMemo(
    () => albumMarkers(photos, albums),
    [photos, albums]
  );

  const locations = useMemo(
    () => new Map(albums.map((album) => [album.slug, album.location])),
    [albums]
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

  const handleMarkerFocusChange = useCallback(
    (isFocused: boolean) => setMarkerFocused(isFocused),
    []
  );

  const config = useMemo(
    () => ({
      showAtmosphere: false,
      // The globe drifts on its own to reveal markers on the far side, but
      // freezes as soon as the pointer enters — a moving marker is a moving
      // click target.
      autoRotateSpeed: resolveAutoRotateSpeed(
        pointerOver,
        prefersReducedMotion,
        markerFocused
      ),
      ambientIntensity: 0.85,
      enableZoom: true,
      minDistance: 4,
      maxDistance: 12,
      markerSize: 40,
    }),
    [markerFocused, pointerOver, prefersReducedMotion]
  );

  if (markers.length === 0) {
    return (
      <div className="w-full h-[400px] bg-surface-dark flex flex-col items-center justify-center gap-3 border-y border-surface-border">
        <p className="font-sans text-sm text-text-muted">
          {t("map", "noGeoAlbums")}
        </p>
        <p className="font-sans text-xs text-text-muted">
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
          markerFallbackLabel={t("map", "albumMarker")}
          onMarkerFocusChange={handleMarkerFocusChange}
          loadingLabel={t("map", "loadingGlobe")}
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

      {/* The globe hides far-side markers from the tab order and has no keyboard
          rotation, so every pinned album is also listed here. */}
      <section aria-labelledby="globe-albums-heading" className="mt-8">
        <h2
          id="globe-albums-heading"
          className="mb-2.5 font-sans text-eyebrow uppercase text-text-muted"
        >
          {t("map", "albumsOnGlobeHeading")}
          <span className="ml-3">{markers.length}</span>
        </h2>
        <ul className="border-t border-surface-border">
          {markers.map((marker) => (
            <li key={marker.slug}>
              <Link
                href={`/album/${marker.slug}`}
                className="flex min-h-11 items-center justify-between gap-4 border-b border-surface-border/60 py-[7px] font-sans text-[0.8125rem] uppercase tracking-[0.16em] text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{marker.label}</span>
                {locations.get(marker.slug) && (
                  <span className="text-[0.6875rem] text-text-muted">
                    {locations.get(marker.slug)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
