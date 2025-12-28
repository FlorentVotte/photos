"use client";

import { forwardRef } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { t } from "@/lib/translations";
import type { Chapter } from "@/lib/types";
import ProtectedImage from "@/components/ProtectedImage";

interface StoryChapterProps {
  chapter: Chapter;
  index: number;
  totalChapters: number;
  onPhotoClick: (chapterIndex: number, photoIndex: number) => void;
  onViewAllPhotos: (chapterIndex: number) => void;
}

const StoryChapter = forwardRef<HTMLDivElement, StoryChapterProps>(
  ({ chapter, index, totalChapters, onPhotoClick, onViewAllPhotos }, ref) => {
    const { locale } = useLocale();

    // Get localized content
    const title = locale === "fr" && chapter.titleFr ? chapter.titleFr : chapter.title;
    const narrative =
      locale === "fr" && chapter.narrativeFr ? chapter.narrativeFr : chapter.narrative;

    // Get location from first photo with location data
    const locationPhoto = chapter.photos.find(
      (p) => p.metadata.city || p.metadata.location
    );
    const location = locationPhoto?.metadata.city || locationPhoto?.metadata.location;

    // Select photos for the magazine layout
    const coverPhoto = chapter.coverPhoto || chapter.photos[0];
    const featuredPhotos = chapter.photos.slice(0, 5); // Show up to 5 photos in magazine layout
    const remainingCount = Math.max(0, chapter.photos.length - 5);

    return (
      <article ref={ref} className="w-full">
        {/* Chapter Cover - Full Bleed */}
        {coverPhoto && (
          <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
            <ProtectedImage
              src={coverPhoto.src.full}
              alt={coverPhoto.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />

            {/* Chapter info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
              <div className="max-w-4xl">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-widest uppercase bg-primary/20 text-primary rounded-full backdrop-blur-sm border border-primary/30">
                  {t("story", "chapter", locale)} {index + 1} / {totalChapters}
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 drop-shadow-lg">
                  {title}
                </h2>
                {location && (
                  <div className="flex items-center gap-2 text-lg text-foreground/80">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    {location}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Narrative Section */}
        {narrative && (
          <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed first-letter:text-6xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-none">
              {narrative}
            </p>
          </div>
        )}

        {/* Photo Gallery - Magazine Style */}
        <div className="space-y-1">
          {featuredPhotos.slice(1).map((photo, photoIndex) => (
            <div
              key={photo.id}
              className="relative w-full cursor-pointer group"
              onClick={() => onPhotoClick(index, photoIndex + 1)}
            >
              {/* Alternating layouts for visual variety */}
              {photoIndex % 3 === 0 ? (
                // Full bleed
                <div className="relative w-full h-[60vh] md:h-[80vh]">
                  <ProtectedImage
                    src={photo.src.full}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : photoIndex % 3 === 1 ? (
                // Centered with padding
                <div className="max-w-5xl mx-auto px-4 py-8">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg shadow-2xl">
                    <ProtectedImage
                      src={photo.src.full}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {photo.title && photo.title !== photo.id && (
                    <p className="mt-4 text-center text-text-muted text-sm italic">
                      {photo.title}
                    </p>
                  )}
                </div>
              ) : (
                // Full bleed with caption overlay
                <div className="relative w-full h-[50vh] md:h-[70vh]">
                  <ProtectedImage
                    src={photo.src.full}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                  {photo.metadata.city && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded text-sm text-foreground/80">
                      {photo.metadata.city}
                    </div>
                  )}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* View All Photos Button */}
        {chapter.photos.length > 1 && (
          <div className="flex justify-center py-12">
            <button
              onClick={() => onViewAllPhotos(index)}
              className="flex items-center gap-3 px-6 py-3 bg-surface-dark border border-surface-border rounded-full text-foreground hover:border-primary/50 hover:bg-surface-dark/80 transition-all group"
            >
              <span className="material-symbols-outlined text-primary">photo_library</span>
              <span>
                {t("story", "viewAllPhotos", locale)}
                <span className="text-text-muted ml-2">({chapter.photos.length})</span>
              </span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        )}

        {/* Chapter Divider */}
        {index < totalChapters - 1 && (
          <div className="flex items-center justify-center py-16">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        )}
      </article>
    );
  }
);

StoryChapter.displayName = "StoryChapter";

export default StoryChapter;
