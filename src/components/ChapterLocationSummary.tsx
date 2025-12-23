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

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="material-symbols-outlined text-base">location_on</span>
        <span>{cities.length > 0 ? cities.join(", ") : countries.join(", ")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-2">
      {/* Cities */}
      {cities.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">
            location_on
          </span>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <span
                key={city}
                className="px-3 py-1 bg-surface-dark rounded-full text-sm text-white border border-surface-border"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      {cities.length > 0 && countries.length > 0 && (
        <div className="w-px h-4 bg-surface-border" />
      )}

      {/* Countries */}
      {countries.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">
            flag
          </span>
          <span className="text-text-muted text-sm">
            {countries.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}
