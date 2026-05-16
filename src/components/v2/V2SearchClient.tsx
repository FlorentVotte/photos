"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import type { Album, Photo } from "@/lib/types";

interface Props {
  albums: Album[];
  photos: Photo[];
}

type Mode = "all" | "albums" | "photos";

export default function V2SearchClient({ albums, photos }: Props) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("all");
  const [location, setLocation] = useState("");
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");

  const locations = useMemo(() => {
    const s = new Set<string>();
    for (const p of photos) {
      if (p.metadata.location) s.add(p.metadata.location);
    }
    for (const a of albums) if (a.location) s.add(a.location);
    return Array.from(s).sort();
  }, [photos, albums]);

  const cameras = useMemo(() => {
    const s = new Set<string>();
    for (const p of photos) if (p.metadata.camera) s.add(p.metadata.camera);
    return Array.from(s).sort();
  }, [photos]);

  const lenses = useMemo(() => {
    const s = new Set<string>();
    for (const p of photos) if (p.metadata.lens) s.add(p.metadata.lens);
    return Array.from(s).sort();
  }, [photos]);

  const q = query.trim().toLowerCase();

  const matchedAlbums = useMemo(() => {
    if (mode === "photos") return [];
    return albums.filter((a) => {
      if (location && a.location !== location) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.subtitle?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      );
    });
  }, [albums, mode, location, q]);

  const matchedPhotos = useMemo(() => {
    if (mode === "albums") return [];
    return photos.filter((p) => {
      if (location && p.metadata.location !== location) return false;
      if (camera && p.metadata.camera !== camera) return false;
      if (lens && p.metadata.lens !== lens) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.caption?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.metadata.location || "").toLowerCase().includes(q)
      );
    });
  }, [photos, mode, location, camera, lens, q]);

  const total = matchedAlbums.length + matchedPhotos.length;

  return (
    <div className="v2-container" style={{ paddingTop: 160, paddingBottom: 160 }}>
      <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
        {locale === "fr" ? "Recherche" : "Search"}
      </p>
      <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", marginBottom: 48 }}>
        {locale === "fr" ? "Explorer" : "Explore"}
      </h1>

      <div style={{ marginBottom: 32 }}>
        <input
          type="text"
          placeholder={locale === "fr" ? "Titre, lieu, légende…" : "Title, location, caption…"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="v2-body-lg w-full"
          style={{
            background: "transparent",
            color: "var(--v2-cream)",
            border: "none",
            borderBottom: "1px solid var(--v2-gold)",
            padding: "16px 0",
            outline: "none",
            fontSize: 24,
            fontFamily: "var(--v2-font-display)",
            fontStyle: "italic",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center" style={{ gap: 16, marginBottom: 32 }}>
        {(["all", "albums", "photos"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="v2-label-caps"
            style={{
              padding: "8px 16px",
              background: mode === m ? "var(--v2-cream)" : "transparent",
              color: mode === m ? "var(--v2-bg)" : "var(--v2-cream-dim)",
              border: "1px solid var(--v2-ghost)",
              cursor: "pointer",
            }}
          >
            {locale === "fr"
              ? m === "all" ? "Tout" : m === "albums" ? "Albums" : "Photos"
              : m === "all" ? "All" : m === "albums" ? "Albums" : "Photos"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap" style={{ gap: 16, marginBottom: 48 }}>
        <Select label={locale === "fr" ? "Lieu" : "Location"} value={location} onChange={setLocation} options={locations} />
        <Select label={locale === "fr" ? "Boîtier" : "Camera"} value={camera} onChange={setCamera} options={cameras} />
        <Select label={locale === "fr" ? "Objectif" : "Lens"} value={lens} onChange={setLens} options={lenses} />
      </div>

      <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)", marginBottom: 48 }}>
        {total} {locale === "fr" ? "Résultats" : "Results"}
      </p>

      {matchedAlbums.length > 0 && (
        <section style={{ marginBottom: 64 }}>
          <h2 className="v2-headline-md v2-ghost-border-b" style={{ color: "var(--v2-cream)", paddingBottom: 16, marginBottom: 32 }}>
            Albums
          </h2>
          <div className="grid grid-cols-12" style={{ gap: 32 }}>
            {matchedAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/v2/album/${album.slug}`}
                className="v2-cover-img-link block"
                style={{ gridColumn: "span 4 / span 4" }}
              >
                <div className="v2-ghost-border overflow-hidden" style={{ aspectRatio: "4 / 5", marginBottom: 16 }}>
                  {album.coverImage && (
                    <img src={album.coverImage} alt={album.title} className="v2-cover-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <h3 className="v2-body-lg" style={{ color: "var(--v2-cream)" }}>{album.title}</h3>
                <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)", marginTop: 4 }}>
                  {album.location} · {album.photoCount} photos
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {matchedPhotos.length > 0 && (
        <section>
          <h2 className="v2-headline-md v2-ghost-border-b" style={{ color: "var(--v2-cream)", paddingBottom: 16, marginBottom: 32 }}>
            Photos
          </h2>
          <div className="grid grid-cols-12" style={{ gap: 16 }}>
            {matchedPhotos.slice(0, 60).map((p) => (
              <Link key={p.id} href={`/v2/photo/${p.id}`} className="v2-cover-img-link block" style={{ gridColumn: "span 3 / span 3" }}>
                <div className="v2-ghost-border overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                  <img src={p.src.thumb || p.src.medium} alt={p.title} className="v2-cover-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <p className="v2-label-caps" style={{ color: "var(--v2-cream-dim)", marginTop: 8 }}>
                  {p.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <p className="v2-body-md" style={{ color: "var(--v2-cream-dim)", textAlign: "center", padding: 64 }}>
          {locale === "fr" ? "Aucun résultat." : "No results."}
        </p>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="v2-body-md"
        style={{
          background: "transparent",
          color: "var(--v2-cream)",
          border: "1px solid var(--v2-ghost)",
          padding: "8px 12px",
          outline: "none",
        }}
      >
        <option value="" style={{ color: "#000" }}>—</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ color: "#000" }}>{o}</option>
        ))}
      </select>
    </div>
  );
}
