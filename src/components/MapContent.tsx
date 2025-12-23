"use client";

import PhotoMap from "./PhotoMap";
import { useLocale } from "@/lib/LocaleContext";
import type { Photo } from "@/lib/types";

interface MapContentProps {
  photos: Photo[];
}

export default function MapContent({ photos }: MapContentProps) {
  const { t } = useLocale();

  return (
    <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t("map", "title")}</h1>
          <p className="text-text-muted">{t("map", "subtitle")}</p>
        </div>

        <PhotoMap photos={photos} />
      </div>
    </main>
  );
}
