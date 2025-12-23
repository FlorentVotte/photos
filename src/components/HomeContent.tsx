"use client";

import Link from "next/link";
import Hero from "./Hero";
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
  featuredAlbum?: Album;
  recentAlbums: Album[];
  tagline: string;
}

export default function HomeContent({
  featuredAlbum,
  recentAlbums,
  tagline,
}: HomeContentProps) {
  const { t } = useLocale();

  return (
    <>
      {/* Hero Section */}
      {featuredAlbum && (
        <Hero
          title={featuredAlbum.title}
          subtitle={featuredAlbum.subtitle}
          description={featuredAlbum.description}
          backgroundImage={featuredAlbum.coverImage}
          tag={t("home", "featuredStory")}
          ctaText={t("home", "viewAlbum")}
          ctaLink={`/album/${featuredAlbum.slug}`}
          showScrollHint={true}
        />
      )}

      {/* Quote Section */}
      <div className="py-8 md:py-16 px-4 md:px-20 text-center border-b border-surface-border mb-12">
        <span className="material-symbols-outlined text-4xl text-primary mb-4">
          camera
        </span>
        <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight max-w-3xl mx-auto italic">
          &ldquo;{t("home", "quote")}&rdquo;
        </h2>
        <p className="mt-4 text-gray-500 font-sans">{tagline}</p>
      </div>

      {/* Albums Section */}
      <section id="albums">
        <div className="flex items-end justify-between px-4 pb-6 pt-2">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            {t("home", "recentAlbums")}
          </h2>
          <a
            href="#"
            className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors"
          >
            {t("home", "viewArchive")}{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_outward
            </span>
          </a>
        </div>

        {/* Magazine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
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
            />
          ))}
        </div>
      </section>
    </>
  );
}
