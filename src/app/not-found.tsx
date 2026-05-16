"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useLocale } from "@/lib/LocaleContext";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      <main className="flex flex-1 items-center justify-center px-6 py-24 md:px-12">
        <div className="flex max-w-xl flex-col items-start gap-8">
          <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
            {t("notFound", "label")}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
            {t("notFound", "title")}
          </h1>
          <p className="max-w-md font-sans text-base leading-relaxed text-text-muted">
            {t("notFound", "subtitle")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href="/"
              className="group/cta inline-flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
            >
              <span
                aria-hidden="true"
                className="h-px w-6 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-10 group-hover/cta:bg-foreground"
              />
              <span>{t("notFound", "backHome")}</span>
            </Link>
            <Link
              href="/albums"
              className="group/cta inline-flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
            >
              <span>{t("notFound", "browseAlbums")}</span>
              <span
                aria-hidden="true"
                className="h-px w-6 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-10 group-hover/cta:bg-foreground"
              />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
