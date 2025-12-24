import Header from "@/components/Header";
import { AlbumGridSkeleton, Skeleton } from "@/components/Skeleton";

export default function AlbumsLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-12">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-4" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Year section skeleton */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-8 w-20" />
              <div className="flex-1 h-px bg-surface-border" />
              <Skeleton className="h-4 w-16" />
            </div>
            <AlbumGridSkeleton count={3} />
          </div>

          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-8 w-20" />
              <div className="flex-1 h-px bg-surface-border" />
              <Skeleton className="h-4 w-16" />
            </div>
            <AlbumGridSkeleton count={3} />
          </div>
        </div>
      </main>
    </div>
  );
}
