"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-surface-border ${className}`} />;
}

export function ImageSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Skeleton className="absolute inset-0" />
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-surface-dark">
      <ImageSkeleton className="aspect-square w-full" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 md:p-6">
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function PhotoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ImageSkeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}

export function AlbumGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AlbumCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChapterSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <ImageSkeleton className="w-full aspect-[16/9] md:aspect-[21/9]" />

      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-3 w-40" />
      </div>

      <div className="mx-auto max-w-prose space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <PhotoGridSkeleton count={8} />
    </div>
  );
}
