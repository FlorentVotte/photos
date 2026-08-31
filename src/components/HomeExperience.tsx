"use client";

import { useState } from "react";
import GlobeHeroSection from "./GlobeHeroSection";
import HomeContent from "./HomeContent";
import { useLocale } from "@/lib/LocaleContext";
import type { Album, AlbumMarker } from "@/lib/types";

interface HomeExperienceProps {
  featuredAlbum?: Album;
  recentAlbums: Album[];
  markers: AlbumMarker[];
}

/**
 * Owns the one piece of state the hero and the album grid share: which album is
 * currently under the pointer. A globe marker or a hero index row sets it, and
 * the matching card in Recent Albums lights up — which is why both sections sit
 * inside a single client component rather than being composed separately in
 * page.tsx.
 */
export default function HomeExperience({
  featuredAlbum,
  recentAlbums,
  markers,
}: HomeExperienceProps) {
  const { t } = useLocale();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Clearing is conditional on the slug still being the active one. A pointer
  // moving from an index row onto that album's globe marker fires the marker's
  // pointerenter before the row's mouseleave — the browser dispatches every
  // pointer event ahead of the compatibility mouse events — so an
  // unconditional clear would wipe out the selection that just arrived.
  const activate = (slug: string) => setActiveSlug(slug);
  const deactivate = (slug: string) =>
    setActiveSlug((current) => (current === slug ? null : current));

  const kicker = featuredAlbum
    ? [featuredAlbum.location, featuredAlbum.date].filter(Boolean).join(" — ")
    : undefined;

  return (
    <>
      {featuredAlbum && (
        <GlobeHeroSection
          title={featuredAlbum.title}
          kicker={kicker}
          // The handoff specifies the site tagline here, not the album's own
          // subtitle — the standfirst stays constant while the headline changes
          // with the featured album.
          tagline={t("home", "tagline")}
          ctaLink={`/album/${featuredAlbum.slug}`}
          markers={markers}
          activeSlug={activeSlug}
          onActivate={activate}
          onDeactivate={deactivate}
        />
      )}

      <div className="flex flex-1 justify-center">
        <div className="flex w-full max-w-[1200px] flex-col px-4 lg:px-8">
          <HomeContent recentAlbums={recentAlbums} activeSlug={activeSlug} />
        </div>
      </div>
    </>
  );
}
