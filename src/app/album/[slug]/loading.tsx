import Header from "@/components/Header";
import { ChapterSkeleton, ImageSkeleton, Skeleton } from "@/components/Skeleton";

export default function AlbumLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero */}
        <div className="relative w-full h-[75vh] min-h-[480px] md:h-[88vh] md:min-h-[640px] overflow-hidden">
          <ImageSkeleton className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-background-dark" />
          <div className="relative z-10 mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-20 md:px-12 md:pb-28">
            <div className="flex max-w-3xl flex-col gap-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-16 w-72 max-w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex w-full max-w-[1100px] flex-col gap-28 px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>
          <ChapterSkeleton />
        </div>
      </main>
    </div>
  );
}
