"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import type { Album } from "@/lib/types";

function getYear(date: string): string {
  if (!date) return "—";
  const d = new Date(date);
  if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
  const match = date.match(/\d{4}/);
  return match ? match[0] : "—";
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

export default function V2AlbumsContent({ albums }: { albums: Album[] }) {
  const { locale } = useLocale();

  const byYear = new Map<string, Album[]>();
  for (const a of albums) {
    const y = getYear(a.date);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(a);
  }
  const years = [...byYear.keys()].sort((a, b) => (a < b ? 1 : -1));
  const totalPhotos = albums.reduce((s, a) => s + (a.photoCount || 0), 0);

  return (
    <div className="v2-container" style={{ paddingTop: 160, paddingBottom: 160 }}>
      <div style={{ marginBottom: 80 }}>
        <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
          {locale === "fr" ? "L'archive" : "The Archive"}
        </p>
        <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", marginBottom: 24 }}>
          {locale === "fr" ? "Tous les voyages" : "Every Journey"}
        </h1>
        <p className="v2-body-lg" style={{ color: "var(--v2-cream-dim)", maxWidth: 640 }}>
          {locale === "fr"
            ? `${albums.length} albums · ${totalPhotos} photographies à travers les années.`
            : `${albums.length} albums · ${totalPhotos} photographs across the years.`}
        </p>
      </div>

      {years.map((year) => (
        <section key={year} style={{ marginBottom: 96 }}>
          <div className="flex items-baseline v2-ghost-border-b" style={{ gap: 24, marginBottom: 48, paddingBottom: 16 }}>
            <h2 className="v2-display-lg" style={{ color: "var(--v2-cream)", fontSize: 48 }}>
              {year}
            </h2>
            <span className="v2-label-caps" style={{ color: "var(--v2-cream-dim)" }}>
              {byYear.get(year)!.length} {locale === "fr" ? "Albums" : "Albums"}
            </span>
          </div>
          <div className="grid grid-cols-12" style={{ gap: 32, columnGap: 32, rowGap: 64 }}>
            {byYear.get(year)!.map((album, i) => (
              <Link
                key={album.id}
                href={`/v2/album/${album.slug}`}
                className="v2-cover-img-link block"
                style={{ gridColumn: i % 2 === 0 ? "span 7 / span 7" : "span 5 / span 5" }}
              >
                <div className="v2-ghost-border overflow-hidden" style={{ aspectRatio: i % 2 === 0 ? "16 / 10" : "4 / 5", marginBottom: 24 }}>
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
                    <h3 className="v2-headline-md" style={{ color: "var(--v2-cream)", fontSize: 24 }}>
                      {album.title}
                    </h3>
                    {album.subtitle && (
                      <p className="v2-bilingual" style={{ color: "var(--v2-cream-dim)" }}>
                        {album.subtitle}
                      </p>
                    )}
                    <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)", marginTop: 8 }}>
                      {album.location} · {formatDate(album.date, locale)}
                    </p>
                  </div>
                  <span className="v2-label-caps" style={{ color: "var(--v2-outline)", whiteSpace: "nowrap" }}>
                    {album.photoCount} photos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {albums.length === 0 && (
        <p className="v2-body-md" style={{ color: "var(--v2-cream-dim)", textAlign: "center" }}>
          {locale === "fr" ? "Aucun album disponible." : "No albums available."}
        </p>
      )}
    </div>
  );
}
