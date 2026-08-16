"use client";

import Link from "next/link";
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

interface HomeContentProps {
  recentAlbums: Album[];
}

export default function HomeContent({ recentAlbums }: HomeContentProps) {
  const { t } = useLocale();

  return (
    <>
      {/* Quote / colophon */}
      <section className="py-20 md:py-28 px-4 text-center border-b border-surface-border">
        <p className="font-display text-2xl md:text-[2rem] leading-snug tracking-tight italic max-w-2xl mx-auto text-white/90">
          &ldquo;{t("home", "quote")}&rdquo;
        </p>
        <p className="mt-6 font-sans text-eyebrow uppercase text-text-muted">
          {t("home", "quoteAuthor")}
        </p>
        <p className="mt-10 font-sans text-sm text-white/50 max-w-xl mx-auto">
          {t("home", "tagline")}
        </p>
      </section>

      {/* Albums */}
      <section id="albums" className="pt-20 md:pt-24">
        <header className="px-1 pb-10 md:pb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
            {t("home", "recentAlbums")}
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {recentAlbums.slice(0, 5).map((album, index) => (
            <AlbumCard
              key={album.id}
              album={album}
              variant={
                index === 0
                  ? "large"
                  : index === 1
                  ? "portrait"
                  : "square"
              }
              featuredLabel={index === 0 ? t("home", "featuredStory") : undefined}
            />
          ))}
        </div>

        <div className="flex justify-center md:justify-end pt-12 pb-4 md:pr-1">
          <Link
            href="/albums"
            className="group/cta inline-flex items-center gap-3 font-sans text-sm uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
          >
            <span>{t("home", "viewArchive")}</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
