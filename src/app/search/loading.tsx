import Header from "@/components/Header";
import { Skeleton, PhotoGridSkeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 px-6 pt-20 pb-20 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1200px]">
          <Skeleton className="h-12 w-48 mb-12" />

          {/* Underlined search + filter row */}
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <Skeleton className="h-12 flex-1" />
            <div className="flex shrink-0 items-center gap-6">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          <Skeleton className="h-3 w-32 mb-12" />
          <PhotoGridSkeleton count={12} />
        </div>
      </main>
    </div>
  );
}
