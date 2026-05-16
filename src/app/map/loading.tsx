import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";

export default function MapLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 px-6 pt-20 pb-20 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-12 max-w-2xl">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </header>

          <div className="w-full h-[70vh] bg-surface-dark flex items-center justify-center border-y border-surface-border">
            <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted animate-pulse">
              Loading map
            </p>
          </div>

          <Skeleton className="h-3 w-48 mx-auto mt-6" />
        </div>
      </main>
    </div>
  );
}
