"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";

const NAV = [
  { href: "/v2", label: "Home", labelFr: "Accueil" },
  { href: "/v2/albums", label: "Albums", labelFr: "Albums" },
  { href: "/v2/search", label: "Search", labelFr: "Recherche" },
  { href: "/v2/map", label: "Map", labelFr: "Carte" },
  { href: "/v2/about", label: "About", labelFr: "À propos" },
];

export default function V2Header({ currentPath }: { currentPath?: string }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 v2-container flex justify-between items-center py-5 md:py-6"
      style={{ background: "rgba(18,18,18,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(229,226,221,0.08)" }}
    >
      <Link href="/v2" className="v2-headline-md" style={{ fontSize: 22, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--v2-cream)" }}>
        Regards Perdus
      </Link>

      <div className="hidden md:flex items-center" style={{ gap: 40 }}>
        {NAV.map((item) => {
          const active = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="v2-label-caps"
              style={{
                color: active ? "var(--v2-cream)" : "var(--v2-cream-dim)",
                paddingBottom: 4,
                borderBottom: active ? "1px solid var(--v2-gold)" : "1px solid transparent",
                transition: "color 300ms ease",
              }}
            >
              {locale === "fr" ? item.labelFr : item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center" style={{ gap: 24 }}>
        <div className="v2-label-caps flex items-center" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={() => setLocale("en")}
            style={{ color: locale === "en" ? "var(--v2-cream)" : "var(--v2-cream-dim)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
            className={locale === "en" ? "v2-active-lang" : ""}
          >
            EN
          </button>
          <span style={{ color: "var(--v2-outline-variant)" }}>/</span>
          <button
            type="button"
            onClick={() => setLocale("fr")}
            style={{ color: locale === "fr" ? "var(--v2-cream)" : "var(--v2-cream-dim)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
            className={locale === "fr" ? "v2-active-lang" : ""}
          >
            FR
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden material-symbols-outlined"
          style={{ background: "none", border: "none", color: "var(--v2-cream)", cursor: "pointer", fontSize: 24 }}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? "close" : "menu"}
        </button>
      </div>

      {open && (
        <div className="md:hidden v2-mobile-menu fixed inset-x-0 top-[64px] bottom-0 v2-container" style={{ paddingTop: 48, paddingBottom: 48, display: "flex", flexDirection: "column", gap: 32 }}>
          {NAV.map((item) => {
            const active = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="v2-display-lg"
                style={{
                  fontSize: 32,
                  color: active ? "var(--v2-cream)" : "var(--v2-cream-dim)",
                  borderBottom: active ? "1px solid var(--v2-gold)" : "1px solid var(--v2-ghost)",
                  paddingBottom: 16,
                  display: "block",
                }}
              >
                {locale === "fr" ? item.labelFr : item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
