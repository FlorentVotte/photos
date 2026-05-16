"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import type { Album } from "@/lib/types";

interface Props {
  featuredAlbum?: Album;
  recentAlbums: Album[];
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

export default function V2HomeContent({ featuredAlbum, recentAlbums }: Props) {
  const { locale } = useLocale();

  return (
    <>
      {/* Featured album hero — full viewport */}
      {featuredAlbum && (
        <section className="relative flex items-end overflow-hidden" style={{ height: "100vh", width: "100%" }}>
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            {featuredAlbum.coverImage && (
              <img
                src={featuredAlbum.coverImage}
                alt={featuredAlbum.title}
                className="v2-cover-img"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, var(--v2-bg) 0%, transparent 50%, transparent 100%)" }}
            />
          </div>

          <div className="relative v2-container w-full grid grid-cols-12" style={{ zIndex: 10, paddingBottom: 96 }}>
            <div className="col-span-12 md:col-span-8 flex flex-col" style={{ gap: 8 }}>
              <div className="flex flex-wrap items-center" style={{ gap: 12, marginBottom: 8 }}>
                {featuredAlbum.location && (
                  <span className="v2-label-caps v2-ghost-border" style={{ padding: "6px 12px", color: "var(--v2-cream-dim)" }}>
                    {featuredAlbum.location}
                  </span>
                )}
                {featuredAlbum.date && (
                  <span className="v2-label-caps v2-ghost-border" style={{ padding: "6px 12px", color: "var(--v2-cream-dim)" }}>
                    {formatDate(featuredAlbum.date, locale)}
                  </span>
                )}
              </div>
              <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)" }}>
                {featuredAlbum.title}
              </h1>
              {featuredAlbum.subtitle && (
                <p className="v2-body-lg" style={{ color: "var(--v2-cream-dim)", maxWidth: 580 }}>
                  {featuredAlbum.subtitle}
                </p>
              )}
              <div style={{ marginTop: 24 }}>
                <Link href={`/v2/album/${featuredAlbum.slug}`} className="v2-btn-ghost">
                  {locale === "fr" ? "Voir l'album" : "View Album"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tagline */}
      <section className="v2-section-gap v2-container flex justify-center items-center">
        <div style={{ maxWidth: 720, textAlign: "center" }}>
          <p className="v2-headline-md" style={{ color: "var(--v2-cream)", fontStyle: "italic" }}>
            &ldquo;Photography is the beauty of life, captured.&rdquo;
          </p>
          <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)", opacity: 0.6, marginTop: 16 }}>
            La photographie est la beauté de la vie, capturée.
          </p>
          <div style={{ width: 1, height: 48, background: "var(--v2-outline-variant)", opacity: 0.4, margin: "32px auto 0" }} />
        </div>
      </section>

      {/* Recent albums — asymmetric monograph grid */}
      <section className="v2-container" style={{ paddingBottom: 160 }}>
        <div className="flex justify-between items-end" style={{ marginBottom: 64, gap: 24 }}>
          <div>
            <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 8 }}>
              {locale === "fr" ? "Œuvres sélectionnées" : "Selected Works"}
            </p>
            <h2 className="v2-headline-md" style={{ color: "var(--v2-cream)" }}>
              {locale === "fr" ? "Explorations récentes" : "Recent Explorations"}
            </h2>
          </div>
          <Link
            href="/v2/albums"
            className="v2-label-caps flex items-center"
            style={{ color: "var(--v2-cream-dim)", gap: 8, whiteSpace: "nowrap" }}
          >
            {locale === "fr" ? "Voir l'archive" : "View Archive"}
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-12" style={{ gap: 32 }}>
          {recentAlbums.map((album, i) => {
            // Asymmetric layout: alternate sizes and vertical offsets
            const layouts = [
              { span: "md:col-span-7", aspect: "16 / 10", offset: "" },
              { span: "md:col-span-5", aspect: "4 / 5", offset: "md:mt-24" },
              { span: "md:col-span-4", aspect: "1 / 1", offset: "" },
              { span: "md:col-span-4", aspect: "1 / 1", offset: "md:-mt-12" },
              { span: "md:col-span-4", aspect: "1 / 1", offset: "md:mt-12" },
            ];
            const l = layouts[i] ?? layouts[layouts.length - 1];
            return (
              <Link
                key={album.id}
                href={`/v2/album/${album.slug}`}
                className={`col-span-12 ${l.span} ${l.offset} v2-cover-img-link group block`}
              >
                <div className="v2-ghost-border overflow-hidden" style={{ aspectRatio: l.aspect, marginBottom: 24 }}>
                  {album.coverImage && (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="v2-cover-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="flex justify-between items-start" style={{ gap: 16 }}>
                  <div>
                    <h3 className="v2-body-lg" style={{ color: "var(--v2-cream)" }}>
                      {album.title}
                      {album.subtitle && (
                        <span className="v2-bilingual" style={{ marginLeft: 8 }}>
                          / {album.subtitle}
                        </span>
                      )}
                    </h3>
                    <p className="v2-bilingual" style={{ color: "var(--v2-cream-dim)", marginTop: 4 }}>
                      {album.location}
                      {album.date ? `, ${formatDate(album.date, locale)}` : ""}
                    </p>
                  </div>
                  <span className="v2-label-caps" style={{ color: "var(--v2-outline)", whiteSpace: "nowrap" }}>
                    {album.photoCount} {locale === "fr" ? "Photos" : "Photos"}
                  </span>
                </div>
              </Link>
            );
          })}
          {recentAlbums.length === 0 && (
            <p className="col-span-12 v2-body-md" style={{ color: "var(--v2-cream-dim)", textAlign: "center" }}>
              {locale === "fr" ? "Aucun album disponible pour l'instant." : "No albums to show yet."}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
