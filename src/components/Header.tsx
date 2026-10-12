"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type RefObject, useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { useModalFocus, useScrolled } from "@/hooks";
import { translations, type Locale } from "@/lib/translations";

interface HeaderProps {
  transparent?: boolean;
  /** Admin pages render their own skip link before the header. */
  showSkipLink?: boolean;
}

type Translator = (section: keyof typeof translations, key: string) => string;

interface MobileMenuDialogProps {
  id?: string;
  pathname?: string | null;
  containerRef: RefObject<HTMLDivElement | null>;
  initialFocusRef: RefObject<HTMLAnchorElement | null>;
  locale: Locale;
  onClose: () => void;
  onToggleLocale: () => void;
  t: Translator;
}

const navItemClass =
  "font-display text-3xl font-semibold tracking-tight text-foreground/85 hover:text-foreground transition-colors";
const navItemActiveClass =
  "font-display text-3xl font-semibold tracking-tight text-foreground transition-colors";
const desktopNavClass =
  "inline-flex min-h-11 items-center text-sm font-medium leading-normal hover:text-primary transition-colors";
const desktopNavActiveClass =
  "inline-flex min-h-11 items-center text-sm font-medium leading-normal text-foreground underline decoration-primary decoration-1 underline-offset-8 hover:text-primary transition-colors";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/albums", key: "albums" },
  { href: "/search", key: "search" },
  { href: "/map", key: "map" },
  { href: "/about", key: "about" },
] as const;

export function MobileMenuDialog({
  id,
  pathname,
  containerRef,
  initialFocusRef,
  locale,
  onClose,
  onToggleLocale,
  t,
}: MobileMenuDialogProps) {
  return (
    <div
      id={id}
      ref={containerRef}
      className="material-thick md:hidden fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav", "menu")}
      tabIndex={-1}
    >
      <button
        onClick={onClose}
        className="absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex min-h-11 min-w-11 items-center justify-center text-foreground hover:text-primary transition-colors"
        aria-label={t("nav", "closeMenu")}
      >
        <span aria-hidden="true" className="material-symbols-outlined">close</span>
      </button>
      <nav
        className="flex h-full flex-col items-start justify-start overflow-y-auto pb-[max(4rem,env(safe-area-inset-bottom))] pl-[max(2rem,env(safe-area-inset-left))] pr-[max(2rem,env(safe-area-inset-right))] pt-[max(4rem,env(safe-area-inset-top))]"
        aria-label={t("nav", "main")}
      >
        <div className="my-auto flex flex-col items-start gap-8">
        {NAV_ITEMS.map(({ href, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              ref={href === "/" ? initialFocusRef : undefined}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={active ? navItemActiveClass : navItemClass}
            >
              {t("nav", key)}
            </Link>
          );
        })}
        <button
          onClick={() => {
            onToggleLocale();
            onClose();
          }}
          className="mt-4 min-h-11 font-sans text-eyebrow uppercase text-text-muted hover:text-foreground transition-colors"
        >
          {locale === "en" ? "FR — Français" : "EN — English"}
        </button>
        </div>
      </nav>
    </div>
  );
}

export default function Header({
  transparent = false,
  showSkipLink = true,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstMobileNavLinkRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuOpenerFocusRef = useRef<HTMLButtonElement>(null);
  const { t, locale, setLocale } = useLocale();
  const pathname = usePathname();
  const mobileMenuId = useId();
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
      {showSkipLink && (
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-[max(0.5rem,env(safe-area-inset-top))] focus:left-[max(0.5rem,env(safe-area-inset-left))] focus:z-[70] focus:bg-background-dark focus:px-4 focus:py-2 focus:text-foreground focus:font-sans focus:text-label focus:uppercase"
        >
          {t("nav", "skipToContent")}
        </a>
      )}
      <header
        data-scrolled={scrolled}
        className={`scroll-edge sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-transparent pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:pb-4 md:pt-[max(1rem,env(safe-area-inset-top))] md:pl-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))] lg:pl-[max(4rem,env(safe-area-inset-left))] lg:pr-[max(4rem,env(safe-area-inset-right))] ${
          // Lighter material over a hero image, thicker over ordinary content.
          transparent ? "material" : "material-thick"
        } ${
          // The open menu already provides the surface; a second glass layer
          // here would stack on it and band the top of the screen.
          mobileMenuOpen ? "material-passthrough" : ""
        }`}
      >
        <Link
          href="/"
          className="group flex items-baseline gap-2"
          aria-label={t("nav", "homeLink")}
        >
          <span className="text-base sm:text-lg font-semibold leading-none tracking-[0.18em] uppercase">
            Regards
          </span>
          <span className="text-base sm:text-lg font-light leading-none tracking-[0.18em] uppercase text-text-muted group-hover:text-foreground transition-colors">
            Perdus
          </span>
        </Link>

        <div className="flex flex-1 justify-end gap-8">
          <nav
            className="hidden md:flex items-center gap-9"
            aria-label={t("nav", "main")}
          >
            {NAV_ITEMS.map(({ href, key }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={active ? desktopNavActiveClass : desktopNavClass}
                >
                  {t("nav", key)}
                </Link>
              );
            })}
            <button
              onClick={toggleLocale}
              className="inline-flex min-h-11 items-center text-sm font-medium leading-normal hover:text-primary transition-colors uppercase"
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
              ref={mobileMenuOpenerFocusRef}
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex min-h-11 min-w-11 items-center justify-center text-foreground hover:text-primary transition-colors relative z-[60]"
              aria-label={t("nav", "openMenu")}
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuId}
              aria-haspopup="dialog"
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
          id={mobileMenuId}
          pathname={pathname}
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
