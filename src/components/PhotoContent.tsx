"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedImage from "./ProtectedImage";
import PhotoLocationMap from "./PhotoLocationMap";
import PhotoKeyboardNav from "./PhotoKeyboardNav";
import Lightbox from "./Lightbox";
import { useLocale } from "@/lib/LocaleContext";
import type { Photo, Album } from "@/lib/types";

interface PhotoContentProps {
  photo: Photo;
  album?: Album;
  albumPhotos: Photo[];
  currentIndex: number;
  prevPhoto: Photo | null;
  nextPhoto: Photo | null;
}

export default function PhotoContent({
  photo,
  album,
  albumPhotos,
  currentIndex,
  prevPhoto,
  nextPhoto,
}: PhotoContentProps) {
  const { t } = useLocale();
  const router = useRouter();

  // Share functionality
  const [showCopied, setShowCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(currentIndex);

  const openLightbox = useCallback(() => {
    setLightboxIndex(currentIndex);
    setLightboxOpen(true);
  }, [currentIndex]);

  const handleLightboxNavigate = useCallback((newIndex: number) => {
    setLightboxIndex(newIndex);
    // Update URL without triggering navigation (preserves lightbox state)
    const newPhoto = albumPhotos[newIndex];
    if (newPhoto) {
      window.history.replaceState(null, "", `/photo/${newPhoto.id}`);
    }
  }, [albumPhotos]);

  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
    // If we navigated to a different photo in the lightbox, load that page
    const currentPhoto = albumPhotos[lightboxIndex];
    if (currentPhoto && currentPhoto.id !== photo.id) {
      router.push(`/photo/${currentPhoto.id}`, { scroll: false });
    }
  }, [albumPhotos, lightboxIndex, photo.id, router]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = photo.title;
    const text = photo.caption || `${photo.title} - ${photo.metadata.location}`;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // Clipboard failed silently
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(photo.src.full);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Extract extension from src or default to jpg
      const extension = photo.src.full.split(".").pop()?.split("?")[0] || "jpg";
      link.download = `${photo.title}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Download failed silently
    } finally {
      setIsDownloading(false);
    }
  };

  // Touch/swipe handling for mobile navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // Minimum swipe distance (50px) and ensure horizontal swipe is dominant
      const minSwipeDistance = 50;
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && prevPhoto) {
          // Swipe right - go to previous
          router.push(`/photo/${prevPhoto.id}`, { scroll: false });
        } else if (deltaX < 0 && nextPhoto) {
          // Swipe left - go to next
          router.push(`/photo/${nextPhoto.id}`, { scroll: false });
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [prevPhoto, nextPhoto, router]
  );

  return (
    <>
      <PhotoKeyboardNav
        prevPhotoId={prevPhoto?.id}
        nextPhotoId={nextPhoto?.id}
      />

      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 px-4 md:px-10 lg:px-40">
          <div className="layout-content-container flex flex-col max-w-[1080px] flex-1">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 py-4 mb-2">
              <Link
                href="/"
                className="text-text-muted hover:text-primary transition-colors text-sm font-medium leading-normal"
              >
                {t("nav", "home")}
              </Link>
              <span className="material-symbols-outlined text-text-muted text-[14px]">
                chevron_right
              </span>
              {album && (
                <>
                  <Link
                    href={`/album/${album.slug}`}
                    className="text-text-muted hover:text-primary transition-colors text-sm font-medium leading-normal"
                  >
                    {album.title}
                  </Link>
                  <span className="material-symbols-outlined text-text-muted text-[14px]">
                    chevron_right
                  </span>
                </>
              )}
              <span className="text-foreground text-sm font-medium leading-normal">
                {photo.title}
              </span>
            </div>

            {/* Main Photo Stage */}
            <div
              className="relative group w-full bg-surface-dark rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-surface-border"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Navigation Overlays */}
              {prevPhoto && (
                <Link
                  href={`/photo/${prevPhoto.id}`}
                  scroll={false}
                  className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
                >
                  <div className="size-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-foreground hover:text-black">
                      arrow_back
                    </span>
                  </div>
                </Link>
              )}
              {nextPhoto && (
                <Link
                  href={`/photo/${nextPhoto.id}`}
                  scroll={false}
                  className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
                >
                  <div className="size-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-foreground hover:text-black">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              )}

              {/* The Image - Flickr-style: viewport height based for all aspect ratios */}
              <div
                className="relative w-full h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] flex items-center justify-center bg-background-dark cursor-pointer"
                onClick={openLightbox}
              >
                <ProtectedImage
                  alt={photo.title}
                  className="max-h-full max-w-full object-contain shadow-lg pointer-events-none"
                  src={photo.src.full}
                />
              </div>

              {/* Photo counter */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-foreground text-sm font-medium">
                {currentIndex + 1} / {albumPhotos.length}
              </div>

              {/* Mobile Nav Controls */}
              <div className="md:hidden absolute bottom-4 right-4 flex gap-2">
                {prevPhoto && (
                  <Link
                    href={`/photo/${prevPhoto.id}`}
                    scroll={false}
                    className="size-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-foreground border border-white/10"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </Link>
                )}
                {nextPhoto && (
                  <Link
                    href={`/photo/${nextPhoto.id}`}
                    scroll={false}
                    className="size-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-foreground border border-white/10"
                  >
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="mt-8 pb-20">
              {/* Title and Actions */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-foreground text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] font-display">
                    {photo.title}
                  </h1>
                  {photo.caption && (
                    <p className="text-text-muted text-base mt-3 leading-relaxed max-w-2xl">
                      {photo.caption}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Download button */}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-surface-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t("photo", "download")}
                  >
                    <span className={`material-symbols-outlined text-lg ${isDownloading ? "animate-spin" : ""}`}>
                      {isDownloading ? "progress_activity" : "download"}
                    </span>
                    <span className="hidden sm:inline">{t("photo", "download")}</span>
                  </button>
                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="relative flex items-center gap-2 px-4 py-2 bg-surface-dark border border-surface-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-colors text-sm font-medium"
                    aria-label={t("photo", "share")}
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                    <span className="hidden sm:inline">{t("photo", "share")}</span>
                    {/* Copied tooltip */}
                    {showCopied && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-black text-xs font-medium rounded-full whitespace-nowrap">
                        {t("photo", "linkCopied")}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={openLightbox}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-surface-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">slideshow</span>
                    <span className="text-sm font-medium">{t("photo", "slideshow")}</span>
                  </button>
                </div>
              </div>

              {/* Info Grid - Map and Metadata side by side on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Location Map or Location Info */}
                <div className="bg-surface-dark rounded-xl p-5 border border-surface-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-9 rounded-full bg-surface-border flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">location_on</span>
                    </div>
                    <div>
                      <h3 className="text-foreground text-sm font-semibold">
                        {photo.metadata.city
                          ? `${photo.metadata.city}, ${photo.metadata.location}`
                          : photo.metadata.location}
                      </h3>
                      <p className="text-text-muted text-xs">{photo.metadata.date}</p>
                    </div>
                  </div>

                  {photo.metadata.latitude && photo.metadata.longitude ? (
                    <PhotoLocationMap
                      latitude={photo.metadata.latitude}
                      longitude={photo.metadata.longitude}
                      title={photo.title}
                    />
                  ) : (
                    <div className="h-[200px] bg-background-dark rounded-lg flex items-center justify-center">
                      <span className="text-text-muted text-sm">{t("photo", "noGpsData")}</span>
                    </div>
                  )}
                </div>

                {/* Right: EXIF Data */}
                <div className="bg-surface-dark rounded-xl p-5 border border-surface-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-9 rounded-full bg-surface-border flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">camera</span>
                    </div>
                    <div>
                      <h3 className="text-foreground text-sm font-semibold">
                        {photo.metadata.camera || t("photo", "camera")}
                      </h3>
                      <p className="text-text-muted text-xs">{photo.metadata.lens || t("photo", "unknownLens")}</p>
                    </div>
                  </div>

                  {/* EXIF Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {photo.metadata.aperture && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-lg">
                        <span className="material-symbols-outlined text-2xl text-primary">camera</span>
                        <span className="text-foreground font-semibold">{photo.metadata.aperture}</span>
                        <span className="text-text-muted text-xs uppercase tracking-wide">{t("photo", "aperture")}</span>
                      </div>
                    )}
                    {photo.metadata.shutterSpeed && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-lg">
                        <span className="material-symbols-outlined text-2xl text-primary">timer</span>
                        <span className="text-foreground font-semibold">{photo.metadata.shutterSpeed}</span>
                        <span className="text-text-muted text-xs uppercase tracking-wide">{t("photo", "shutter")}</span>
                      </div>
                    )}
                    {photo.metadata.iso && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-lg">
                        <span className="material-symbols-outlined text-2xl text-primary">iso</span>
                        <span className="text-foreground font-semibold">{photo.metadata.iso}</span>
                        <span className="text-text-muted text-xs uppercase tracking-wide">{t("photo", "iso")}</span>
                      </div>
                    )}
                    {photo.metadata.focalLength && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-lg">
                        <span className="material-symbols-outlined text-2xl text-primary">straighten</span>
                        <span className="text-foreground font-semibold">{photo.metadata.focalLength}</span>
                        <span className="text-text-muted text-xs uppercase tracking-wide">{t("photo", "focal")}</span>
                      </div>
                    )}
                    {photo.metadata.width && photo.metadata.height && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-lg">
                        <span className="material-symbols-outlined text-2xl text-primary">aspect_ratio</span>
                        <span className="text-foreground font-semibold">
                          {photo.metadata.width} × {photo.metadata.height}
                        </span>
                        <span className="text-text-muted text-xs uppercase tracking-wide">{t("photo", "resolution")}</span>
                      </div>
                    )}
                  </div>

                  {/* Back to Album */}
                  {album && (
                    <div className="mt-5 pt-4 border-t border-surface-border">
                      <Link
                        href={`/album/${album.slug}`}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-base">
                          arrow_back
                        </span>
                        {t("photo", "backTo")} {album.title}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        photos={albumPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={handleLightboxClose}
        onNavigate={handleLightboxNavigate}
      />
    </>
  );
}
