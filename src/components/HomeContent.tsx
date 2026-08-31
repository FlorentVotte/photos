"use client";

import Link from "next/link";
import AlbumCard from "./AlbumCard";
import { useLocale } from "@/lib/LocaleContext";
import { useReveal } from "@/hooks/useReveal";
import type { Album } from "@/lib/types";

interface HomeContentProps {
  recentAlbums: Album[];
  /** Album currently pointed at on the home globe, if any. */
  activeSlug?: string | null;
}

// Cards reveal in rows of three, staggered left to right.
const REVEAL_STAGGER_MS = [0, 90, 180];

export default function HomeContent({
  recentAlbums,
  activeSlug = null,
}: HomeContentProps) {
  const { t } = useLocale();
  const quoteRef = useReveal<HTMLElement>();
  const headingRef = useReveal<HTMLElement>();

  return (
    <>
      {/* Quote / colophon */}
      <section
        ref={quoteRef}
        className="gh-reveal border-b border-surface-border px-4 py-14 text-center md:py-24"
      >
        <p className="mx-auto max-w-2xl font-display text-2xl italic leading-snug tracking-tight text-foreground/90 md:text-[2rem]">
          &ldquo;{t("home", "quote")}&rdquo;
        </p>
        <div
          aria-hidden="true"
          className="gh-rule mx-auto mt-[22px] h-px bg-primary md:mt-7"
        />
        <p className="mt-5 font-sans text-eyebrow uppercase text-text-muted">
          {t("home", "quoteAuthor")}
        </p>
        <p className="mx-auto mt-9 max-w-xl font-sans text-sm leading-[1.7] text-foreground/50">
          {t("home", "tagline")}
        </p>
      </section>

      {/* Albums */}
      <section id="albums" className="pt-14 md:pt-24">
        <header
          ref={headingRef}
          className="gh-reveal px-1 pb-10 md:pb-14"
        >
          <h2 className="font-display text-3xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-4xl">
            {t("home", "recentAlbums")}
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {recentAlbums.slice(0, 5).map((album, index) => (
            <RevealedCard
              key={album.id}
              album={album}
              index={index}
              highlighted={activeSlug === album.slug}
              featuredLabel={index === 0 ? t("home", "featuredStory") : undefined}
            />
          ))}
        </div>

        <div className="flex justify-center pt-12 pb-4 md:justify-end md:pr-1">
          <Link
            href="/albums"
            className="group/cta inline-flex min-h-11 items-center gap-3 font-sans text-sm uppercase tracking-[0.24em] text-text-muted transition-colors hover:text-foreground md:min-h-0"
          >
            <span>{t("home", "viewArchive")}</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </Link>
        </div>
      </section>
    </>
  );
}

function RevealedCard({
  album,
  index,
  highlighted,
  featuredLabel,
}: {
  album: Album;
  index: number;
  highlighted: boolean;
  featuredLabel?: string;
}) {
  const ref = useReveal<HTMLAnchorElement>();

  return (
    <AlbumCard
      ref={ref}
      album={album}
      variant={index === 0 ? "large" : index === 1 ? "portrait" : "square"}
      featuredLabel={featuredLabel}
      highlighted={highlighted}
      className="gh-reveal"
      style={{ transitionDelay: `${REVEAL_STAGGER_MS[index % 3]}ms` }}
    />
  );
}
