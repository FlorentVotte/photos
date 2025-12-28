"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Chapter, Photo } from "@/lib/types";
import type * as LeafletTypes from "leaflet";

interface StoryMapProps {
  chapters: Chapter[];
  activeChapterIndex: number;
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
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

// Component to handle map animations
const MapAnimator = dynamic(() => import("./MapAnimator"), { ssr: false });

interface ChapterLocation {
  center: [number, number];
  zoom: number;
  hasGps: boolean;
}

function getChapterLocation(chapter: Chapter): ChapterLocation | null {
  const geoPhotos = chapter.photos.filter(
    (p) => p.metadata.latitude && p.metadata.longitude
  );

  if (geoPhotos.length === 0) {
    return null;
  }

  const lats = geoPhotos.map((p) => p.metadata.latitude!);
  const lngs = geoPhotos.map((p) => p.metadata.longitude!);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculate zoom based on bounding box size
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  let zoom = 12;
  if (maxDiff > 10) zoom = 4;
  else if (maxDiff > 5) zoom = 5;
  else if (maxDiff > 2) zoom = 6;
  else if (maxDiff > 1) zoom = 7;
  else if (maxDiff > 0.5) zoom = 8;
  else if (maxDiff > 0.2) zoom = 9;
  else if (maxDiff > 0.1) zoom = 10;
  else if (maxDiff > 0.05) zoom = 11;

  return {
    center: [centerLat, centerLng],
    zoom,
    hasGps: true,
  };
}

export default function StoryMap({ chapters, activeChapterIndex }: StoryMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof LeafletTypes | null>(null);

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Calculate all chapter locations
  const chapterLocations = useMemo(() => {
    return chapters.map((chapter) => getChapterLocation(chapter));
  }, [chapters]);

  // Get route coordinates from all photos across all chapters
  const routeCoordinates = useMemo(() => {
    const allPhotos = chapters.flatMap((c) => c.photos);
    return allPhotos
      .filter((p) => p.metadata.latitude && p.metadata.longitude)
      .sort((a, b) => (a.metadata.date || "").localeCompare(b.metadata.date || ""))
      .map((p) => [p.metadata.latitude!, p.metadata.longitude!] as [number, number]);
  }, [chapters]);

  // Calculate initial bounds to fit all locations
  const initialCenter = useMemo(() => {
    const validLocations = chapterLocations.filter(
      (loc): loc is ChapterLocation => loc !== null
    );
    if (validLocations.length === 0) {
      return { center: [48.8566, 2.3522] as [number, number], zoom: 4 }; // Default to Paris
    }

    const lats = validLocations.map((loc) => loc.center[0]);
    const lngs = validLocations.map((loc) => loc.center[1]);

    return {
      center: [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ] as [number, number],
      zoom: 5,
    };
  }, [chapterLocations]);

  // Get current target location
  const currentLocation = chapterLocations[activeChapterIndex];

  if (!isClient || !L) {
    return (
      <div className="fixed inset-0 bg-background-dark flex items-center justify-center z-0">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  // Create chapter marker icon
  const createChapterIcon = (index: number, isActive: boolean) => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div class="w-8 h-8 ${isActive ? "bg-primary scale-125" : "bg-white/80"} rounded-full border-2 ${isActive ? "border-white" : "border-primary"} shadow-lg flex items-center justify-center transition-all duration-300">
        <span class="text-sm font-bold ${isActive ? "text-black" : "text-primary"}">${index + 1}</span>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
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
        .story-map .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
        .story-map .leaflet-control-zoom a {
          background: rgba(26, 46, 34, 0.9) !important;
          color: white !important;
          border: none !important;
        }
        .story-map .leaflet-control-zoom a:hover {
          background: rgba(37, 70, 51, 0.95) !important;
        }
      `}</style>
      <div className="fixed inset-0 z-0">
        <MapContainer
          center={initialCenter.center}
          zoom={initialCenter.zoom}
          className="w-full h-full story-map"
          zoomControl={true}
          scrollWheelZoom={true}
          dragging={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Route polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#1dc964",
                weight: 2,
                opacity: 0.5,
                dashArray: "8, 8",
              }}
            />
          )}

          {/* Chapter markers */}
          {chapterLocations.map(
            (location, index) =>
              location && (
                <Marker
                  key={chapters[index].id}
                  position={location.center}
                  icon={createChapterIcon(index, index === activeChapterIndex)}
                />
              )
          )}

          {/* Map animator - handles flyTo animations */}
          <MapAnimator target={currentLocation} />
        </MapContainer>
      </div>
    </>
  );
}
