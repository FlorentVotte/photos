"use client";

import type { ChapterStats as ChapterStatsType } from "@/lib/types";
import { formatDistance } from "@/lib/geo-utils";
import { useLocale } from "@/lib/LocaleContext";

interface ChapterStatsProps {
  stats: ChapterStatsType;
  variant?: "compact" | "full";
}

export default function ChapterStats({
  stats,
  variant = "full",
}: ChapterStatsProps) {
  const { t } = useLocale();
  const { photoCount, photosWithGps, distanceKm, dateRange } = stats;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-base">
            photo_camera
          </span>
          {photoCount}
        </span>
        {distanceKm > 0 && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">route</span>
            {formatDistance(distanceKm)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4">
      {/* Photo count */}
      <div className="flex items-center gap-2 text-text-muted">
        <span className="material-symbols-outlined text-xl text-primary">
          photo_camera
        </span>
        <span className="text-foreground font-medium">{photoCount}</span>
        <span className="text-sm">{t("stats", "photos")}</span>
      </div>

      {/* Distance traveled */}
      {distanceKm > 0 && (
        <>
          <div className="w-px h-4 bg-surface-border hidden md:block" />
          <div className="flex items-center gap-2 text-text-muted">
            <span className="material-symbols-outlined text-xl text-primary">
              route
            </span>
            <span className="text-foreground font-medium">
              {formatDistance(distanceKm)}
            </span>
            <span className="text-sm">{t("stats", "traveled")}</span>
          </div>
        </>
      )}

      {/* Date range */}
      {dateRange && (
        <>
          <div className="w-px h-4 bg-surface-border hidden md:block" />
          <div className="flex items-center gap-2 text-text-muted">
            <span className="material-symbols-outlined text-xl text-primary">
              calendar_month
            </span>
            <span className="text-foreground font-medium">
              {dateRange.start === dateRange.end
                ? dateRange.start
                : `${dateRange.start} - ${dateRange.end}`}
            </span>
          </div>
        </>
      )}

      {/* GPS coverage indicator */}
      {photosWithGps > 0 && photosWithGps < photoCount && (
        <>
          <div className="w-px h-4 bg-surface-border hidden md:block" />
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <span className="material-symbols-outlined text-base">
              location_on
            </span>
            <span>
              {photosWithGps}/{photoCount} with GPS
            </span>
          </div>
        </>
      )}
    </div>
  );
}
