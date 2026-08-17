"use client";

import dynamic from "next/dynamic";
import { useLocale } from "@/lib/LocaleContext";
import type { Photo } from "@/lib/types";

const PhotoMap = dynamic(() => import("./PhotoMap"), {
  loading: () => (
    <div className="w-full h-[600px] bg-surface-dark flex items-center justify-center">
      <p className="font-sans text-eyebrow uppercase text-text-muted animate-pulse">
        Loading map
      </p>
    </div>
  ),
  ssr: false,
});

interface MapContentProps {
  photos: Photo[];
}

export default function MapContent({ photos }: MapContentProps) {
  const { t } = useLocale();

  return (
    <main className="flex-1 px-6 pt-20 pb-12 md:px-12 md:pt-28">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-12 max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
            {t("map", "title")}
          </h1>
          <p className="mt-6 font-sans text-base text-text-muted leading-relaxed">
            {t("map", "subtitle")}
          </p>
        </header>
        <PhotoMap photos={photos} />
      </div>
    </main>
  );
}
