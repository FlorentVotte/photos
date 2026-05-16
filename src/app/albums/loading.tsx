import Header from "@/components/Header";
import { AlbumGridSkeleton, Skeleton } from "@/components/Skeleton";

export default function AlbumsLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 px-6 pt-20 pb-20 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-20 max-w-2xl">
            <Skeleton className="h-12 w-72 mb-6" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </header>

          {[0, 1].map((i) => (
            <section key={i} className="mb-20 last:mb-0">
              <div className="mb-8 flex items-baseline gap-6">
                <Skeleton className="h-3 w-12" />
                <div className="h-px flex-1 bg-surface-border" />
              </div>
              <AlbumGridSkeleton count={3} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
