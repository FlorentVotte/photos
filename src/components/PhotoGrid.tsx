"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Check if title looks like a filename (e.g., DSCF0678.raf, IMG_1234.jpg)
function isFilename(title: string): boolean {
  if (!title) return true;
  return /\.(jpe?g|png|gif|webp|raw|raf|cr2|nef|arw|dng|heic)$/i.test(title);
}

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
  enableInfiniteScroll?: boolean;
  initialCount?: number;
  incrementCount?: number;
  featuredPhotoIds?: string[];
}

export default function PhotoGrid({
  photos,
  variant = "default",
  enableInfiniteScroll = true,
  initialCount = 12,
  incrementCount = 12,
  featuredPhotoIds,
}: PhotoGridProps) {
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

  const displayedPhotos = photos.slice(0, displayCount);

  // Compute featured photo classes with alternating left/right positioning
  const getFeaturedClass = (photo: Photo, index: number): string => {
    if (variant !== "chapter" || photos.length <= 2) return "";

    // If featuredPhotoIds is provided, use it; otherwise fall back to first photo
    if (featuredPhotoIds && featuredPhotoIds.length > 0) {
      const featuredIndex = featuredPhotoIds.indexOf(photo.id);
      if (featuredIndex === -1) return "";

      // Alternate: even index = left, odd index = right
      const isLeft = featuredIndex % 2 === 0;
      return isLeft
        ? "md:col-span-2 md:row-span-2 lg:col-start-1"
        : "md:col-span-2 md:row-span-2 lg:col-start-2";
    }

    // Fallback: first photo is featured (legacy behavior)
    return index === 0 ? "md:col-span-2 md:row-span-2" : "";
  };

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
          <Link
            key={photo.id}
            href={`/photo/${photo.id}`}
            className={`group relative overflow-hidden rounded-lg bg-surface-dark cursor-pointer ${
              getFeaturedClass(photo, index)
            }`}
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
              {photo.title && !isFilename(photo.title) && (
                <h3 className="text-lg md:text-xl text-foreground font-bold mb-1 truncate">
                  {photo.title}
                </h3>
              )}
              {photo.metadata.date && (
                <p className="text-sm text-foreground/70">{photo.metadata.date}</p>
              )}
            </div>
          </Link>
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
    </>
  );
}
