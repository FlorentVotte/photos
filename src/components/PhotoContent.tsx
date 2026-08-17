"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedImage from "./ProtectedImage";
import PhotoLocationMap from "./PhotoLocationMap";
import PhotoKeyboardNav from "./PhotoKeyboardNav";
import Lightbox from "./Lightbox";
import { useLocale } from "@/lib/LocaleContext";
import { usePresence } from "@/hooks";
import { formatPhotoTitle } from "@/lib/photo-display";
import type { Photo, Album } from "@/lib/types";

interface PhotoContentProps {
  photo: Photo;
  album?: Album;
  albumPhotos: Photo[];
  currentIndex: number;
  prevPhoto: Photo | null;
  nextPhoto: Photo | null;
}

function MetaRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-surface-border/60 py-3 last:border-b-0">
      <span className="font-sans text-label uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className="font-sans text-sm tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
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

  const displayTitle = formatPhotoTitle(photo, album, currentIndex);

  const [showCopied, setShowCopied] = useState(false);
  // Keeps the badge mounted long enough to fade back out.
  const copiedToast = usePresence(showCopied, 150);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(currentIndex);

  const openLightbox = useCallback(() => {
    setLightboxIndex(currentIndex);
    setLightboxOpen(true);
  }, [currentIndex]);

  const handleLightboxNavigate = useCallback(
    (newIndex: number) => {
      setLightboxIndex(newIndex);
      const newPhoto = albumPhotos[newIndex];
      if (newPhoto) {
        window.history.replaceState(null, "", `/photo/${newPhoto.id}`);
      }
    },
    [albumPhotos]
  );

  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
    const currentPhoto = albumPhotos[lightboxIndex];
    if (currentPhoto && currentPhoto.id !== photo.id) {
      router.push(`/photo/${currentPhoto.id}`, { scroll: false });
    }
  }, [albumPhotos, lightboxIndex, photo.id, router]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = displayTitle;
    const text = photo.caption || `${displayTitle} - ${photo.metadata.location}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // silent
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
      const extension =
        photo.src.full.split(".").pop()?.split("?")[0] || "jpg";
      link.download = `${photo.title}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setIsDownloading(false);
    }
  };

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

      const minSwipeDistance = 50;
      if (
        Math.abs(deltaX) > minSwipeDistance &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        if (deltaX > 0 && prevPhoto) {
          router.push(`/photo/${prevPhoto.id}`, { scroll: false });
        } else if (deltaX < 0 && nextPhoto) {
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

      <div className="flex flex-1 justify-center px-6 pt-6 pb-20 md:px-12">
        <div className="flex w-full max-w-[1200px] flex-col">
          {/* Breadcrumbs */}
          <nav
            className="mb-6 flex flex-wrap items-center gap-3 font-sans text-label uppercase"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="text-text-muted hover:text-foreground transition-colors"
            >
              {t("nav", "home")}
            </Link>
            <span className="text-text-muted/40">/</span>
            {album && (
              <>
                <Link
                  href={`/album/${album.slug}`}
                  className="text-text-muted hover:text-foreground transition-colors"
                >
                  {album.title}
                </Link>
                <span className="text-text-muted/40">/</span>
              </>
            )}
            <span className="text-foreground">{displayTitle}</span>
          </nav>

          {/* Photo stage — full bleed within the content frame, no card frame */}
          <div
            className="relative group w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {prevPhoto && (
              <Link
                href={`/photo/${prevPhoto.id}`}
                scroll={false}
                className="absolute inset-y-0 left-0 z-10 hidden w-20 items-center justify-start pl-4 text-3xl font-thin text-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:text-white md:flex"
                aria-label="Previous photo"
              >
                ←
              </Link>
            )}
            {nextPhoto && (
              <Link
                href={`/photo/${nextPhoto.id}`}
                scroll={false}
                className="absolute inset-y-0 right-0 z-10 hidden w-20 items-center justify-end pr-4 text-3xl font-thin text-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:text-white md:flex"
                aria-label="Next photo"
              >
                →
              </Link>
            )}

            <div
              className="relative w-full h-[60vh] sm:h-[70vh] md:h-[78vh] flex items-center justify-center bg-background-dark cursor-pointer"
              onClick={openLightbox}
            >
              <ProtectedImage
                alt={displayTitle}
                className="max-h-full max-w-full object-contain pointer-events-none"
                src={photo.src.full}
                sources={photo.src}
                sizes="(max-width: 1200px) 100vw, 1200px"
                loading="eager"
                fetchPriority="high"
              />
            </div>

            {/* Counter — quiet caption, not a backdrop pill */}
            <p className="absolute top-4 left-4 z-10 font-sans text-eyebrow uppercase text-white/60 tabular-nums">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(albumPhotos.length).padStart(2, "0")}
            </p>

            {/* Mobile nav */}
            <div className="absolute bottom-4 right-4 z-10 flex gap-6 md:hidden">
              {prevPhoto && (
                <Link
                  href={`/photo/${prevPhoto.id}`}
                  scroll={false}
                  className="text-2xl font-thin text-white/60 hover:text-white"
                  aria-label="Previous photo"
                >
                  ←
                </Link>
              )}
              {nextPhoto && (
                <Link
                  href={`/photo/${nextPhoto.id}`}
                  scroll={false}
                  className="text-2xl font-thin text-white/60 hover:text-white"
                  aria-label="Next photo"
                >
                  →
                </Link>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16">
            {/* Left: title, caption, actions */}
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-3">
                <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-foreground">
                  {displayTitle}
                </h1>
                {photo.caption && (
                  <p className="max-w-2xl font-sans text-base leading-relaxed text-text-muted">
                    {photo.caption}
                  </p>
                )}
              </header>

              {/* Actions — outlined chips for clearer affordance */}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-dark/40 px-5 py-2.5 font-sans text-label uppercase tracking-[0.18em] text-foreground transition-all duration-200 active:duration-150 active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:active:opacity-80 hover:border-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={t("photo", "download")}
                >
                  <span aria-hidden="true" className="material-symbols-outlined !text-base">
                    download
                  </span>
                  <span>{isDownloading ? "…" : t("photo", "download")}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="relative inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-dark/40 px-5 py-2.5 font-sans text-label uppercase tracking-[0.18em] text-foreground transition-all duration-200 active:duration-150 active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:active:opacity-80 hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={t("photo", "share")}
                >
                  <span aria-hidden="true" className="material-symbols-outlined !text-base">
                    share
                  </span>
                  <span>{t("photo", "share")}</span>
                  {copiedToast.shouldRender && (
                    <span
                      className={`absolute -top-9 left-0 whitespace-nowrap rounded-full bg-foreground px-3 py-1 font-sans text-micro uppercase text-background-dark transition-[opacity,transform] duration-150 ease-out motion-reduce:translate-y-0 ${
                        copiedToast.isVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1"
                      }`}
                    >
                      {t("photo", "linkCopied")}
                    </span>
                  )}
                </button>
                <button
                  onClick={openLightbox}
                  className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-dark/40 px-5 py-2.5 font-sans text-label uppercase tracking-[0.18em] text-foreground transition-all duration-200 active:duration-150 active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:active:opacity-80 hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span aria-hidden="true" className="material-symbols-outlined !text-base">
                    slideshow
                  </span>
                  <span>{t("photo", "slideshow")}</span>
                </button>
              </div>

              {/* Back to album */}
              {album && (
                <div className="mt-8 border-t border-surface-border pt-8">
                  <Link
                    href={`/album/${album.slug}`}
                    className="group/cta inline-flex items-center gap-3 font-sans text-label uppercase text-text-muted hover:text-foreground transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-6 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-10 group-hover/cta:bg-foreground"
                    />
                    <span>
                      {t("photo", "backTo")} {album.title}
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Right: location + EXIF — typographic, not dashboard */}
            <aside className="flex flex-col gap-12">
              {/* Location */}
              <section className="flex flex-col gap-4">
                <header className="flex flex-col gap-1">
                  <p className="font-sans text-eyebrow uppercase text-text-muted">
                    Location
                  </p>
                  <p className="font-display text-base text-foreground">
                    {photo.metadata.city
                      ? `${photo.metadata.city}, ${photo.metadata.location}`
                      : photo.metadata.location}
                  </p>
                  {photo.metadata.date && (
                    <p className="font-sans text-xs text-text-muted">
                      {photo.metadata.date}
                    </p>
                  )}
                </header>

                {photo.metadata.latitude && photo.metadata.longitude ? (
                  <div className="overflow-hidden border-y border-surface-border">
                    <PhotoLocationMap
                      latitude={photo.metadata.latitude}
                      longitude={photo.metadata.longitude}
                      title={photo.title}
                    />
                  </div>
                ) : (
                  <p className="border-y border-surface-border py-12 text-center font-sans text-xs text-text-muted">
                    {t("photo", "noGpsData")}
                  </p>
                )}
              </section>

              {/* EXIF */}
              <section className="flex flex-col gap-4">
                <header className="flex flex-col gap-1">
                  <p className="font-sans text-eyebrow uppercase text-text-muted">
                    Capture
                  </p>
                  <p className="font-display text-base text-foreground">
                    {photo.metadata.camera || t("photo", "camera")}
                  </p>
                  {photo.metadata.lens && (
                    <p className="font-sans text-xs text-text-muted truncate">
                      {photo.metadata.lens}
                    </p>
                  )}
                </header>

                <div className="flex flex-col">
                  {photo.metadata.aperture && (
                    <MetaRow
                      label={t("photo", "aperture")}
                      value={photo.metadata.aperture}
                    />
                  )}
                  {photo.metadata.shutterSpeed && (
                    <MetaRow
                      label={t("photo", "shutter")}
                      value={photo.metadata.shutterSpeed}
                    />
                  )}
                  {photo.metadata.iso && (
                    <MetaRow
                      label={t("photo", "iso")}
                      value={photo.metadata.iso}
                    />
                  )}
                  {photo.metadata.focalLength && (
                    <MetaRow
                      label={t("photo", "focal")}
                      value={photo.metadata.focalLength}
                    />
                  )}
                  {photo.metadata.width && photo.metadata.height && (
                    <MetaRow
                      label={t("photo", "resolution")}
                      value={`${photo.metadata.width} × ${photo.metadata.height}`}
                    />
                  )}
                </div>
              </section>
            </aside>
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
