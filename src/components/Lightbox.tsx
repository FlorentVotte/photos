"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import {
  useBodyScrollLock,
  useLightboxKeyboard,
  usePinchZoom,
  usePresence,
  useSlideshow,
  useSwipeNavigation,
} from "@/hooks";

/** Must cover the longest exit transition below. */
const EXIT_DURATION_MS = 200;

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

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  }, [currentIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1);
    }
  }, [currentIndex, photos.length, onNavigate]);

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
    shouldAnimate,
    transformOrigin,
    handleTouchStart: handleZoomTouchStart,
    handleTouchMove: handleZoomTouchMove,
    handleTouchEnd: handleZoomTouchEnd,
  } = usePinchZoom({ resetKey: currentIndex });

  const {
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
    dragOffset,
    shouldAnimateOffset,
  } = useSwipeNavigation({
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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleZoomTouchStart(e);
      handleSwipeStart(e);
    },
    [handleZoomTouchStart, handleSwipeStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleZoomTouchMove(e);
      handleSwipeMove(e);
    },
    [handleZoomTouchMove, handleSwipeMove]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      handleZoomTouchEnd(e);
      handleSwipeEnd(e);
    },
    [handleZoomTouchEnd, handleSwipeEnd]
  );

  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Stays mounted through the exit animation; `isVisible` drives the state.
  const { shouldRender, isVisible } = usePresence(isOpen, EXIT_DURATION_MS);

  if (!shouldRender || !currentPhoto) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] bg-black/97 flex items-center justify-center transition-opacity motion-reduce:duration-100 ${
        isVisible
          ? "opacity-100 duration-200 ease-out"
          : "opacity-0 duration-150 ease-in"
      }`}
      onClick={onClose}
    >
      {/* Top controls */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="font-sans text-[12px] uppercase tracking-[0.32em] text-white/60 hover:text-white transition-colors"
          aria-label={isPlaying ? t("lightbox", "pause") : t("lightbox", "play")}
        >
          {isPlaying ? "❚❚ " : "▶ "}
          {isPlaying ? t("lightbox", "pause") : t("photo", "slideshow")}
        </button>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 font-sans text-[12px] uppercase tracking-[0.32em] text-white/60 tabular-nums">
        {String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
      </div>

      <div className="absolute top-6 right-6 z-10 flex items-center gap-5">
        <Link
          href={`/photo/${currentPhoto.id}`}
          className="font-sans text-[12px] uppercase tracking-[0.32em] text-white/60 hover:text-white transition-colors"
          aria-label={t("lightbox", "viewDetails")}
          onClick={(e) => e.stopPropagation()}
        >
          {t("lightbox", "viewDetails")}
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="font-sans text-[12px] uppercase tracking-[0.32em] text-white/60 hover:text-white transition-colors"
          aria-label={t("lightbox", "close")}
        >
          {t("lightbox", "close")}
        </button>
      </div>

      {/* Nav controls — minimal chevrons */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/40 hover:text-white transition-colors text-3xl font-thin"
        aria-label={t("lightbox", "previous")}
      >
        ←
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 text-white/40 hover:text-white transition-colors text-3xl font-thin"
        aria-label={t("lightbox", "next")}
      >
        →
      </button>

      {/* Image */}
      <div
        className="motion-aware relative max-w-[92vw] max-h-[85vh] flex items-center justify-center touch-none"
        style={{
          // Enter/exit scale and the live drag offset share one transform.
          // Transitions are off while a finger is down so the photo tracks
          // it 1:1, and off for the post-commit reset.
          transform: `translateX(${dragOffset}px) scale(${isVisible ? 1 : 0.97})`,
          transition: shouldAnimateOffset
            ? `transform ${isVisible ? 300 : 150}ms var(--ease-settle)`
            : "none",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <p className="absolute inset-0 flex items-center justify-center font-sans text-[12px] uppercase tracking-[0.32em] text-white/40 animate-pulse">
            Loading
          </p>
        )}
        <img
          ref={imageRef}
          src={currentPhoto.src.full}
          alt={currentPhoto.title || "Photo"}
          className={`motion-aware max-w-full max-h-[85vh] object-contain select-none ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin,
            // Opacity always animates (the load crossfade). Transform only
            // when no finger is driving it — a transition mid-pinch lags.
            transition: shouldAnimate
              ? "opacity 300ms ease-out, transform 250ms var(--ease-out-soft)"
              : "opacity 300ms ease-out",
          }}
          onLoad={() => setIsLoading(false)}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
      </div>

      {/* Photo caption */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center">
        {currentPhoto.title && (
          <p className="font-display text-base text-white mb-1">
            {currentPhoto.title}
          </p>
        )}
        {(currentPhoto.metadata?.date ||
          (currentPhoto.metadata?.location &&
            currentPhoto.metadata.location !== "Unknown")) && (
          <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-white/50">
            {currentPhoto.metadata?.date}
            {currentPhoto.metadata?.date &&
              currentPhoto.metadata?.location &&
              currentPhoto.metadata.location !== "Unknown" && (
                <span className="mx-3 text-white/30">·</span>
              )}
            {currentPhoto.metadata?.location !== "Unknown" &&
              currentPhoto.metadata?.location}
          </p>
        )}
      </div>
    </div>
  );
}
