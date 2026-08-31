"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { GlobeHeroHandle } from "./GlobeHero";
import type { AlbumMarker } from "@/lib/types";

// three.js only arrives once the globe mounts. The left column is server
// rendered and the globe area shows the hero gradient until then, which the
// 1400ms ghGlobeIn fade absorbs.
const GlobeHero = dynamic(() => import("./GlobeHero"), { ssr: false });

interface GlobeHeroSectionProps {
  title: string;
  kicker?: string;
  tagline: string;
  ctaLink: string;
  markers: AlbumMarker[];
  activeSlug: string | null;
  onActivate: (slug: string) => void;
  onDeactivate: (slug: string) => void;
}

export default function GlobeHeroSection({
  title,
  kicker,
  tagline,
  ctaLink,
  markers,
  activeSlug,
  onActivate,
  onDeactivate,
}: GlobeHeroSectionProps) {
  const { t } = useLocale();
  const router = useRouter();
  const globe = useRef<GlobeHeroHandle | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const focusAlbum = (slug: string) => {
    onActivate(slug);
    globe.current?.focusOn(slug);
  };

  const releaseAlbum = (slug: string) => {
    onDeactivate(slug);
    globe.current?.releaseFocus();
  };

  return (
    <section className="globe-hero-surface relative w-full overflow-hidden">
      <div className="relative mx-auto grid min-h-[640px] w-full max-w-[1280px] grid-cols-1 items-center gap-0 px-0 lg:min-h-[720px] lg:grid-cols-[460px_1fr] lg:px-16">
        {/* Globe. First in DOM order on mobile so it sits above the copy, and
            reordered to the right-hand column from lg up. */}
        <div className="relative order-1 h-[400px] w-full lg:order-2 lg:h-[720px]">
          <div className="gh-globe-in absolute inset-0 lg:-inset-y-10 lg:-right-[120px] lg:left-0">
            <GlobeHero
              markers={markers}
              handleRef={globe}
              distance={isDesktop ? 2.9 : 3.0}
              tilt={isDesktop ? 0.3 : 0.26}
              hotspotSize={isDesktop ? 34 : 48}
              onMarkerEnter={(marker) => onActivate(marker.slug)}
              onMarkerLeave={(marker) => onDeactivate(marker.slug)}
              onMarkerClick={(marker) => router.push(`/album/${marker.slug}`)}
            />
          </div>
          {/* Fades the globe into the copy below on the stacked layout. */}
          <div
            aria-hidden="true"
            className="globe-hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-[120px] lg:hidden"
          />
        </div>

        {/* Editorial column */}
        <div className="relative z-[3] order-2 flex flex-col gap-[18px] px-5 pb-10 lg:order-1 lg:px-0 lg:py-20">
          {kicker && (
            <p
              className="gh-rise font-sans text-[11px] uppercase tracking-[0.32em] text-foreground/70 lg:text-xs"
              style={{ animationDuration: "900ms", animationDelay: "200ms" }}
            >
              {kicker}
            </p>
          )}

          <h1
            className="gh-rise font-display text-5xl font-semibold leading-[1.04] tracking-[-0.02em] text-foreground lg:text-[76px] lg:leading-[1.02]"
            style={{ animationDelay: "320ms" }}
          >
            {title}
          </h1>

          <p
            className="gh-rise font-display text-[17px] italic leading-[1.5] text-foreground/80 lg:text-xl"
            style={{ animationDelay: "420ms" }}
          >
            {tagline}
          </p>

          <Link
            href={ctaLink}
            className="gh-rise group/cta mt-[14px] inline-flex min-h-12 items-center gap-3 self-start rounded-full border border-white/40 bg-white/5 px-[26px] font-sans text-xs uppercase tracking-[0.24em] text-white backdrop-blur-[4px] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white hover:bg-white hover:text-background-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:min-h-0 lg:px-7 lg:py-[13px]"
            style={{ animationDelay: "540ms" }}
          >
            <span>{t("home", "viewAlbum")}</span>
            <span
              aria-hidden="true"
              className="text-base transition-transform duration-300 group-hover/cta:translate-x-1"
            >
              →
            </span>
          </Link>

          {markers.length > 0 && (
            <>
              <p
                className="gh-fade font-sans text-[10px] uppercase tracking-[0.24em] text-text-muted/75 lg:hidden"
                style={{ animationDelay: "900ms" }}
              >
                {t("home", "globeHint")}
              </p>

              <div
                className="gh-fade mt-6 flex flex-col gap-0.5 border-t border-surface-border pt-6 lg:mt-10"
                style={{ animationDelay: "800ms" }}
              >
                <p className="mb-2.5 font-sans text-[10px] uppercase tracking-[0.32em] text-text-muted">
                  {t("nav", "albums")}
                </p>
                {markers.map((marker) => (
                  <Link
                    key={marker.slug}
                    href={`/album/${marker.slug}`}
                    onPointerEnter={() => focusAlbum(marker.slug)}
                    onPointerLeave={() => releaseAlbum(marker.slug)}
                    onFocus={() => focusAlbum(marker.slug)}
                    onBlur={() => releaseAlbum(marker.slug)}
                    aria-current={activeSlug === marker.slug ? "true" : undefined}
                    className={`flex min-h-11 items-center justify-between gap-4 border-b border-surface-border/60 py-[7px] font-sans text-[13px] uppercase tracking-[0.16em] transition-[color,padding-left] duration-[220ms] ease-out hover:pl-2.5 lg:min-h-0 lg:items-baseline ${
                      activeSlug === marker.slug
                        ? "pl-2.5 text-white"
                        : "text-foreground/75 hover:text-white"
                    }`}
                  >
                    <span>{marker.label}</span>
                    <span className="font-sans text-[11px] text-text-muted/60">
                      {marker.year}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Keeps the copy legible where it crosses the globe. Desktop only —
            the stacked layout separates them already. */}
        <div
          aria-hidden="true"
          className="globe-hero-scrim pointer-events-none absolute inset-0 z-[2] hidden lg:block"
        />
      </div>
    </section>
  );
}
