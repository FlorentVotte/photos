import Header from "@/components/Header";
import { AlbumGridSkeleton, ImageSkeleton, Skeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      {/* Hero skeleton */}
      <div className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <ImageSkeleton className="absolute inset-0" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/20 to-background-dark" />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-20 w-[500px] max-w-full" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-12 w-40 rounded-lg mt-4" />
        </div>
      </div>

      {/* Quote skeleton */}
      <div className="py-8 md:py-16 px-4 md:px-20 text-center border-b border-surface-border mb-12">
        <Skeleton className="h-10 w-10 mx-auto mb-4 rounded" />
        <Skeleton className="h-8 w-[600px] max-w-full mx-auto mb-2" />
        <Skeleton className="h-8 w-[400px] max-w-full mx-auto mb-4" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Albums section skeleton */}
      <section className="px-4">
        <div className="flex items-end justify-between pb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <AlbumGridSkeleton count={5} />
      </section>
    </div>
  );
}
