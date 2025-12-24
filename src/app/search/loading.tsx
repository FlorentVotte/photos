import Header from "@/components/Header";
import { Skeleton, PhotoGridSkeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Skeleton className="h-10 w-32 mb-8" />

          {/* Search input skeleton */}
          <Skeleton className="h-14 w-full rounded-xl mb-6" />

          {/* Filters skeleton */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Skeleton className="h-10 w-40 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          </div>

          {/* Results skeleton */}
          <Skeleton className="h-5 w-48 mb-6" />
          <PhotoGridSkeleton count={12} />
        </div>
      </main>
    </div>
  );
}
