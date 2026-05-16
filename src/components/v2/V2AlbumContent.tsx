"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import type { Album, Chapter, Photo } from "@/lib/types";

interface Props {
  album: Album;
  chapters: Chapter[];
  photos: Photo[];
  nextAlbum?: Album;
}

function formatDate(d: string, locale: "en" | "fr"): string {
  if (!d) return "";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  });
}

function chapterStats(photos: Photo[]) {
  const isos = photos.map((p) => Number(p.metadata.iso)).filter((n) => Number.isFinite(n) && n > 0);
  const apertures = photos
    .map((p) => Number(String(p.metadata.aperture || "").replace(/[^\d.]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  const locations = new Set(photos.map((p) => p.metadata.city || p.metadata.location).filter(Boolean));
  const dates = photos
    .map((p) => p.metadata.date)
    .filter(Boolean)
    .map((d) => new Date(d as string))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    locations: locations.size,
    isoRange: isos.length ? `${Math.min(...isos)} – ${Math.max(...isos)}` : null,
    apertureRange: apertures.length
      ? `f/${Math.min(...apertures)} – f/${Math.max(...apertures)}`
      : null,
    dateRange:
      dates.length > 1
        ? `${dates[0].toLocaleDateString()} – ${dates[dates.length - 1].toLocaleDateString()}`
        : dates.length === 1
          ? dates[0].toLocaleDateString()
          : null,
  };
}

export default function V2AlbumContent({ album, chapters, photos, nextAlbum }: Props) {
  const { locale } = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ height: "85vh", minHeight: 600, width: "100%" }}>
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          {album.coverImage && (
            <img
              src={album.coverImage}
              alt={album.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, filter: "grayscale(1)" }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, var(--v2-bg) 0%, transparent 60%, rgba(18,18,18,0.4) 100%)" }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 v2-container grid grid-cols-12" style={{ paddingBottom: 64, zIndex: 10 }}>
          <div className="col-span-12 md:col-span-10" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="flex flex-wrap items-center" style={{ gap: 12, marginBottom: 8 }}>
              {album.location && (
                <span className="v2-label-caps v2-ghost-border" style={{ padding: "6px 12px", color: "var(--v2-cream-dim)" }}>
                  {album.location}
                </span>
              )}
              {album.date && (
                <span className="v2-label-caps v2-ghost-border" style={{ padding: "6px 12px", color: "var(--v2-cream-dim)" }}>
                  {formatDate(album.date, locale)}
                </span>
              )}
              <span className="v2-label-caps v2-ghost-border" style={{ padding: "6px 12px", color: "var(--v2-cream-dim)" }}>
                {album.photoCount} photos
              </span>
            </div>
            <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)" }}>
              {album.title}
            </h1>
            {album.subtitle && (
              <p className="v2-bilingual" style={{ color: "var(--v2-cream-dim)", fontSize: 24, fontStyle: "italic", opacity: 0.8 }}>
                {album.subtitle}
              </p>
            )}
            {album.description && (
              <p className="v2-body-lg" style={{ color: "var(--v2-cream-dim)", maxWidth: 720, marginTop: 16 }}>
                {album.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Chapters */}
      {chapters.length > 0 ? (
        chapters.map((chapter, ci) => {
          const stats = chapterStats(chapter.photos);
          const featuredSet = new Set(chapter.featuredPhotoIds || []);
          const title = locale === "fr" && chapter.titleFr ? chapter.titleFr : chapter.title;
          const narrative = locale === "fr" && chapter.narrativeFr ? chapter.narrativeFr : chapter.narrative;
          return (
            <section key={chapter.id} className="v2-container" style={{ paddingTop: 120, paddingBottom: 120 }}>
              <div className="grid grid-cols-12" style={{ gap: 32, marginBottom: 64 }}>
                <div className="col-span-12 md:col-span-2">
                  <p className="v2-label-caps" style={{ color: "var(--v2-gold)" }}>
                    {locale === "fr" ? "Chapitre" : "Chapter"} {String(ci + 1).padStart(2, "0")}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-7">
                  <h2 className="v2-display-lg" style={{ color: "var(--v2-cream)", fontSize: 48 }}>
                    {title}
                  </h2>
                  {narrative && (
                    <div
                      className="v2-body-lg"
                      style={{
                        color: "var(--v2-cream-dim)",
                        marginTop: 32,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {narrative}
                    </div>
                  )}
                </div>
                <div className="col-span-12 md:col-span-3" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="v2-ghost-border-t" style={{ paddingTop: 16 }}>
                    <p className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>{locale === "fr" ? "Photos" : "Photos"}</p>
                    <p className="v2-body-md" style={{ color: "var(--v2-cream)" }}>{chapter.photos.length}</p>
                  </div>
                  {stats.locations > 0 && (
                    <div className="v2-ghost-border-t" style={{ paddingTop: 16 }}>
                      <p className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>{locale === "fr" ? "Lieux" : "Locations"}</p>
                      <p className="v2-body-md" style={{ color: "var(--v2-cream)" }}>{stats.locations}</p>
                    </div>
                  )}
                  {stats.isoRange && (
                    <div className="v2-ghost-border-t" style={{ paddingTop: 16 }}>
                      <p className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>ISO</p>
                      <p className="v2-body-md" style={{ color: "var(--v2-cream)" }}>{stats.isoRange}</p>
                    </div>
                  )}
                  {stats.apertureRange && (
                    <div className="v2-ghost-border-t" style={{ paddingTop: 16 }}>
                      <p className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>{locale === "fr" ? "Ouverture" : "Aperture"}</p>
                      <p className="v2-body-md" style={{ color: "var(--v2-cream)" }}>{stats.apertureRange}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-12" style={{ gap: 16 }}>
                {chapter.photos.map((photo) => {
                  const isFeatured = featuredSet.has(photo.id);
                  return (
                    <Link
                      key={photo.id}
                      href={`/v2/photo/${photo.id}`}
                      className="v2-cover-img-link block"
                      style={{
                        gridColumn: isFeatured ? "span 8 / span 8" : "span 4 / span 4",
                      }}
                    >
                      <div
                        className="v2-ghost-border overflow-hidden"
                        style={{ aspectRatio: isFeatured ? "16 / 10" : "4 / 5" }}
                      >
                        <img
                          src={photo.src.medium || photo.src.thumb}
                          alt={photo.title}
                          className="v2-cover-img"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        // No chapters — flat photo grid
        <section className="v2-container" style={{ paddingTop: 120, paddingBottom: 120 }}>
          <div className="grid grid-cols-12" style={{ gap: 16 }}>
            {photos.map((photo, i) => (
              <Link
                key={photo.id}
                href={`/v2/photo/${photo.id}`}
                className="v2-cover-img-link block"
                style={{ gridColumn: i % 5 === 0 ? "span 8 / span 8" : "span 4 / span 4" }}
              >
                <div className="v2-ghost-border overflow-hidden" style={{ aspectRatio: i % 5 === 0 ? "16 / 10" : "4 / 5" }}>
                  <img
                    src={photo.src.medium || photo.src.thumb}
                    alt={photo.title}
                    className="v2-cover-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Next album */}
      {nextAlbum && nextAlbum.id !== album.id && (
        <section className="v2-container v2-ghost-border-t" style={{ paddingTop: 64, paddingBottom: 64, marginTop: 64 }}>
          <Link href={`/v2/album/${nextAlbum.slug}`} className="v2-cover-img-link block grid grid-cols-12" style={{ gap: 32, alignItems: "center" }}>
            <div className="col-span-12 md:col-span-8" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p className="v2-label-caps" style={{ color: "var(--v2-gold)" }}>{locale === "fr" ? "Album suivant" : "Next Album"}</p>
              <h3 className="v2-headline-md" style={{ color: "var(--v2-cream)", fontSize: 40 }}>{nextAlbum.title}</h3>
              <p className="v2-bilingual" style={{ color: "var(--v2-cream-dim)" }}>{nextAlbum.location} · {formatDate(nextAlbum.date, locale)}</p>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="v2-ghost-border overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
                {nextAlbum.coverImage && (
                  <img
                    src={nextAlbum.coverImage}
                    alt={nextAlbum.title}
                    className="v2-cover-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
            </div>
          </Link>
        </section>
      )}
    </>
  );
}
