import type { LocationSummary } from "@/lib/types";

interface ChapterLocationSummaryProps {
  locations: LocationSummary;
  compact?: boolean;
}

export default function ChapterLocationSummary({
  locations,
  compact = false,
}: ChapterLocationSummaryProps) {
  const { cities, countries } = locations;

  if (cities.length === 0 && countries.length === 0) {
    return null;
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
