"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";

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
  slideshowEnabled = false,
  slideshowInterval = 4000,
}: LightboxProps) {
  const { t } = useLocale();
  const [isPlaying, setIsPlaying] = useState(slideshowEnabled);
  const [isLoading, setIsLoading] = useState(true);

  const currentPhoto = photos[currentIndex];

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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case " ": // Space bar toggles slideshow
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case "i": // Info - go to photo details
        case "I":
          e.preventDefault();
          window.location.href = `/photo/${photos[currentIndex].id}`;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(goNext, slideshowInterval);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, goNext, slideshowInterval]);

  // Reset loading state when photo changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
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
          onClick={onClose}
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
            setIsPlaying((p) => !p);
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
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-white/50 animate-spin">
              progress_activity
            </span>
          </div>
        )}
        <img
          src={currentPhoto.src.full}
          alt={currentPhoto.title || "Photo"}
          className={`max-w-full max-h-[85vh] object-contain select-none transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
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
