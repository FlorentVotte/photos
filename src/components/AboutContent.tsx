"use client";

import Image from "next/image";
import { useLocale } from "@/lib/LocaleContext";
import { localizeCountryNames } from "@/lib/country-names";

interface GearItem {
  name: string;
  count: number;
}

interface JourneyStats {
  totalPhotos: number;
  totalAlbums: number;
  countries: string[];
  cities: string[];
  dateRange: { first: string; last: string } | null;
}

interface SocialLinks {
  instagram?: string;
  twitter?: string;
  unsplash?: string;
}

interface AboutContentProps {
  photographerName: string;
  gear: {
    cameras: GearItem[];
    lenses: GearItem[];
  };
  journeyStats: JourneyStats;
  socialLinks: SocialLinks;
}

const SOCIAL_ICON_PATHS: Record<string, string> = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  unsplash: "M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z",
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-3xl md:text-4xl font-semibold tabular-nums leading-none text-foreground">
        {value}
      </span>
      <span className="font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted">
        {label}
      </span>
    </div>
  );
}

export default function AboutContent({
  photographerName,
  gear,
  journeyStats,
  socialLinks,
}: AboutContentProps) {
  const { t, locale } = useLocale();

  const validSocialLinks = Object.entries(socialLinks).filter(
    ([, url]) => url && url !== "#"
  );

  return (
    <main className="flex-1 px-6 pt-20 pb-12 md:px-12 md:pt-28">
      <div className="mx-auto max-w-[1100px]">
        {/* Header — name, role, bio, portrait */}
        <section className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_280px] md:gap-16">
          <div className="flex flex-col gap-6">
            <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
              {t("about", "title")}
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
              {photographerName}
            </h1>
            <p className="max-w-xl font-sans text-base md:text-lg leading-relaxed text-text-muted">
              {t("about", "shortBio")}
            </p>

            {validSocialLinks.length > 0 && (
              <div className="mt-2 flex items-center gap-5">
                {validSocialLinks.map(([platform, url]) => {
                  const path = SOCIAL_ICON_PATHS[platform];
                  if (!path) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-foreground transition-colors"
                      aria-label={platform}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d={path} />
                      </svg>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden md:justify-self-end">
            <Image
              src="/portrait.jpg"
              alt={photographerName}
              fill
              className="object-cover grayscale-[0.15]"
              priority
            />
          </div>
        </section>

        <hr className="my-20 border-t border-surface-border" />

        {/* Journey — stats row + countries list */}
        <section className="flex flex-col gap-10">
          <header className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              {t("about", "myJourney")}
            </h2>
            {journeyStats.dateRange && (
              <p className="font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted">
                {t("about", "since")} {journeyStats.dateRange.first}
              </p>
            )}
          </header>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            <Stat
              value={journeyStats.totalPhotos.toLocaleString()}
              label={t("about", "totalPhotos")}
            />
            <Stat
              value={String(journeyStats.totalAlbums)}
              label={t("about", "totalAlbums")}
            />
            <Stat
              value={String(journeyStats.countries.length)}
              label={t("about", "countries")}
            />
            <Stat
              value={String(journeyStats.cities.length)}
              label={t("about", "cities")}
            />
          </div>

          {journeyStats.countries.length > 0 && (
            <p className="max-w-3xl font-sans text-sm md:text-base leading-relaxed text-text-muted">
              {localizeCountryNames(journeyStats.countries, locale).join(" · ")}
            </p>
          )}
        </section>

        {(gear.cameras.length > 0 || gear.lenses.length > 0) && (
          <>
            <hr className="my-20 border-t border-surface-border" />

            {/* Gear — two-column typographic list, no progress bars */}
            <section className="flex flex-col gap-10">
              <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                {t("about", "myGear")}
              </h2>

              <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
                {gear.cameras.length > 0 && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
                      {t("about", "cameras")}
                    </h3>
                    <ul className="flex flex-col divide-y divide-surface-border/60">
                      {gear.cameras.map((camera) => (
                        <li
                          key={camera.name}
                          className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <span className="font-sans text-sm md:text-base text-foreground">
                            {camera.name}
                          </span>
                          <span className="font-sans text-[12px] uppercase tracking-[0.2em] tabular-nums text-text-muted">
                            {camera.count} {t("about", "photos")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {gear.lenses.length > 0 && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
                      {t("about", "lenses")}
                    </h3>
                    <ul className="flex flex-col divide-y divide-surface-border/60">
                      {gear.lenses.slice(0, 5).map((lens) => (
                        <li
                          key={lens.name}
                          className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <span className="font-sans text-sm md:text-base text-foreground truncate">
                            {lens.name}
                          </span>
                          <span className="whitespace-nowrap font-sans text-[12px] uppercase tracking-[0.2em] tabular-nums text-text-muted">
                            {lens.count} {t("about", "photos")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <hr className="my-20 border-t border-surface-border" />

        {/* Closing — quote + outbound link */}
        <section className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xl md:text-2xl italic leading-snug tracking-tight text-foreground/90">
            &ldquo;{t("about", "bio")}&rdquo;
          </p>
          <p className="mt-10 font-sans text-sm text-text-muted">
            {t("about", "wantToKnowMore")}
          </p>
          <a
            href="https://www.votte.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta mt-5 inline-flex items-center gap-3 font-sans text-sm uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
          >
            <span>{t("about", "visitSite")}</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </a>
        </section>
      </div>
    </main>
  );
}
