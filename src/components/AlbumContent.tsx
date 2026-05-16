"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PhotoGrid from "./PhotoGrid";
import ChapterStats from "./ChapterStats";
import ChapterLocationSummary from "./ChapterLocationSummary";
import ProtectedImage from "./ProtectedImage";
import { useLocale } from "@/lib/LocaleContext";
import { extractLocations, computeChapterStats } from "@/lib/geo-utils";
import type { Photo, Album, Chapter } from "@/lib/types";

const ChapterRouteMap = dynamic(() => import("./ChapterRouteMap"), {
  loading: () => (
    <div className="w-full h-[300px] bg-surface-dark/50 animate-pulse" />
  ),
  ssr: false,
});

interface AlbumContentProps {
  album: Album;
  chapters: Chapter[];
  photos: Photo[];
  nextAlbum?: Album;
}

export default function AlbumContent({
  album,
  chapters,
  photos,
  nextAlbum,
}: AlbumContentProps) {
  const { t, locale } = useLocale();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroHeight = heroRef.current?.offsetHeight || 600;
  const parallaxOffset = scrollY * 0.35;
  const textOpacity = Math.max(0, 1 - scrollY / (heroHeight * 0.6));
  const textTranslate = scrollY * 0.18;

  useEffect(() => {
    const storageKey = `scroll-album-${album.slug}`;
    const savedPosition = sessionStorage.getItem(storageKey);

    if (savedPosition) {
      const timer = setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
        sessionStorage.removeItem(storageKey);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [album.slug]);

  useEffect(() => {
    const storageKey = `scroll-album-${album.slug}`;

    const handleBeforeUnload = () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/photo/"]');
      if (link) {
        sessionStorage.setItem(storageKey, String(window.scrollY));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick);
    };
  }, [album.slug]);

  const getChapterTitle = (chapter: Chapter) => {
    if (locale === "fr" && chapter.titleFr) return chapter.titleFr;
    return chapter.title;
  };

  const getChapterNarrative = (chapter: Chapter) => {
    if (locale === "fr" && chapter.narrativeFr) return chapter.narrativeFr;
    return chapter.narrative;
  };

  return (
    <main className="flex-1 flex flex-col items-center w-full">
      {/* Cinematic hero with parallax */}
      <div
        ref={heroRef}
        className="relative h-[75vh] min-h-[480px] w-full overflow-hidden md:h-[88vh] md:min-h-[640px]"
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url("${album.coverImage}")`,
            transform: `translateY(${parallaxOffset}px) scale(1.1)`,
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/15 to-background-dark" />

        <div
          className="relative z-20 mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-20 md:px-12 md:pb-28 will-change-transform"
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslate}px)`,
          }}
        >
          <div className="flex max-w-3xl flex-col gap-4">
            <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-white/70">
              {t("album", "travelDiary")}
            </p>

            <h1 className="text-foreground text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.02] tracking-tight">
              {album.title}
            </h1>

            {album.subtitle && (
              <p className="font-display text-xl md:text-2xl italic text-white/80">
                {album.subtitle}
              </p>
            )}

            <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.32em] text-white/60">
              {album.date} <span className="mx-2 text-white/30">·</span>{" "}
              {album.location}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full max-w-[1100px] flex-col gap-28 px-6 py-20 md:px-12 md:py-28">
        {/* Intro narrative */}
        {album.description && (
          <article className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xl md:text-2xl italic leading-snug tracking-tight text-foreground/90">
              {album.description}
            </p>
          </article>
        )}

        {/* Chapters */}
        {chapters.map((chapter, chapterIndex) => {
          const locations = extractLocations(chapter.photos);
          const stats = computeChapterStats(chapter.photos);
          const coverPhoto = chapter.coverPhoto || chapter.photos[0];

          return (
            <section key={chapter.id} className="flex w-full flex-col gap-10">
              {coverPhoto && (
                <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
                  <ProtectedImage
                    src={coverPhoto.src.full}
                    alt={coverPhoto.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/85 via-background-dark/10 to-transparent" />
                </div>
              )}

              <header className="flex flex-col items-center gap-3 text-center">
                <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                  {t("album", "chapter")} {chapterIndex + 1}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-foreground">
                  {getChapterTitle(chapter)}
                </h2>
                {locations.cities.length + locations.countries.length > 0 && (
                  <ChapterLocationSummary locations={locations} />
                )}
                <ChapterStats stats={stats} />
              </header>

              {locations.coordinates.length > 1 && (
                <div className="overflow-hidden">
                  <ChapterRouteMap
                    photos={chapter.photos}
                    height="350px"
                    showMarkers={true}
                  />
                </div>
              )}

              {getChapterNarrative(chapter) && (
                <div className="mx-auto max-w-prose">
                  <p className="font-sans text-base md:text-lg leading-loose text-text-muted first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-none first-letter:text-foreground">
                    {getChapterNarrative(chapter)}
                  </p>
                </div>
              )}

              <PhotoGrid
                photos={chapter.photos}
                variant="chapter"
                enableInfiniteScroll={false}
                featuredPhotoIds={chapter.featuredPhotoIds}
              />
            </section>
          );
        })}

        {/* Fallback: no chapters */}
        {chapters.length === 0 && photos.length > 0 && (
          <section className="flex w-full flex-col gap-10">
            <header className="text-center">
              <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                {t("album", "gallery")}
              </p>
            </header>
            <PhotoGrid
              photos={photos}
              variant="chapter"
              enableInfiniteScroll={true}
              initialCount={12}
            />
          </section>
        )}

        {/* Next album */}
        {nextAlbum && nextAlbum.id !== album.id && (
          <footer className="mt-8 w-full border-t border-surface-border pt-16">
            <Link
              href={`/album/${nextAlbum.slug}`}
              className="group relative block w-full overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                style={{ backgroundImage: `url("${nextAlbum.coverImage}")` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/70 to-background-dark/30" />
              <div className="relative flex min-h-[280px] flex-col justify-center gap-4 px-8 py-16 md:min-h-[360px] md:px-16">
                <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                  {t("album", "nextJourney")}
                </p>
                <h3 className="font-display text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
                  {nextAlbum.title}
                </h3>
                {nextAlbum.description && (
                  <p className="max-w-md font-sans text-sm md:text-base text-text-muted">
                    {nextAlbum.description}
                  </p>
                )}
                <div className="mt-2 inline-flex items-center gap-3 self-start font-sans text-sm uppercase tracking-[0.24em] text-text-muted transition-colors group-hover:text-foreground">
                  <span>{t("home", "viewAlbum")}</span>
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover:w-12 group-hover:bg-foreground"
                  />
                </div>
              </div>
            </Link>
          </footer>
        )}
      </div>
    </main>
  );
}
