"use client";

import { useLocale } from "@/lib/LocaleContext";
import { Chapter } from "@/lib/types";
import { MagazineDay, formatMagazineDate } from "@/lib/magazine-utils";

interface MagazineSectionHeaderProps {
  section:
    | { type: "chapter"; chapter: Chapter; index: number }
    | { type: "day"; day: MagazineDay; index: number };
}

export default function MagazineSectionHeader({
  section,
}: MagazineSectionHeaderProps) {
  const { locale, t } = useLocale();

  if (section.type === "chapter") {
    const { chapter, index } = section;
    const title =
      locale === "fr" && chapter.titleFr ? chapter.titleFr : chapter.title;

    return (
      <header className="py-12 md:py-16 text-center">
        {/* Chapter number */}
        <div className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
          {t("album", "chapter")} {index + 1}
        </div>

        {/* Title with decorative lines */}
        <div className="flex items-center justify-center gap-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-surface-border" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground">
            {title}
          </h2>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-surface-border" />
        </div>

        {/* Photo count */}
        <div className="mt-4 text-text-muted text-sm">
          {chapter.photos.length} {t("stats", "photos").toLowerCase()}
        </div>
      </header>
    );
  }

  // Day section
  const { day, index } = section;
  const displayDate = formatMagazineDate(day.date, locale);

  return (
    <header className="py-12 md:py-16 text-center">
      {/* Day number */}
      <div className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
        {t("magazine", "day")} {index + 1}
      </div>

      {/* Date with decorative lines */}
      <div className="flex items-center justify-center gap-6">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-surface-border" />
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-foreground">
          {displayDate}
        </h2>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-surface-border" />
      </div>

      {/* Location info */}
      {(day.city || day.location) && (
        <div className="mt-4 flex items-center justify-center gap-2 text-text-muted">
          <span className="material-symbols-outlined text-base">
            location_on
          </span>
          <span className="text-sm">
            {day.city && day.location
              ? `${day.city}, ${day.location}`
              : day.city || day.location}
          </span>
        </div>
      )}

      {/* Photo count */}
      <div className="mt-2 text-text-muted text-sm">
        {day.photos.length} {t("stats", "photos").toLowerCase()}
      </div>
    </header>
  );
}
