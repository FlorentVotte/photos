"use client";

import dynamic from "next/dynamic";
import { useLocale } from "@/lib/LocaleContext";
import type { Photo } from "@/lib/types";

// Lazy load the map component to reduce initial bundle size (~80KB for Leaflet)
const PhotoMap = dynamic(() => import("./PhotoMap"), {
  loading: () => (
    <div className="w-full h-[600px] bg-surface-dark rounded-xl flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl text-text-muted animate-pulse mb-2 block">
          map
        </span>
        <p className="text-text-muted">Loading map...</p>
      </div>
    </div>
  ),
  ssr: false, // Maps require client-side rendering
});

interface MapContentProps {
  photos: Photo[];
}

export default function MapContent({ photos }: MapContentProps) {
  const { t } = useLocale();

  return (
    <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("map", "title")}</h1>
          <p className="text-text-muted">{t("map", "subtitle")}</p>
        </div>

        <PhotoMap photos={photos} />
      </div>
    </main>
  );
}
