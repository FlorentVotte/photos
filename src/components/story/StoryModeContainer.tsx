"use client";

import { useState, useRef, useCallback, useMemo, createRef, RefObject } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { t } from "@/lib/translations";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import type { Album, Chapter, Photo } from "@/lib/types";
import StoryMap from "./StoryMap";
import StoryChapter from "./StoryChapter";
import Lightbox from "@/components/Lightbox";

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

  // Create refs for each chapter
  const chapterRefs = useMemo(() => {
    return chapters.map(() => createRef<HTMLDivElement>());
  }, [chapters.length]);

  // Track active chapter via scroll spy
  const activeChapterIndex = useScrollSpy(chapterRefs);

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

  // Handle photo click - open lightbox with chapter photos
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
    <div className="relative min-h-screen">
      {/* Full-screen map background */}
      {hasAnyGpsData && (
        <StoryMap chapters={chapters} activeChapterIndex={activeChapterIndex} />
      )}

      {/* Fallback background when no GPS data */}
      {!hasAnyGpsData && (
        <div className="fixed inset-0 bg-gradient-to-b from-background-dark to-surface-dark z-0" />
      )}

      {/* Exit button */}
      <button
        onClick={onExitStoryMode}
        className="fixed top-4 right-4 z-50 bg-surface-dark/80 backdrop-blur-sm border border-surface-border rounded-full px-4 py-2 flex items-center gap-2 text-sm text-foreground hover:bg-surface-dark transition-colors"
      >
        <span className="material-symbols-outlined text-base">grid_view</span>
        {t("story", "switchToGallery", locale)}
      </button>

      {/* Album title header */}
      <div className="relative z-10 pt-24 pb-8 px-4 md:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-lg">
          {album.title}
        </h1>
        {album.subtitle && (
          <p className="mt-2 text-lg text-text-muted drop-shadow">{album.subtitle}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-text-muted animate-bounce">
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
          <span className="text-sm">{t("story", "scrollToExplore", locale)}</span>
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </div>
      </div>

      {/* Chapter cards overlay */}
      <div className="relative z-10 pointer-events-none">
        {chapters.map((chapter, index) => (
          <div key={chapter.id} className="pointer-events-auto">
            <StoryChapter
              ref={chapterRefs[index]}
              chapter={chapter}
              index={index}
              isActive={index === activeChapterIndex}
              alignment={index % 2 === 0 ? "left" : "right"}
              onPhotoClick={handlePhotoClick}
            />
          </div>
        ))}
      </div>

      {/* End spacer */}
      <div className="h-[50vh]" />

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
