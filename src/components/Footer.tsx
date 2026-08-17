"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLocale();

  return (
    <footer className="mt-24 border-t border-surface-border">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center md:px-12">
        <p className="font-sans text-label uppercase text-text-muted">
          © {currentYear} Florent Votte · {t("footer", "allRightsReserved")}
        </p>
        <nav className="flex items-center gap-8">
          <Link
            href="/privacy"
            className="font-sans text-label uppercase text-text-muted hover:text-foreground transition-colors"
          >
            {t("footer", "privacyPolicy")}
          </Link>
          <Link
            href="/legal"
            className="font-sans text-label uppercase text-text-muted hover:text-foreground transition-colors"
          >
            {t("footer", "legalNotice")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
