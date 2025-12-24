"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import PhotoGrid from "./PhotoGrid";
import ChapterStats from "./ChapterStats";
import ChapterLocationSummary from "./ChapterLocationSummary";
import ProtectedImage from "./ProtectedImage";
import { useLocale } from "@/lib/LocaleContext";
import { extractLocations, computeChapterStats } from "@/lib/geo-utils";
import type {
  Photo,
  Album,
  Chapter,
} from "@/lib/types";

// Lazy load the route map component to reduce initial bundle size
const ChapterRouteMap = dynamic(() => import("./ChapterRouteMap"), {
  loading: () => (
    <div className="w-full h-[300px] bg-surface-dark/50 rounded-xl flex items-center justify-center">
      <span className="material-symbols-outlined text-2xl text-text-muted animate-pulse">map</span>
    </div>
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

  // Helper to get localized chapter content
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
      {/* Cinematic Hero Header */}
      <div className="w-full relative h-[70vh] md:h-[85vh] min-h-[400px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
          style={{ backgroundImage: `url("${album.coverImage}")` }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/20 to-background-dark" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <span className="inline-block py-1 px-3 rounded-full border border-white/30 bg-black/20 text-xs font-sans tracking-widest uppercase text-white backdrop-blur-sm">
            {t("album", "travelDiary")}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
            {album.title.split(" ")[0]}{" "}
            <span className="italic text-primary font-serif font-medium">
              {album.subtitle || album.title.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <div className="h-px w-24 bg-primary/80 my-2" />
          <p className="text-lg md:text-xl text-gray-200 font-light tracking-wide max-w-2xl">
            {album.date} • {album.location}
          </p>
          <div className="mt-8 animate-bounce text-white/50">
            <span className="material-symbols-outlined text-3xl">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-screen-xl px-4 md:px-8 lg:px-12 py-16 md:py-24 flex flex-col gap-24">
        {/* Intro Narrative */}
        {album.description && (
          <article className="max-w-2xl mx-auto text-center flex flex-col gap-6">
            <span className="material-symbols-outlined text-primary/50 text-4xl mb-2">
              format_quote
            </span>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light">
              {album.description}
            </p>
          </article>
        )}

        {/* Chapters with Photos */}
        {chapters.map((chapter, chapterIndex) => {
          const locations = extractLocations(chapter.photos);
          const stats = computeChapterStats(chapter.photos);
          const coverPhoto = chapter.coverPhoto || chapter.photos[0];

          return (
            <section key={chapter.id} className="w-full">
              {/* Cover Photo Hero */}
              {coverPhoto && (
                <div className="relative w-full h-[40vh] rounded-xl overflow-hidden mb-8">
                  <ProtectedImage
                    src={coverPhoto.src.full}
                    alt={coverPhoto.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent" />
                </div>
              )}

              {/* Chapter Title */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-12 bg-gray-700" />
                <h2 className="text-3xl text-white font-bold tracking-tight">
                  {t("album", "chapter")} {chapterIndex + 1}: {getChapterTitle(chapter)}
                </h2>
                <div className="h-px w-12 bg-gray-700" />
              </div>

              {/* Location Summary */}
              {locations.cities.length > 0 && (
                <div className="mb-4">
                  <ChapterLocationSummary locations={locations} />
                </div>
              )}

              {/* Statistics */}
              <ChapterStats stats={stats} />

              {/* Route Map */}
              {locations.coordinates.length > 1 && (
                <div className="my-8">
                  <ChapterRouteMap
                    photos={chapter.photos}
                    height="350px"
                    showMarkers={true}
                  />
                </div>
              )}

              {/* Chapter Narrative */}
              {getChapterNarrative(chapter) && (
                <div className="max-w-prose mx-auto my-12">
                  <p className="text-lg text-gray-300 leading-loose first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                    {getChapterNarrative(chapter)}
                  </p>
                </div>
              )}

              {/* Photo Grid */}
              <PhotoGrid
                photos={chapter.photos}
                variant="chapter"
                enableInfiniteScroll={false}
              />
            </section>
          );
        })}

        {/* If no chapters, show all photos in a grid */}
        {chapters.length === 0 && photos.length > 0 && (
          <section className="w-full">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px w-12 bg-gray-700" />
              <h2 className="text-3xl text-white font-bold tracking-tight">
                {t("album", "gallery")}
              </h2>
              <div className="h-px w-12 bg-gray-700" />
            </div>

            <PhotoGrid
              photos={photos}
              variant="chapter"
              enableInfiniteScroll={true}
              initialCount={12}
            />
          </section>
        )}

        {/* Next Journey */}
        {nextAlbum && nextAlbum.id !== album.id && (
          <footer className="mt-12 w-full">
            <div className="relative overflow-hidden rounded-2xl bg-surface-dark border border-surface-border">
              <div className="grid md:grid-cols-2">
                <div className="p-10 md:p-16 flex flex-col justify-center items-start gap-6 z-10 bg-background-dark/95 backdrop-blur-sm">
                  <p className="text-primary font-bold tracking-widest uppercase text-sm font-sans">
                    {t("album", "nextJourney")}
                  </p>
                  <h3 className="text-4xl md:text-5xl text-white font-bold leading-tight">
                    {nextAlbum.title}
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    {nextAlbum.description ||
                      `${t("home", "viewAlbum")} ${nextAlbum.location}`}
                  </p>
                  <Link
                    href={`/album/${nextAlbum.slug}`}
                    className="mt-4 flex items-center gap-2 text-white hover:text-primary transition-colors group"
                  >
                    <span className="font-bold underline decoration-primary underline-offset-4">
                      {t("home", "viewAlbum")}
                    </span>
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </Link>
                </div>
                <div className="relative h-64 md:h-auto min-h-[300px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${nextAlbum.coverImage}")`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background-dark/95 to-transparent md:w-1/3" />
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
