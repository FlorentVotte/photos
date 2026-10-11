"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PhotoGrid from "./PhotoGrid";
import ChapterStats from "./ChapterStats";
import ChapterLocationSummary from "./ChapterLocationSummary";
import ProtectedImage from "./ProtectedImage";
import { heroParallax } from "@/lib/hero-parallax";
import { useLocale } from "@/lib/LocaleContext";
import { extractLocations, computeChapterStats } from "@/lib/geo-utils";
import { formatPhotoAccessibleLabel, wideCoverSources } from "@/lib/photo-display";
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
  // Wide crops: the square thumb would be upscaled, so use medium + full only.
  const heroSources = wideCoverSources(album.coverImage);
  const heroHeightRef = useRef(600);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  // Parallax is written straight to the DOM (no React state per scroll event),
  // rAF-throttled, and only live while the hero is near the viewport.
  useEffect(() => {
    const hero = heroRef.current;
    const image = heroImageRef.current;
    const text = heroTextRef.current;
    if (!hero || !image || !text) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let frame = 0;

    const clear = () => {
      image.style.transform = "";
      image.style.willChange = "";
      text.style.transform = "";
      text.style.opacity = "";
      text.style.willChange = "";
    };

    const apply = () => {
      frame = 0;
      const { imageY, textY, textOpacity } = heroParallax(
        window.scrollY,
        heroHeightRef.current
      );
      image.style.transform = `translateY(${imageY}px)`;
      text.style.transform = `translateY(${textY}px)`;
      text.style.opacity = String(textOpacity);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const sync = () => {
      stop();
      if (motionQuery.matches) {
        clear();
        return;
      }
      if (inView) {
        image.style.willChange = "transform";
        text.style.willChange = "transform";
        window.addEventListener("scroll", onScroll, { passive: true });
        apply();
      } else {
        image.style.willChange = "";
        text.style.willChange = "";
      }
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      heroHeightRef.current = entry.contentRect.height;
      if (inView && !motionQuery.matches) onScroll();
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { rootMargin: "100px 0px" }
    );

    resizeObserver.observe(hero);
    intersectionObserver.observe(hero);
    motionQuery.addEventListener("change", sync);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

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
    <main id="main" tabIndex={-1} className="flex-1 flex flex-col items-center w-full">
      {/* Cinematic hero with parallax */}
      <div
        ref={heroRef}
        className="relative h-[75svh] min-h-[480px] w-full overflow-hidden md:h-[88svh] md:min-h-[640px]"
      >
        <div ref={heroImageRef} className="absolute inset-0 z-0">
          <ProtectedImage
            alt=""
            src={album.coverImage}
            sources={heroSources}
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="h-full w-full scale-110 object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/15 to-background-dark" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-3/5 bg-gradient-to-t from-background-dark/80 via-background-dark/50 to-transparent" />

        <div
          ref={heroTextRef}
          className="relative z-20 mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-20 md:px-12 md:pb-28"
        >
          <div className="flex max-w-3xl flex-col gap-4">
            <p className="font-sans text-eyebrow uppercase text-white/80">
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

            <p className="mt-2 font-sans text-eyebrow uppercase text-white/80">
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
                    src={coverPhoto.src.medium}
                    sources={coverPhoto.src}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    alt={formatPhotoAccessibleLabel(
                      coverPhoto,
                      album.title,
                      0,
                      locale
                    )}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={chapterIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={chapterIndex === 0 ? "high" : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/85 via-background-dark/10 to-transparent" />
                </div>
              )}

              <header className="flex flex-col items-center gap-3 text-center">
                <p className="font-sans text-eyebrow uppercase text-text-muted">
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
                albumTitle={album.title}
              />
            </section>
          );
        })}

        {/* Fallback: no chapters */}
        {chapters.length === 0 && photos.length > 0 && (
          <section className="flex w-full flex-col gap-10">
            <header className="text-center">
              <h2 className="font-sans text-eyebrow uppercase text-text-muted">
                {t("album", "gallery")}
              </h2>
            </header>
            <PhotoGrid
              photos={photos}
              variant="chapter"
              enableInfiniteScroll={true}
              initialCount={12}
              albumTitle={album.title}
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
              <ProtectedImage
                alt=""
                src={nextAlbum.coverImage}
                sources={wideCoverSources(nextAlbum.coverImage)}
                sizes="(min-width: 1100px) 1100px, 100vw"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/70 to-background-dark/30" />
              <div className="relative flex min-h-[280px] flex-col justify-center gap-4 px-8 py-16 md:min-h-[360px] md:px-16">
                <p className="font-sans text-eyebrow uppercase text-text-muted">
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
                  {/* w-12 box scaled to 2rem at rest; -mr-4 cancels the extra 1rem so layout matches the old w-8 */}
                  <span
                    aria-hidden="true"
                    className="-mr-4 h-px w-12 origin-left scale-x-[0.6667] bg-text-muted/60 transition-[transform,background-color] duration-300 ease-out-soft group-hover:scale-x-100 group-hover:bg-foreground motion-reduce:transition-none"
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
