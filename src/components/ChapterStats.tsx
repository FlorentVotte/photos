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

  const parts: string[] = [];

  parts.push(`${photoCount} ${t("stats", "photos")}`);

  if (distanceKm > 0) {
    parts.push(`${formatDistance(distanceKm)} ${t("stats", "traveled")}`);
  }

  if (dateRange) {
    parts.push(
      dateRange.start === dateRange.end
        ? dateRange.start
        : `${dateRange.start} – ${dateRange.end}`
    );
  }

  if (variant === "compact") {
    return (
      <p className="font-sans text-sm text-text-muted">{parts.join(" · ")}</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-2 text-center">
      <p className="font-sans text-eyebrow uppercase text-text-muted">
        {parts.join("  ·  ")}
      </p>
      {photosWithGps > 0 && photosWithGps < photoCount && (
        <p className="font-sans text-micro uppercase text-text-muted/60">
          {photosWithGps}/{photoCount} with GPS
        </p>
      )}
    </div>
  );
}
