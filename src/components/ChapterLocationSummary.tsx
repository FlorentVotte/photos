"use client";

import type { LocationSummary } from "@/lib/types";
import { useLocale } from "@/lib/LocaleContext";
import { cleanLocationParts } from "@/lib/transformers";

interface ChapterLocationSummaryProps {
  locations: LocationSummary;
  compact?: boolean;
}

export default function ChapterLocationSummary({
  locations,
  compact = false,
}: ChapterLocationSummaryProps) {
  const { t } = useLocale();
  const cities = cleanLocationParts(...locations.cities);
  const countries = cleanLocationParts(...locations.countries);

  if (cities.length === 0 && countries.length === 0) {
    return (
      <p className="font-sans text-sm text-text-muted">
        {t("photo", "unknownLocation")}
      </p>
    );
  }

  const places = cities.length > 0 ? cities : countries;

  if (compact) {
    return (
      <p className="font-sans text-sm text-text-muted">
        {places.join(", ")}
      </p>
    );
  }

  return (
    <p className="text-center font-sans text-eyebrow uppercase text-text-muted">
      {places.join(" · ")}
      {cities.length > 0 && countries.length > 0 && (
        <>
          <span className="mx-3 text-text-muted/40">/</span>
          {countries.join(", ")}
        </>
      )}
    </p>
  );
}
