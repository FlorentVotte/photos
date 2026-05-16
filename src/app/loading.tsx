import Header from "@/components/Header";
import { AlbumGridSkeleton, ImageSkeleton, Skeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      {/* Hero — full-bleed */}
      <section className="relative w-full">
        <ImageSkeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-background-dark/70" />
        <div className="mx-auto flex min-h-[70vh] max-w-[1200px] flex-col justify-end px-6 pb-16 pt-40 md:px-12 lg:min-h-[80vh] lg:pb-24">
          <div className="relative z-10 flex max-w-2xl flex-col gap-4">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-16 w-3/4 max-w-lg" />
            <Skeleton className="h-5 w-1/2 max-w-sm" />
            <Skeleton className="h-3 w-32 mt-2" />
          </div>
        </div>
      </section>

      <div className="flex flex-1 justify-center">
        <div className="flex w-full max-w-[1200px] flex-col px-4 lg:px-8">
          {/* Quote */}
          <section className="py-20 md:py-28 px-4 text-center border-b border-surface-border">
            <Skeleton className="h-8 w-3/4 max-w-xl mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto mt-6" />
            <Skeleton className="h-4 w-72 mx-auto mt-10" />
          </section>

          {/* Albums */}
          <section className="pt-20 md:pt-24">
            <Skeleton className="h-10 w-64 mb-10 md:mb-14" />
            <AlbumGridSkeleton count={5} />
          </section>
        </div>
      </div>
    </div>
  );
}
