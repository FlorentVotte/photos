"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { useScrolled } from "@/hooks";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useLocale();
  const scrolled = useScrolled();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "fr" : "en");
  };

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  // Close on Escape for keyboard accessibility.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const navItemClass =
    "font-display text-3xl font-semibold tracking-tight text-foreground/85 hover:text-foreground transition-colors";

  return (
    <header
      data-scrolled={scrolled}
      className={`scroll-edge sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-transparent px-4 py-3 md:px-6 md:py-4 lg:px-16 ${
        // Lighter material over a hero image, thicker over ordinary content.
        transparent ? "material" : "material-thick"
      }`}
    >
      <Link href="/" className="group flex items-baseline gap-2">
        <h2 className="text-base sm:text-lg font-semibold leading-none tracking-[0.18em] uppercase">
          Regards
        </h2>
        <span className="text-base sm:text-lg font-light leading-none tracking-[0.18em] uppercase text-text-muted group-hover:text-foreground transition-colors">
          Perdus
        </span>
      </Link>

      <div className="flex flex-1 justify-end gap-8">
        <nav className="hidden md:flex items-center gap-9">
          <Link
            href="/"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            {t("nav", "home")}
          </Link>
          <Link
            href="/albums"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            {t("nav", "albums")}
          </Link>
          <Link
            href="/search"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            {t("nav", "search")}
          </Link>
          <Link
            href="/map"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            {t("nav", "map")}
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            {t("nav", "about")}
          </Link>
          <button
            onClick={toggleLocale}
            className="text-sm font-medium leading-normal hover:text-primary transition-colors uppercase"
            title={locale === "en" ? "Switch to French" : "Passer en anglais"}
            aria-label={locale === "en" ? "Switch to French" : "Passer en anglais"}
          >
            {locale === "en" ? "FR" : "EN"}
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center size-10 text-foreground hover:text-primary transition-colors relative z-[60]"
          aria-label={mobileMenuOpen ? t("nav", "closeMenu") : t("nav", "openMenu")}
          aria-expanded={mobileMenuOpen}
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu — full-viewport overlay with scroll lock */}
      <div
        className={`material-thick md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="flex h-full flex-col items-start justify-center gap-8 px-8">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            {t("nav", "home")}
          </Link>
          <Link
            href="/albums"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            {t("nav", "albums")}
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            {t("nav", "search")}
          </Link>
          <Link
            href="/map"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            {t("nav", "map")}
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            {t("nav", "about")}
          </Link>
          <button
            onClick={() => {
              toggleLocale();
              setMobileMenuOpen(false);
            }}
            className="mt-4 font-sans text-eyebrow uppercase text-text-muted hover:text-foreground transition-colors"
          >
            {locale === "en" ? "FR — Français" : "EN — English"}
          </button>
        </nav>
      </div>
    </header>
  );
}
