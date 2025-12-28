"use client";

import { forwardRef } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { t } from "@/lib/translations";
import type { Chapter } from "@/lib/types";
import StoryPhotoGrid from "./StoryPhotoGrid";

interface StoryChapterProps {
  chapter: Chapter;
  index: number;
  isActive: boolean;
  alignment: "left" | "right";
  onPhotoClick: (chapterIndex: number, photoIndex: number) => void;
}

const StoryChapter = forwardRef<HTMLDivElement, StoryChapterProps>(
  ({ chapter, index, isActive, alignment, onPhotoClick }, ref) => {
    const { locale } = useLocale();

    // Get localized content
    const title = locale === "fr" && chapter.titleFr ? chapter.titleFr : chapter.title;
    const narrative =
      locale === "fr" && chapter.narrativeFr ? chapter.narrativeFr : chapter.narrative;

    // Get location from first photo with GPS
    const locationPhoto = chapter.photos.find(
      (p) => p.metadata.city || p.metadata.location
    );
    const location = locationPhoto?.metadata.city || locationPhoto?.metadata.location;

    // Check if chapter has GPS data
    const hasGpsData = chapter.photos.some(
      (p) => p.metadata.latitude && p.metadata.longitude
    );

    return (
      <div
        ref={ref}
        className={`min-h-[80vh] flex items-center py-16 px-4 md:px-8 ${
          alignment === "left" ? "justify-start" : "justify-end"
        }`}
      >
        <div
          className={`w-full max-w-md transition-all duration-500 ${
            isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-4"
          }`}
        >
          {/* Chapter card with glassmorphism */}
          <div className="bg-surface-dark/85 backdrop-blur-xl border border-surface-border rounded-2xl p-6 shadow-2xl">
            {/* Chapter number badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {t("story", "chapter", locale)} {index + 1}
              </span>
              {!hasGpsData && (
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_off</span>
                  {t("story", "noLocationData", locale)}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>

            {/* Location badge */}
            {location && (
              <div className="flex items-center gap-1 text-sm text-text-muted mb-4">
                <span className="material-symbols-outlined text-base text-primary">
                  location_on
                </span>
                {location}
              </div>
            )}

            {/* Narrative */}
            {narrative && (
              <p className="text-text-muted leading-relaxed text-sm">{narrative}</p>
            )}

            {/* Photo grid */}
            <StoryPhotoGrid
              photos={chapter.photos}
              maxPhotos={4}
              onPhotoClick={(photoIndex) => onPhotoClick(index, photoIndex)}
            />
          </div>
        </div>
      </div>
    );
  }
);

StoryChapter.displayName = "StoryChapter";

export default StoryChapter;
