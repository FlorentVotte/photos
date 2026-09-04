import { describe, expect, it } from "vitest";
import { persistLocalePreference, resolveLocale } from "./locale";
import { translations } from "./translations";

describe("resolveLocale", () => {
  it("uses a valid locale cookie ahead of the request language", () => {
    expect(resolveLocale("en", "fr-FR,fr;q=0.9")).toBe("en");
  });

  it("uses French when it is the preferred supported request language", () => {
    expect(resolveLocale(undefined, "fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
  });

  it("defaults to English when neither source provides a supported locale", () => {
    expect(resolveLocale("de", "de-DE")).toBe("en");
  });
});

describe("persistLocalePreference", () => {
  it("still writes the cookie when localStorage is blocked", () => {
    const effects: string[] = [];

    persistLocalePreference("fr", {
      setDocumentLanguage: (locale) => effects.push(`lang:${locale}`),
      setLocalStorage: () => {
        throw new Error("SecurityError");
      },
      setCookie: (locale) => effects.push(`cookie:${locale}`),
    });

    expect(effects).toEqual(["lang:fr", "cookie:fr"]);
  });
});

describe("legal download terms", () => {
  it("permits private, non-commercial downloads while retaining copyright limits", () => {
    const terms = translations.legal;

    expect(terms.termDownloads.en).toBe(
      "You may download photographs for private, non-commercial viewing. Copyright remains with the photographer. Copying, redistribution, republication, modification, automated bulk downloading, and commercial use require explicit authorization."
    );
    expect(terms.termDownloads.fr).toBe(
      "Vous pouvez télécharger les photographies pour une consultation privée et non commerciale. Les droits d’auteur restent la propriété du photographe. Toute copie, redistribution, republication, modification, tout téléchargement automatisé en masse et tout usage commercial nécessitent une autorisation explicite."
    );
    expect(terms).not.toHaveProperty("termNoDownload");
  });

  it("publishes the current revision date in both locales", () => {
    expect(translations.legal.lastUpdated).toEqual({
      en: "Last updated: September 4, 2026",
      fr: "Dernière mise à jour : 4 septembre 2026",
    });
    expect(translations.privacy.lastUpdated).toEqual({
      en: "Last updated: September 4, 2026",
      fr: "Dernière mise à jour : 4 septembre 2026",
    });
  });

  it("does not override the download permission in its copyright notice", () => {
    expect(translations.legal.ipText.en).toContain(
      "Private, non-commercial downloading is permitted."
    );
    expect(translations.legal.ipText.fr).toContain(
      "Le téléchargement à des fins privées et non commerciales est autorisé."
    );
  });
});
