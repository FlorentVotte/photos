"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useLocale } from "@/lib/LocaleContext";
import type { Album, Photo } from "@/lib/types";

type View = "map" | "globe";

const VIEW_STORAGE_KEY = "mapView";

// The chosen view lives in localStorage rather than React state so the
// preference survives navigation. useSyncExternalStore is what lets the server
// render "map" and the client swap in the stored value without a hydration
// mismatch or a setState-in-effect.
const listeners = new Set<() => void>();

function subscribeToView(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readView(): View {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "globe" ? "globe" : "map";
  } catch {
    // Private browsing and blocked site data both throw here.
    return "map";
  }
}

function readServerView(): View {
  return "map";
}

function writeView(next: View) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  } catch {
    // The preference simply won't persist; the view still switches.
  }
  listeners.forEach((listener) => listener());
}

function ViewPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-[600px] bg-surface-dark flex items-center justify-center">
      <p className="font-sans text-eyebrow uppercase text-text-muted animate-pulse">
        {label}
      </p>
    </div>
  );
}

const PhotoMap = dynamic(() => import("./PhotoMap"), {
  loading: () => <ViewPlaceholder label="Loading map" />,
  ssr: false,
});

// Kept in its own dynamic import so the three.js bundle is only fetched by
// visitors who actually switch to the globe.
const PhotoGlobe = dynamic(() => import("./PhotoGlobe"), {
  loading: () => <ViewPlaceholder label="Loading globe" />,
  ssr: false,
});

interface MapContentProps {
  photos: Photo[];
  albums: Album[];
}

export default function MapContent({ photos, albums }: MapContentProps) {
  const { t } = useLocale();
  const view = useSyncExternalStore(subscribeToView, readView, readServerView);

  return (
    <main className="flex-1 px-6 pt-20 pb-12 md:px-12 md:pt-28">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
              {t("map", "title")}
            </h1>
            <p className="mt-6 font-sans text-base text-text-muted leading-relaxed">
              {t("map", "subtitle")}
            </p>
          </div>

          <div
            role="group"
            aria-label={t("map", "viewLabel")}
            className="flex shrink-0 self-start border border-surface-border md:self-end"
          >
            {(
              [
                ["map", t("map", "viewMap")],
                ["globe", t("map", "viewGlobe")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => writeView(value)}
                aria-pressed={view === value}
                className={`px-5 py-2 font-sans text-eyebrow uppercase transition-colors ${
                  view === value
                    ? "bg-primary text-background-dark"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {view === "map" ? (
          <PhotoMap photos={photos} />
        ) : (
          <PhotoGlobe photos={photos} albums={albums} />
        )}
      </div>
    </main>
  );
}
