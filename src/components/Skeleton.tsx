"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-border rounded ${className}`}
    />
  );
}

export function ImageSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-text-muted/30 animate-pulse">
          image
        </span>
      </div>
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-dark border border-surface-border">
      <ImageSkeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function PhotoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ImageSkeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}

export function AlbumGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AlbumCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChapterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cover image skeleton */}
      <ImageSkeleton className="w-full h-[40vh] rounded-xl" />

      {/* Title skeleton */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-px w-12" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-px w-12" />
      </div>

      {/* Stats skeleton */}
      <div className="flex justify-center gap-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Narrative skeleton */}
      <div className="max-w-prose mx-auto space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Photo grid skeleton */}
      <PhotoGridSkeleton count={8} />
    </div>
  );
}
