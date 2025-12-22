"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "./Lightbox";

interface Photo {
  id: string;
  title: string;
  src: { thumb: string; medium: string; full: string };
  metadata: {
    date?: string;
    location?: string;
    locationDetail?: string;
  };
}

interface PhotoGridProps {
  photos: Photo[];
  variant?: "default" | "chapter";
  enableLightbox?: boolean;
  enableInfiniteScroll?: boolean;
  initialCount?: number;
  incrementCount?: number;
}

export default function PhotoGrid({
  photos,
  variant = "default",
  enableLightbox = true,
  enableInfiniteScroll = true,
  initialCount = 12,
  incrementCount = 12,
}: PhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(
    enableInfiniteScroll ? Math.min(initialCount, photos.length) : photos.length
  );
  const loaderRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || displayCount >= photos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + incrementCount, photos.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, displayCount, photos.length, incrementCount]);

  const openLightbox = useCallback((index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  const displayedPhotos = photos.slice(0, displayCount);

  return (
    <>
      <div
        className={`grid gap-4 md:gap-6 ${
          variant === "chapter"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[300px]"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[250px]"
        }`}
      >
        {displayedPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className={`group relative overflow-hidden rounded-lg bg-surface-dark cursor-pointer ${
              variant === "chapter" && index === 0 && photos.length > 2
                ? "md:col-span-2 md:row-span-2"
                : ""
            }`}
            onClick={() => enableLightbox && openLightbox(index)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={photo.src.medium}
              alt={photo.title || "Photo"}
              fill
              sizes={variant === "chapter" ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-105 select-none"
              draggable={false}
              priority={index < 4}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

            {/* Photo info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {photo.title && (
                <h3 className="text-lg md:text-xl text-white font-bold mb-1 truncate">
                  {photo.title}
                </h3>
              )}
              {photo.metadata.date && (
                <p className="text-sm text-white/70">{photo.metadata.date}</p>
              )}
            </div>

            {/* Expand icon */}
            {enableLightbox && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white/70 text-2xl">
                  fullscreen
                </span>
              </div>
            )}

            {/* Link to photo page (fallback if no lightbox) */}
            {!enableLightbox && (
              <Link href={`/photo/${photo.id}`} className="absolute inset-0 z-10" />
            )}
          </div>
        ))}
      </div>

      {/* Infinite scroll loader */}
      {enableInfiniteScroll && displayCount < photos.length && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <span className="material-symbols-outlined text-3xl text-primary animate-spin">
            progress_activity
          </span>
        </div>
      )}

      {/* Load more counter */}
      {enableInfiniteScroll && displayCount < photos.length && (
        <p className="text-center text-text-muted text-sm mt-4">
          Showing {displayCount} of {photos.length} photos
        </p>
      )}

      {/* Lightbox */}
      {enableLightbox && (
        <Lightbox
          photos={photos}
          currentIndex={currentPhotoIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentPhotoIndex}
        />
      )}
    </>
  );
}
