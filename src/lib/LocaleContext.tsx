"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Locale, translations, t as translate } from "./translations";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (section: keyof typeof translations, key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    document.documentElement.lang = newLocale;
    localStorage.setItem("locale", newLocale);
    document.cookie = `locale=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  };

  const t = (section: keyof typeof translations, key: string): string => {
    return translate(section, key, locale);
  };

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
