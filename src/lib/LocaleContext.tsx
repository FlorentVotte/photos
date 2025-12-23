"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, translations, t as translate } from "./translations";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (section: keyof typeof translations, key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang?.startsWith("fr")) {
    return "fr";
  }
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage first, then browser language
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "fr")) {
      setLocale(savedLocale);
    } else {
      setLocale(detectBrowserLocale());
    }
    setMounted(true);
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const t = (section: keyof typeof translations, key: string): string => {
    return translate(section, key, locale);
  };

  // Prevent hydration mismatch by using default locale until mounted
  if (!mounted) {
    return (
      <LocaleContext.Provider
        value={{
          locale: "en",
          setLocale: handleSetLocale,
          t: (section, key) => translate(section, key, "en"),
        }}
      >
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
