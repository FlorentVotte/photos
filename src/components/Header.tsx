"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/LocaleContext";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "fr" : "en");
  };

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-surface-border px-4 py-3 md:px-6 md:py-4 lg:px-16 transition-all duration-300 ${
        transparent
          ? "bg-background-dark/80 backdrop-blur-md"
          : "bg-background-dark/95 backdrop-blur-md"
      }`}
    >
      <Link href="/" className="flex items-center gap-4">
        <div className="size-8 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">public</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em]">
          REGARDS PERDUS
        </h2>
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
          className="md:hidden flex items-center justify-center size-10 text-foreground hover:text-primary transition-colors"
          aria-label={mobileMenuOpen ? t("nav", "closeMenu") : t("nav", "openMenu")}
          aria-expanded={mobileMenuOpen}
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background-dark border-b border-surface-border md:hidden">
          <nav className="flex flex-col p-4 gap-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              {t("nav", "home")}
            </Link>
            <Link
              href="/albums"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              {t("nav", "albums")}
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              {t("nav", "search")}
            </Link>
            <Link
              href="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              {t("nav", "map")}
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              {t("nav", "about")}
            </Link>
            <button
              onClick={() => {
                toggleLocale();
                setMobileMenuOpen(false);
              }}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors uppercase py-2"
            >
              {locale === "en" ? "FR - Français" : "EN - English"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
