"use client";

import AlbumCard from "./AlbumCard";
import { useLocale } from "@/lib/LocaleContext";

interface Album {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  location: string;
  date: string;
  coverImage: string;
  photoCount: number;
  featured?: boolean;
}

interface AlbumsContentProps {
  albums: Album[];
}

export default function AlbumsContent({ albums }: AlbumsContentProps) {
  const { t } = useLocale();

  const albumsByYear = albums.reduce((acc, album) => {
    const yearMatch = album.date.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : "Other";
    if (!acc[year]) acc[year] = [];
    acc[year].push(album);
    return acc;
  }, {} as Record<string, Album[]>);

  const sortedYears = Object.keys(albumsByYear).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return parseInt(b) - parseInt(a);
  });

  return (
    <main className="flex-1 px-6 pt-20 pb-20 md:px-12 md:pt-28">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-20 max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
            {t("albums", "title")}
          </h1>
          <p className="mt-6 font-sans text-base text-text-muted leading-relaxed">
            {t("albums", "subtitle")}
          </p>
        </header>

        {sortedYears.map((year) => {
          const yearAlbums = albumsByYear[year];
          // Avoid lonely orphan rows: when a year has exactly 4 albums, use a
          // balanced 2×2 layout instead of 3-col-with-orphan.
          const gridClass =
            yearAlbums.length === 4
              ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6";
          return (
            <section key={year} className="mb-20 last:mb-0">
              <div className="mb-8 flex items-baseline gap-6">
                <h2 className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
                  {year}
                </h2>
                <div className="h-px flex-1 bg-surface-border" />
              </div>
              <div className={gridClass}>
                {yearAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} variant="square" />
                ))}
              </div>
            </section>
          );
        })}

        {albums.length === 0 && (
          <div className="py-20 text-center font-sans text-sm text-text-muted">
            {t("albums", "noAlbums")}
          </div>
        )}
      </div>
    </main>
  );
}
