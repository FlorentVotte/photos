"use client";

import Image from "next/image";
import { useLocale } from "@/lib/LocaleContext";

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

export default function AboutContent({
  photographerName,
  gear,
  journeyStats,
  socialLinks,
}: AboutContentProps) {
  const { t } = useLocale();

  const totalCameraPhotos = Math.max(
    gear.cameras.reduce((sum, c) => sum + c.count, 0),
    1
  );
  const totalLensPhotos = Math.max(
    gear.lenses.reduce((sum, l) => sum + l.count, 0),
    1
  );

  // Filter out placeholder links
  const validSocialLinks = Object.entries(socialLinks).filter(
    ([, url]) => url && url !== "#"
  );

  return (
    <main className="flex-1">
      {/* Hero Section with Portrait */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Portrait */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-xl" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30">
                <Image
                  src="/portrait.jpg"
                  alt={photographerName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Name and Bio */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t("about", "title")}{" "}
                <span className="text-primary italic font-serif">
                  {t("about", "me")}
                </span>
              </h1>
              <h2 className="text-xl md:text-2xl text-foreground font-medium mb-4">
                {photographerName}
              </h2>
              <p className="text-text-muted leading-relaxed max-w-xl">
                {t("about", "shortBio")}
              </p>

              {/* Social Links */}
              {validSocialLinks.length > 0 && (
                <div className="flex items-center gap-4 mt-6 justify-center md:justify-start">
                  <span className="text-sm text-text-muted">
                    {t("about", "followMe")}:
                  </span>
                  {validSocialLinks.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-primary transition-colors"
                      aria-label={platform}
                    >
                      {platform === "instagram" && (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      )}
                      {platform === "twitter" && (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {platform === "unsplash" && (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Stats */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-surface-dark/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary">explore</span>
            {t("about", "myJourney")}
            {journeyStats.dateRange && (
              <span className="text-text-muted font-normal text-base ml-2">
                {t("about", "since")} {journeyStats.dateRange.first}
              </span>
            )}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-surface-dark border border-surface-border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                photo_camera
              </span>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {journeyStats.totalPhotos.toLocaleString()}
              </div>
              <div className="text-sm text-text-muted mt-1">
                {t("about", "totalPhotos")}
              </div>
            </div>

            <div className="text-center p-6 rounded-xl bg-surface-dark border border-surface-border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                photo_library
              </span>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {journeyStats.totalAlbums}
              </div>
              <div className="text-sm text-text-muted mt-1">
                {t("about", "totalAlbums")}
              </div>
            </div>

            <div className="text-center p-6 rounded-xl bg-surface-dark border border-surface-border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                flag
              </span>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {journeyStats.countries.length}
              </div>
              <div className="text-sm text-text-muted mt-1">
                {t("about", "countries")}
              </div>
            </div>

            <div className="text-center p-6 rounded-xl bg-surface-dark border border-surface-border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                location_city
              </span>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {journeyStats.cities.length}
              </div>
              <div className="text-sm text-text-muted mt-1">
                {t("about", "cities")}
              </div>
            </div>
          </div>

          {/* Countries list */}
          {journeyStats.countries.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {journeyStats.countries.map((country) => (
                <span
                  key={country}
                  className="px-3 py-1 text-sm bg-surface-dark border border-surface-border rounded-full text-text-muted"
                >
                  {country}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gear Section */}
      {(gear.cameras.length > 0 || gear.lenses.length > 0) && (
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary">
                photo_camera
              </span>
              {t("about", "myGear")}
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Cameras */}
              {gear.cameras.length > 0 && (
                <div className="bg-surface-dark rounded-xl p-6 border border-surface-border">
                  <h4 className="text-sm text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      camera
                    </span>
                    {t("about", "cameras")}
                  </h4>
                  <ul className="space-y-4">
                    {gear.cameras.map((camera) => {
                      const percentage = (camera.count / totalCameraPhotos) * 100;
                      return (
                        <li key={camera.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-foreground text-sm font-medium">
                              {camera.name}
                            </span>
                            <span className="text-text-muted text-xs">
                              {camera.count} {t("about", "photos")}
                            </span>
                          </div>
                          <div className="h-2 bg-background-dark rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Lenses */}
              {gear.lenses.length > 0 && (
                <div className="bg-surface-dark rounded-xl p-6 border border-surface-border">
                  <h4 className="text-sm text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      circle
                    </span>
                    {t("about", "lenses")}
                  </h4>
                  <ul className="space-y-4">
                    {gear.lenses.slice(0, 5).map((lens) => {
                      const percentage = (lens.count / totalLensPhotos) * 100;
                      return (
                        <li key={lens.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-foreground text-sm font-medium truncate mr-2">
                              {lens.name}
                            </span>
                            <span className="text-text-muted text-xs whitespace-nowrap">
                              {lens.count} {t("about", "photos")}
                            </span>
                          </div>
                          <div className="h-2 bg-background-dark rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/70 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Bio Section */}
      <section className="py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-primary/50 text-4xl mb-4 block">
            format_quote
          </span>
          <p className="text-lg text-gray-300 leading-relaxed italic">
            {t("about", "bio")}
          </p>
        </div>
      </section>

      {/* Link to main site */}
      <section className="py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-text-muted mb-4">{t("about", "wantToKnowMore")}</p>
          <a
            href="https://www.votte.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-dark border border-surface-border text-foreground font-medium rounded-lg hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">open_in_new</span>
            {t("about", "visitSite")}
          </a>
        </div>
      </section>
    </main>
  );
}
