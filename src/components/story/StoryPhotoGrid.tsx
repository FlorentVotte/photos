"use client";

import { useLocale } from "@/lib/LocaleContext";
import { t } from "@/lib/translations";
import type { Photo } from "@/lib/types";
import ProtectedImage from "@/components/ProtectedImage";

interface StoryPhotoGridProps {
  photos: Photo[];
  maxPhotos?: number;
  onPhotoClick: (index: number) => void;
}

export default function StoryPhotoGrid({
  photos,
  maxPhotos = 4,
  onPhotoClick,
}: StoryPhotoGridProps) {
  const { locale } = useLocale();
  const displayPhotos = photos.slice(0, maxPhotos);
  const remainingCount = photos.length - maxPhotos;

  if (photos.length === 0) return null;

  return (
    <div className="mt-4">
      <div
        className={`grid gap-2 ${
          displayPhotos.length === 1
            ? "grid-cols-1"
            : displayPhotos.length === 2
              ? "grid-cols-2"
              : "grid-cols-2"
        }`}
      >
        {displayPhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => onPhotoClick(index)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ProtectedImage
              src={photo.src.thumb}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {remainingCount > 0 && (
        <button
          onClick={() => onPhotoClick(0)}
          className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">photo_library</span>
          {t("story", "viewAllPhotos", locale)} (+{remainingCount}{" "}
          {t("story", "morePhotos", locale)})
        </button>
      )}
    </div>
  );
}
