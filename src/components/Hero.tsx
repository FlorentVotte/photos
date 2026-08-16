"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage: string;
  kicker?: string;
  ctaLink?: string;
}

export default function Hero({
  title,
  subtitle,
  description,
  backgroundImage,
  kicker,
  ctaLink,
}: HeroProps) {
  const { t } = useLocale();

  return (
    <section
      className="relative w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.15) 45%, rgba(0, 0, 0, 0.7) 100%), url("${backgroundImage}")`,
      }}
      aria-label={title}
    >
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] flex-col justify-end px-6 pb-16 pt-40 md:px-12 lg:min-h-[80vh] lg:pb-24">
        <div className="flex max-w-2xl flex-col gap-4 text-left">
          {kicker && (
            <p className="font-sans text-eyebrow uppercase text-white/70">
              {kicker}
            </p>
          )}

          <h1 className="text-foreground text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-white/80 text-lg md:text-xl font-normal italic font-display">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="max-w-xl text-white/70 text-base md:text-lg font-normal leading-relaxed font-sans">
              {description}
            </p>
          )}

          {ctaLink && (
            <Link
              href={ctaLink}
              className="group/cta mt-6 inline-flex items-center gap-3 self-start rounded-full border border-white/40 bg-white/5 px-7 py-3 font-sans text-xs uppercase tracking-[0.24em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-background-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>{t("home", "viewAlbum")}</span>
              <span
                aria-hidden="true"
                className="text-base transition-transform duration-300 group-hover/cta:translate-x-1"
              >
                →
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
