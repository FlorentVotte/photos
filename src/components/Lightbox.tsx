"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import {
  useBodyScrollLock,
  useLightboxKeyboard,
  usePinchZoom,
  useSlideshow,
  useSwipeNavigation,
} from "@/hooks";

interface Photo {
  id: string;
  src: { full: string; medium: string };
  title?: string;
  metadata?: {
    date?: string;
    location?: string;
  };
}

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  slideshowEnabled?: boolean;
  slideshowInterval?: number;
}

export default function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  slideshowInterval = 4000,
}: LightboxProps) {
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];

  // Navigation helpers
  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // Loop back to start
    }
  }, [currentIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1); // Loop to end
    }
  }, [currentIndex, photos.length, onNavigate]);

  // Custom hooks for lightbox functionality
  useBodyScrollLock(isOpen);

  const { isPlaying, togglePlay } = useSlideshow({
    isActive: isOpen,
    interval: slideshowInterval,
    onNext: goNext,
  });

  const {
    scale,
    position,
    isZoomed,
    handleTouchStart: handleZoomTouchStart,
    handleTouchMove,
    handleTouchEnd: handleZoomTouchEnd,
  } = usePinchZoom({
    resetKey: currentIndex,
  });

  const { handleSwipeStart, handleSwipeEnd } = useSwipeNavigation({
    enabled: !isZoomed,
    onNext: goNext,
    onPrev: goPrev,
  });

  const handleViewDetails = useCallback(() => {
    if (photos[currentIndex]) {
      window.location.href = `/photo/${photos[currentIndex].id}`;
    }
  }, [photos, currentIndex]);

  useLightboxKeyboard({
    isActive: isOpen,
    onNext: goNext,
    onPrev: goPrev,
    onClose,
    onToggleSlideshow: togglePlay,
    onViewDetails: handleViewDetails,
  });

  // Combine touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleZoomTouchStart(e);
      handleSwipeStart(e);
    },
    [handleZoomTouchStart, handleSwipeStart]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      handleZoomTouchEnd(e);
      handleSwipeEnd(e);
    },
    [handleZoomTouchEnd, handleSwipeEnd]
  );

  // Reset loading state when photo changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Top right controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* View details link */}
        <Link
          href={`/photo/${currentPhoto.id}`}
          className="p-2 text-white/70 hover:text-white transition-colors"
          aria-label={t("lightbox", "viewDetails")}
          title={t("lightbox", "viewDetails")}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-2xl">info</span>
        </Link>
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 text-white/70 hover:text-white transition-colors"
          aria-label={t("lightbox", "close")}
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>

      {/* Slideshow controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="p-2 text-white/70 hover:text-white transition-colors"
          aria-label={isPlaying ? t("lightbox", "pause") : t("lightbox", "play")}
        >
          <span className="material-symbols-outlined text-2xl">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
        {isPlaying && (
          <span className="text-white/50 text-sm">{t("photo", "slideshow")}</span>
        )}
      </div>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Previous button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label={t("lightbox", "previous")}
      >
        <span className="material-symbols-outlined text-4xl">chevron_left</span>
      </button>

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label={t("lightbox", "next")}
      >
        <span className="material-symbols-outlined text-4xl">chevron_right</span>
      </button>

      {/* Main image */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center touch-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-white/50 animate-spin">
              progress_activity
            </span>
          </div>
        )}
        <img
          ref={imageRef}
          src={currentPhoto.src.full}
          alt={currentPhoto.title || "Photo"}
          className={`max-w-full max-h-[85vh] object-contain select-none transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: "center center",
          }}
          onLoad={() => setIsLoading(false)}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
      </div>

      {/* Photo info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-center">
        {currentPhoto.title && (
          <p className="text-white font-medium mb-1">{currentPhoto.title}</p>
        )}
        <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
          {currentPhoto.metadata?.date && (
            <span>{currentPhoto.metadata.date}</span>
          )}
          {currentPhoto.metadata?.location && currentPhoto.metadata.location !== "Unknown" && (
            <span>{currentPhoto.metadata.location}</span>
          )}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 right-4 z-10 text-white/30 text-xs hidden md:block">
        <span className="mr-4">{t("lightbox", "arrows")}</span>
        <span className="mr-4">{t("lightbox", "space")}</span>
        <span className="mr-4">{t("lightbox", "info")}</span>
        <span>{t("lightbox", "esc")}</span>
      </div>
    </div>
  );
}
