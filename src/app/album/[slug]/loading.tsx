import Header from "@/components/Header";
import { ChapterSkeleton, ImageSkeleton, Skeleton } from "@/components/Skeleton";

export default function AlbumLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero skeleton */}
        <div className="w-full relative h-[70vh] md:h-[85vh] min-h-[400px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
          <ImageSkeleton className="absolute inset-0" />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/20 to-background-dark" />
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-16 w-96 max-w-full" />
            <Skeleton className="h-px w-24" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="w-full max-w-screen-xl px-4 md:px-8 lg:px-12 py-16 md:py-24 flex flex-col gap-24">
          {/* Intro skeleton */}
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Skeleton className="h-8 w-8 mx-auto rounded" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>

          {/* Chapter skeleton */}
          <ChapterSkeleton />
        </div>
      </main>
    </div>
  );
}
