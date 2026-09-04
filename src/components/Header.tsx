"use client";

import Link from "next/link";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { useModalFocus, useScrolled } from "@/hooks";
import { translations, type Locale } from "@/lib/translations";

interface HeaderProps {
  transparent?: boolean;
}

type Translator = (section: keyof typeof translations, key: string) => string;

interface MobileMenuDialogProps {
  containerRef: RefObject<HTMLDivElement | null>;
  initialFocusRef: RefObject<HTMLAnchorElement | null>;
  locale: Locale;
  onClose: () => void;
  onToggleLocale: () => void;
  t: Translator;
}

const navItemClass =
  "font-display text-3xl font-semibold tracking-tight text-foreground/85 hover:text-foreground transition-colors";

export function MobileMenuDialog({
  containerRef,
  initialFocusRef,
  locale,
  onClose,
  onToggleLocale,
  t,
}: MobileMenuDialogProps) {
  return (
    <div
      ref={containerRef}
      className="material-thick md:hidden fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav", "openMenu")}
      tabIndex={-1}
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center text-foreground hover:text-primary transition-colors"
        aria-label={t("nav", "closeMenu")}
      >
        <span aria-hidden="true" className="material-symbols-outlined">close</span>
      </button>
      <nav className="flex h-full flex-col items-start justify-center gap-8 px-8">
        <Link
          href="/"
          ref={initialFocusRef}
          onClick={onClose}
          className={navItemClass}
        >
          {t("nav", "home")}
        </Link>
        <Link href="/albums" onClick={onClose} className={navItemClass}>
          {t("nav", "albums")}
        </Link>
        <Link href="/search" onClick={onClose} className={navItemClass}>
          {t("nav", "search")}
        </Link>
        <Link href="/map" onClick={onClose} className={navItemClass}>
          {t("nav", "map")}
        </Link>
        <Link href="/about" onClick={onClose} className={navItemClass}>
          {t("nav", "about")}
        </Link>
        <button
          onClick={() => {
            onToggleLocale();
            onClose();
          }}
          className="mt-4 min-h-11 font-sans text-eyebrow uppercase text-text-muted hover:text-foreground transition-colors"
        >
          {locale === "en" ? "FR — Français" : "EN — English"}
        </button>
      </nav>
    </div>
  );
}

export default function Header({ transparent = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstMobileNavLinkRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuOpenerFocusRef = useRef<HTMLElement | null>(null);
  const { t, locale, setLocale } = useLocale();
  const scrolled = useScrolled();

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

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

  useModalFocus({
    isOpen: mobileMenuOpen,
    containerRef: mobileMenuRef,
    initialFocusRef: firstMobileNavLinkRef,
    restoreFocusRef: mobileMenuOpenerFocusRef,
    onClose: closeMobileMenu,
  });

  return (
    <>
      <header
        data-scrolled={scrolled}
        className={`scroll-edge sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-transparent px-4 py-3 md:px-6 md:py-4 lg:px-16 ${
          // Lighter material over a hero image, thicker over ordinary content.
          transparent ? "material" : "material-thick"
        } ${
          // The open menu already provides the surface; a second glass layer
          // here would stack on it and band the top of the screen.
          mobileMenuOpen ? "material-passthrough" : ""
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

          {/* The opener unmounts while the dialog is open so it can remain in
              the safely inert header behind the dialog. */}
          {!mobileMenuOpen && (
            <button
              onClick={(event) => {
                mobileMenuOpenerFocusRef.current = event.currentTarget;
                setMobileMenuOpen(true);
              }}
              className="md:hidden flex min-h-11 min-w-11 items-center justify-center text-foreground hover:text-primary transition-colors relative z-[60]"
              aria-label={t("nav", "openMenu")}
              aria-expanded={false}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile menu — a full-viewport overlay, and deliberately a sibling of
          <header> rather than a child. The header carries backdrop-filter,
          which makes it a containing block for position:fixed descendants, so
          nested here `inset-0` resolved against the 64px header instead of the
          viewport and the menu rendered as a strip under the bar. */}
      {mobileMenuOpen && (
        <MobileMenuDialog
          containerRef={mobileMenuRef}
          initialFocusRef={firstMobileNavLinkRef}
          locale={locale}
          onClose={closeMobileMenu}
          onToggleLocale={toggleLocale}
          t={t}
        />
      )}
    </>
  );
}
