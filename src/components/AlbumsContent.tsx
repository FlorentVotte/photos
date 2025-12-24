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

  // Group albums by year
  const albumsByYear = albums.reduce((acc, album) => {
    // Extract year from date string (e.g., "November 2025" -> "2025")
    const yearMatch = album.date.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : "Other";
    if (!acc[year]) acc[year] = [];
    acc[year].push(album);
    return acc;
  }, {} as Record<string, Album[]>);

  // Sort years descending
  const sortedYears = Object.keys(albumsByYear).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return parseInt(b) - parseInt(a);
  });

  return (
    <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("albums", "title")}
          </h1>
          <p className="text-lg text-text-muted max-w-2xl">
            {t("albums", "subtitle")}
          </p>
          <div className="mt-4 text-sm text-text-muted">
            {albums.length} {t("albums", "albumCount")} • {albums.reduce((sum, a) => sum + a.photoCount, 0)} {t("albums", "photoCount")}
          </div>
        </div>

        {/* Albums by Year */}
        {sortedYears.map((year) => (
          <section key={year} className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">{year}</h2>
              <div className="flex-1 h-px bg-surface-border" />
              <span className="text-sm text-text-muted">
                {albumsByYear[year].length} {albumsByYear[year].length === 1 ? "album" : "albums"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albumsByYear[year].map((album, index) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  variant={index === 0 && albumsByYear[year].length > 2 ? "large" : "square"}
                />
              ))}
            </div>
          </section>
        ))}

        {albums.length === 0 && (
          <div className="text-center py-20 text-text-muted">
            <span className="material-symbols-outlined text-6xl mb-4 block">photo_library</span>
            <p>{t("albums", "noAlbums")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
