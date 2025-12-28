"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/lib/LocaleContext";
import { t } from "@/lib/translations";
import type { Album, Chapter, Photo } from "@/lib/types";
import StoryChapter from "./StoryChapter";
import Lightbox from "@/components/Lightbox";
import ProtectedImage from "@/components/ProtectedImage";

// Lazy load the map component
const StoryMap = dynamic(() => import("./StoryMap"), {
  loading: () => null,
  ssr: false,
});

interface StoryModeContainerProps {
  album: Album;
  chapters: Chapter[];
  onExitStoryMode: () => void;
}

export default function StoryModeContainer({
  album,
  chapters,
  onExitStoryMode,
}: StoryModeContainerProps) {
  const { locale } = useLocale();

  // Map visibility state
  const [showMap, setShowMap] = useState(false);

  // Lightbox state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    photos: Photo[];
    currentIndex: number;
  }>({
    isOpen: false,
    photos: [],
    currentIndex: 0,
  });

  // Handle photo click - open lightbox at specific photo
  const handlePhotoClick = useCallback(
    (chapterIndex: number, photoIndex: number) => {
      const chapter = chapters[chapterIndex];
      setLightboxState({
        isOpen: true,
        photos: chapter.photos,
        currentIndex: photoIndex,
      });
    },
    [chapters]
  );

  // Handle "View All Photos" - open lightbox at first photo
  const handleViewAllPhotos = useCallback(
    (chapterIndex: number) => {
      const chapter = chapters[chapterIndex];
      setLightboxState({
        isOpen: true,
        photos: chapter.photos,
        currentIndex: 0,
      });
    },
    [chapters]
  );

  // Handle lightbox close
  const handleLightboxClose = useCallback(() => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Handle lightbox navigation
  const handleLightboxNavigate = useCallback((index: number) => {
    setLightboxState((prev) => ({ ...prev, currentIndex: index }));
  }, []);

  // Check if any chapter has GPS data
  const hasAnyGpsData = useMemo(() => {
    return chapters.some((chapter) =>
      chapter.photos.some((p) => p.metadata.latitude && p.metadata.longitude)
    );
  }, [chapters]);

  return (
    <div className="relative min-h-screen bg-background-dark">
      {/* Fixed Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-surface-border">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          {/* Album title */}
          <h1 className="text-lg font-bold text-foreground truncate">
            {album.title}
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Map toggle */}
            {hasAnyGpsData && (
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                  showMap
                    ? "bg-primary text-black"
                    : "bg-surface-dark border border-surface-border text-foreground hover:border-primary/50"
                }`}
              >
                <span className="material-symbols-outlined text-base">map</span>
                <span className="hidden sm:inline">{t("nav", "map", locale)}</span>
              </button>
            )}

            {/* Exit button */}
            <button
              onClick={onExitStoryMode}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface-dark border border-surface-border rounded-full text-sm text-foreground hover:border-primary/50 transition-all"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
              <span className="hidden sm:inline">{t("story", "galleryMode", locale)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Overlay (when visible) */}
      {showMap && hasAnyGpsData && (
        <div className="fixed inset-0 z-40 bg-background-dark">
          <StoryMap chapters={chapters} activeChapterIndex={0} />
          <button
            onClick={() => setShowMap(false)}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-surface-dark/90 backdrop-blur-sm border border-surface-border rounded-full text-foreground hover:border-primary/50 transition-all"
          >
            <span className="material-symbols-outlined text-base">close</span>
            {t("lightbox", "close", locale)}
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative w-full h-screen">
        <ProtectedImage
          src={album.coverImage}
          alt={album.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-black/30" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="inline-block px-4 py-1 mb-6 text-xs font-medium tracking-widest uppercase bg-primary/20 text-primary rounded-full backdrop-blur-sm border border-primary/30">
            {t("album", "travelDiary", locale)}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 drop-shadow-2xl">
            {album.title}
          </h1>
          {album.subtitle && (
            <p className="text-xl md:text-2xl text-foreground/80 mb-6 max-w-2xl">
              {album.subtitle}
            </p>
          )}
          <p className="text-lg text-foreground/60">
            {album.date} • {album.location}
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 flex flex-col items-center gap-2 text-foreground/50 animate-bounce">
            <span className="text-sm">{t("story", "scrollToExplore", locale)}</span>
            <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
          </div>
        </div>
      </div>

      {/* Album Description */}
      {album.description && (
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-20 md:py-28 text-center">
          <span className="material-symbols-outlined text-primary/40 text-5xl mb-6">
            format_quote
          </span>
          <p className="text-2xl md:text-3xl text-gray-200 leading-relaxed font-light italic">
            {album.description}
          </p>
        </div>
      )}

      {/* Chapters */}
      <div className="relative">
        {chapters.map((chapter, index) => (
          <StoryChapter
            key={chapter.id}
            chapter={chapter}
            index={index}
            totalChapters={chapters.length}
            onPhotoClick={handlePhotoClick}
            onViewAllPhotos={handleViewAllPhotos}
          />
        ))}
      </div>

      {/* End Section */}
      <div className="py-20 md:py-32 text-center px-6">
        <div className="max-w-xl mx-auto">
          <span className="material-symbols-outlined text-primary text-4xl mb-6">
            auto_awesome
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {album.title}
          </h3>
          <p className="text-text-muted mb-8">
            {chapters.reduce((acc, c) => acc + c.photos.length, 0)} photos •{" "}
            {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
          </p>
          <button
            onClick={onExitStoryMode}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">grid_view</span>
            {t("story", "switchToGallery", locale)}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxState.isOpen && (
        <Lightbox
          photos={lightboxState.photos.map((p) => ({
            id: p.id,
            src: { full: p.src.full, medium: p.src.medium },
            title: p.title,
            metadata: {
              date: p.metadata.date,
              location: p.metadata.city || p.metadata.location,
            },
          }))}
          currentIndex={lightboxState.currentIndex}
          isOpen={lightboxState.isOpen}
          onClose={handleLightboxClose}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
}
