"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Photo } from "@/lib/types";
import { useLocale } from "@/lib/LocaleContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { formatMagazineDate } from "@/lib/magazine-utils";

interface FullScreenSlideshowProps {
  photos: Photo[];
  startIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const SLIDESHOW_INTERVAL = 5000; // 5 seconds
const UI_HIDE_DELAY = 3000; // Hide UI after 3 seconds of inactivity

export default function FullScreenSlideshow({
  photos,
  startIndex,
  isOpen,
  onClose,
}: FullScreenSlideshowProps) {
  const { locale, t } = useLocale();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [showInfo, setShowInfo] = useState(true);
  const [showUI, setShowUI] = useState(true);
  const hideUITimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useBodyScrollLock(isOpen);

  // Reset index when opening with a new start index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
      setShowUI(true);
    }
  }, [isOpen, startIndex]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Slideshow auto-advance
  const { isPlaying, togglePlay } = useSlideshow({
    isActive: isOpen,
    interval: SLIDESHOW_INTERVAL,
    onNext: goToNext,
  });

  // Swipe navigation
  const { handleSwipeStart, handleSwipeEnd } = useSwipeNavigation({
    enabled: isOpen,
    onNext: goToNext,
    onPrev: goToPrev,
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          goToNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goToPrev();
          break;
        case " ": // Space
          e.preventDefault();
          togglePlay();
          break;
        case "i":
        case "I":
          e.preventDefault();
          setShowInfo((prev) => !prev);
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNext, goToPrev, togglePlay, onClose]);

  // Auto-hide UI on inactivity
  const resetHideTimer = useCallback(() => {
    setShowUI(true);
    if (hideUITimerRef.current) {
      clearTimeout(hideUITimerRef.current);
    }
    hideUITimerRef.current = setTimeout(() => {
      if (!isPlaying) {
        setShowUI(false);
      }
    }, UI_HIDE_DELAY);
  }, [isPlaying]);

  useEffect(() => {
    if (isOpen) {
      resetHideTimer();
    }
    return () => {
      if (hideUITimerRef.current) {
        clearTimeout(hideUITimerRef.current);
      }
    };
  }, [isOpen, resetHideTimer]);

  // Show UI when playing state changes
  useEffect(() => {
    if (isPlaying) {
      setShowUI(true);
    }
  }, [isPlaying]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const displayDate = formatMagazineDate(currentPhoto.metadata.date, locale);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={resetHideTimer}
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className={`
          absolute top-4 right-4 z-10 p-2 rounded-full
          bg-black/50 text-white hover:bg-black/70
          transition-all duration-300
          ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-label={t("magazine", "exitSlideshow")}
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      {/* Photo counter */}
      <div
        className={`
          absolute top-4 left-4 z-10 px-3 py-1 rounded-full
          bg-black/50 text-white text-sm
          transition-all duration-300
          ${showUI ? "opacity-100" : "opacity-0"}
        `}
      >
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        <img
          src={currentPhoto.src.full}
          alt={currentPhoto.title || currentPhoto.caption || ""}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrev}
        className={`
          absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full
          bg-black/50 text-white hover:bg-black/70
          transition-all duration-300
          ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-label={t("lightbox", "previous")}
      >
        <span className="material-symbols-outlined text-3xl">
          chevron_left
        </span>
      </button>
      <button
        onClick={goToNext}
        className={`
          absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full
          bg-black/50 text-white hover:bg-black/70
          transition-all duration-300
          ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-label={t("lightbox", "next")}
      >
        <span className="material-symbols-outlined text-3xl">
          chevron_right
        </span>
      </button>

      {/* Bottom info panel */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 z-10
          bg-gradient-to-t from-black/80 to-transparent
          pt-16 pb-6 px-6
          transition-all duration-300
          ${showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        {/* Photo info */}
        {showInfo && (
          <div className="max-w-2xl mx-auto text-center text-white mb-4">
            {displayDate && (
              <div className="text-sm text-white/70 mb-1">{displayDate}</div>
            )}
            {currentPhoto.metadata.city && (
              <div className="flex items-center justify-center gap-1 text-sm text-white/70 mb-2">
                <span className="material-symbols-outlined text-base">
                  location_on
                </span>
                {currentPhoto.metadata.city}
                {currentPhoto.metadata.location &&
                  `, ${currentPhoto.metadata.location}`}
              </div>
            )}
            {(currentPhoto.caption || currentPhoto.title) && (
              <p className="text-lg italic">
                &ldquo;{currentPhoto.caption || currentPhoto.title}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label={isPlaying ? t("magazine", "pause") : t("magazine", "autoPlay")}
          >
            <span className="material-symbols-outlined">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          {/* Info toggle button */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className={`
              p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors
              ${showInfo ? "bg-white/20" : ""}
            `}
            aria-label={showInfo ? t("magazine", "hideInfo") : t("magazine", "showInfo")}
          >
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>

        {/* Progress dots */}
        {photos.length <= 20 && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${
                    index === currentIndex
                      ? "bg-white scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  }
                `}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress bar for many photos */}
        {photos.length > 20 && (
          <div className="max-w-md mx-auto mt-4">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / photos.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div
        className={`
          absolute bottom-4 right-4 z-10 text-white/50 text-xs
          transition-all duration-300
          ${showUI ? "opacity-100" : "opacity-0"}
        `}
      >
        <span className="hidden md:inline">
          ← → navigate • Space play/pause • I info • Esc close
        </span>
      </div>
    </div>
  );
}
