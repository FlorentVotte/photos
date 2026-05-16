"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useLocale } from "@/lib/LocaleContext";
import type { Photo } from "@/lib/types";

const V2LeafletMap = dynamic(() => import("./V2LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="v2-ghost-border" style={{ height: "70vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--v2-cream-dim)" }}>
      Loading map…
    </div>
  ),
});

interface Props {
  photos: Photo[];
}

export default function V2MapContent({ photos }: Props) {
  const { locale } = useLocale();
  const geocoded = photos.filter((p) => {
    const lat = p.metadata.latitude ?? p.metadata.gps?.lat;
    const lng = p.metadata.longitude ?? p.metadata.gps?.lng;
    return lat != null && lng != null;
  });
  const countries = new Set<string>();
  for (const p of geocoded) {
    const loc = p.metadata.location || "";
    const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) countries.add(parts[parts.length - 1]);
  }

  return (
    <div className="v2-container" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div style={{ marginBottom: 48 }}>
        <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
          {locale === "fr" ? "Géographie" : "Geography"}
        </p>
        <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", marginBottom: 24 }}>
          {locale === "fr" ? "Le monde, vu d'ici" : "The world, from here"}
        </h1>
        <p className="v2-body-lg" style={{ color: "var(--v2-cream-dim)", maxWidth: 640 }}>
          {locale === "fr"
            ? `${geocoded.length} photographies géolocalisées à travers ${countries.size} pays.`
            : `${geocoded.length} geocoded photographs across ${countries.size} countries.`}
        </p>
      </div>

      <V2LeafletMap photos={geocoded} />

      {Array.from(countries).length > 0 && (
        <div style={{ marginTop: 64 }}>
          <h2 className="v2-headline-md v2-ghost-border-b" style={{ color: "var(--v2-cream)", paddingBottom: 16, marginBottom: 32 }}>
            {locale === "fr" ? "Pays" : "Countries"}
          </h2>
          <div className="flex flex-wrap" style={{ gap: 12 }}>
            {Array.from(countries).sort().map((c) => (
              <span key={c} className="v2-label-caps v2-ghost-border" style={{ padding: "8px 16px", color: "var(--v2-cream-dim)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
