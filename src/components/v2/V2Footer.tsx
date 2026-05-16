"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";

export default function V2Footer() {
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="v2-container v2-ghost-border-t" style={{ marginTop: 96, paddingTop: 40, paddingBottom: 40 }}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center" style={{ gap: 24 }}>
        <div className="v2-headline-md" style={{ fontSize: 22, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--v2-cream)" }}>
          Regards Perdus
        </div>
        <div className="flex flex-col md:flex-row md:items-center" style={{ gap: 24 }}>
          <p className="v2-body-md" style={{ color: "var(--v2-cream-dim)", opacity: 0.7 }}>
            © {year} Regards Perdus
          </p>
          <div className="flex" style={{ gap: 24 }}>
            <Link href="/v2/privacy" className="v2-label-caps" style={{ color: "var(--v2-cream-dim)" }}>
              {locale === "fr" ? "Confidentialité" : "Privacy Policy"}
            </Link>
            <Link href="/v2/legal" className="v2-label-caps" style={{ color: "var(--v2-cream-dim)" }}>
              {locale === "fr" ? "Mentions légales" : "Legal Notice"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
