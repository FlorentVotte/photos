"use client";

import { useLocale } from "@/lib/LocaleContext";

interface Gear {
  cameras: { name: string; count: number }[];
  lenses: { name: string; count: number }[];
}

interface JourneyStats {
  totalPhotos: number;
  totalAlbums: number;
  countries: string[];
  cities: string[];
  dateRange: { first: string; last: string } | null;
}

interface Props {
  photographerName: string;
  gear: Gear;
  journeyStats: JourneyStats;
  socialLinks: { instagram?: string; twitter?: string; unsplash?: string };
}

export default function V2AboutContent({ photographerName, gear, journeyStats, socialLinks }: Props) {
  const { locale } = useLocale();

  return (
    <div className="v2-container" style={{ paddingTop: 160, paddingBottom: 160 }}>
      <div className="grid grid-cols-12" style={{ gap: 64, marginBottom: 96 }}>
        <div className="col-span-12 md:col-span-2">
          <p className="v2-label-caps" style={{ color: "var(--v2-gold)" }}>
            {locale === "fr" ? "À propos" : "About"}
          </p>
        </div>
        <div className="col-span-12 md:col-span-7">
          <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", marginBottom: 32 }}>
            {photographerName}
          </h1>
          <p className="v2-body-lg" style={{ color: "var(--v2-cream-dim)" }}>
            {locale === "fr"
              ? "Un voyage à travers le monde, capturé image par image. Photographies de moments fugaces entre départs et arrivées."
              : "A journey across the world, captured one image at a time. Photographs of fleeting moments between departures and arrivals."}
          </p>
        </div>
      </div>

      <section style={{ marginBottom: 96 }}>
        <h2 className="v2-headline-md v2-ghost-border-b" style={{ color: "var(--v2-cream)", paddingBottom: 16, marginBottom: 32 }}>
          {locale === "fr" ? "Le voyage en chiffres" : "The journey in numbers"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 32 }}>
          <div>
            <p className="v2-display-lg" style={{ color: "var(--v2-cream)", fontSize: 48 }}>
              {journeyStats.totalPhotos}
            </p>
            <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)" }}>
              {locale === "fr" ? "Photographies" : "Photographs"}
            </p>
          </div>
          <div>
            <p className="v2-display-lg" style={{ color: "var(--v2-cream)", fontSize: 48 }}>
              {journeyStats.totalAlbums}
            </p>
            <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)" }}>
              {locale === "fr" ? "Albums" : "Albums"}
            </p>
          </div>
          <div>
            <p className="v2-display-lg" style={{ color: "var(--v2-cream)", fontSize: 48 }}>
              {journeyStats.countries.length}
            </p>
            <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)" }}>
              {locale === "fr" ? "Pays" : "Countries"}
            </p>
          </div>
          <div>
            <p className="v2-display-lg" style={{ color: "var(--v2-cream)", fontSize: 48 }}>
              {journeyStats.cities.length}
            </p>
            <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)" }}>
              {locale === "fr" ? "Villes" : "Cities"}
            </p>
          </div>
        </div>
        {journeyStats.dateRange && (
          <p className="v2-bilingual" style={{ color: "var(--v2-cream-dim)", marginTop: 32 }}>
            {locale === "fr" ? "De" : "From"} {journeyStats.dateRange.first} {locale === "fr" ? "à" : "to"} {journeyStats.dateRange.last}
          </p>
        )}
      </section>

      {(gear.cameras.length > 0 || gear.lenses.length > 0) && (
        <section style={{ marginBottom: 96 }}>
          <h2 className="v2-headline-md v2-ghost-border-b" style={{ color: "var(--v2-cream)", paddingBottom: 16, marginBottom: 32 }}>
            {locale === "fr" ? "Matériel" : "Gear"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 48 }}>
            {gear.cameras.length > 0 && (
              <div>
                <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
                  {locale === "fr" ? "Boîtiers" : "Cameras"}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {gear.cameras.map((c) => (
                    <li key={c.name} className="v2-ghost-border-t flex justify-between" style={{ paddingTop: 12 }}>
                      <span className="v2-body-md" style={{ color: "var(--v2-cream)" }}>{c.name}</span>
                      <span className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>{c.count} photos</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {gear.lenses.length > 0 && (
              <div>
                <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
                  {locale === "fr" ? "Objectifs" : "Lenses"}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {gear.lenses.map((l) => (
                    <li key={l.name} className="v2-ghost-border-t flex justify-between" style={{ paddingTop: 12 }}>
                      <span className="v2-body-md" style={{ color: "var(--v2-cream)" }}>{l.name}</span>
                      <span className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>{l.count} photos</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {(socialLinks.instagram || socialLinks.twitter || socialLinks.unsplash) && (
        <section>
          <h2 className="v2-headline-md v2-ghost-border-b" style={{ color: "var(--v2-cream)", paddingBottom: 16, marginBottom: 32 }}>
            {locale === "fr" ? "Liens" : "Links"}
          </h2>
          <div className="flex flex-wrap" style={{ gap: 24 }}>
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="v2-btn-ghost">Instagram</a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="v2-btn-ghost">Twitter</a>
            )}
            {socialLinks.unsplash && (
              <a href={socialLinks.unsplash} target="_blank" rel="noreferrer" className="v2-btn-ghost">Unsplash</a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
