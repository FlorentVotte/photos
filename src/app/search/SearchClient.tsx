"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocale } from "@/lib/LocaleContext";
import type { Album, Photo } from "@/lib/types";

type FilterType = "all" | "albums" | "photos";

interface SearchClientProps {
  albums: Album[];
  photos: Photo[];
}

export default function SearchClient({ albums, photos }: SearchClientProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedLocation] = useState<string>("");
  const [selectedCamera] = useState<string>("");
  const [selectedLens] = useState<string>("");

  const filteredAlbums = useMemo(() => {
    if (filterType === "photos") return [];

    return albums.filter((album) => {
      const matchesQuery =
        !query ||
        album.title.toLowerCase().includes(query.toLowerCase()) ||
        album.location.toLowerCase().includes(query.toLowerCase()) ||
        album.date.toLowerCase().includes(query.toLowerCase());

      const matchesLocation =
        !selectedLocation || album.location === selectedLocation;

      return matchesQuery && matchesLocation;
    });
  }, [albums, query, filterType, selectedLocation]);

  const filteredPhotos = useMemo(() => {
    if (filterType === "albums") return [];

    return photos.filter((photo) => {
      const queryLower = query.toLowerCase();
      const matchesQuery =
        !query ||
        photo.title.toLowerCase().includes(queryLower) ||
        photo.metadata.location?.toLowerCase().includes(queryLower) ||
        photo.metadata.date?.toLowerCase().includes(queryLower) ||
        photo.metadata.camera?.toLowerCase().includes(queryLower) ||
        photo.metadata.lens?.toLowerCase().includes(queryLower);

      const matchesLocation =
        !selectedLocation || photo.metadata.location === selectedLocation;
      const matchesCamera =
        !selectedCamera || photo.metadata.camera === selectedCamera;
      const matchesLens =
        !selectedLens || photo.metadata.lens === selectedLens;

      return matchesQuery && matchesLocation && matchesCamera && matchesLens;
    });
  }, [photos, query, filterType, selectedLocation, selectedCamera, selectedLens]);

  const totalResults = filteredAlbums.length + filteredPhotos.length;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      <main className="flex-1 px-6 pt-20 pb-20 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-12 max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
              {t("search", "title")}
            </h1>
          </header>

          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search", "placeholder")}
              className="flex-1 border-b border-surface-border bg-transparent pb-3 pl-0 pr-4 font-display text-2xl md:text-3xl font-normal text-foreground placeholder-text-muted/60 focus:border-foreground focus:outline-none transition-colors"
            />

            <div className="flex shrink-0 items-center gap-6">
              {(["all", "albums", "photos"] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`relative font-sans text-[11px] uppercase tracking-[0.32em] transition-colors ${
                    filterType === type
                      ? "text-foreground after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-foreground"
                      : "text-text-muted hover:text-foreground"
                  }`}
                >
                  {t("search", type)}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-12 font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
            {totalResults}{" "}
            {totalResults !== 1 ? t("search", "results") : t("search", "result")}
            {query && (
              <>
                <span className="mx-3 text-text-muted/40">·</span>
                {t("search", "for")} &ldquo;{query}&rdquo;
              </>
            )}
          </p>

          {filteredAlbums.length > 0 && (
            <section className="mb-20">
              <h2 className="mb-8 font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                Albums ({filteredAlbums.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredAlbums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.slug}`}
                    className="group relative aspect-[4/3] overflow-hidden bg-surface-dark"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      style={{ backgroundImage: `url("${album.coverImage}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 md:p-6">
                      <h3 className="font-display text-xl md:text-2xl font-semibold leading-tight tracking-tight text-foreground">
                        {album.title}
                      </h3>
                      <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/70">
                        {album.location} <span className="text-white/40">·</span>{" "}
                        {album.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filteredPhotos.length > 0 && (
            <section>
              <h2 className="mb-8 font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                Photos ({filteredPhotos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredPhotos.slice(0, 50).map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/photo/${photo.id}`}
                    className="group relative aspect-square overflow-hidden bg-surface-dark"
                  >
                    <img
                      src={photo.src.thumb}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  </Link>
                ))}
              </div>
              {filteredPhotos.length > 50 && (
                <p className="mt-10 text-center font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                  {t("search", "showingFirst")} {filteredPhotos.length}{" "}
                  {t("search", "photos")}
                </p>
              )}
            </section>
          )}

          {totalResults === 0 && (
            <div className="py-20 text-center">
              <p className="font-sans text-sm text-text-muted">
                {t("search", "noResults")}
              </p>
              <p className="mt-2 font-sans text-xs text-text-muted/60">
                {t("search", "tryDifferent")}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
