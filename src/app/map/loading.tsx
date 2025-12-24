import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";

export default function MapLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>

          {/* Map skeleton */}
          <div className="relative w-full h-[70vh] rounded-xl overflow-hidden bg-surface-dark border border-surface-border">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-text-muted/30 animate-pulse">
                  map
                </span>
                <p className="mt-4 text-text-muted animate-pulse">Loading map...</p>
              </div>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="mt-4">
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </main>
    </div>
  );
}
