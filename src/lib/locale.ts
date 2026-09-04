import type { Locale } from "./translations";

const SUPPORTED_LOCALES: ReadonlySet<string> = new Set(["en", "fr"]);

function parseAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "en";

  const preferences = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [languageRange, ...parameters] = entry.trim().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q=")
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;

      return {
        language: languageRange.toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter(({ language, quality }) => language && quality > 0)
    .sort((first, second) => second.quality - first.quality || first.index - second.index);

  for (const preference of preferences) {
    if (SUPPORTED_LOCALES.has(preference.language)) {
      return preference.language as Locale;
    }
  }

  return "en";
}

/** Resolves the persisted preference before the request language. */
export function resolveLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null
): Locale {
  if (cookieValue && SUPPORTED_LOCALES.has(cookieValue)) {
    return cookieValue as Locale;
  }

  return parseAcceptLanguage(acceptLanguage);
}

export interface LocalePersistenceTarget {
  setDocumentLanguage: (locale: Locale) => void;
  setLocalStorage: (locale: Locale) => void;
  setCookie: (locale: Locale) => void;
}

/** Persists durable cookie state even when localStorage access is blocked. */
export function persistLocalePreference(
  locale: Locale,
  target: LocalePersistenceTarget
): void {
  target.setDocumentLanguage(locale);
  try {
    target.setLocalStorage(locale);
  } catch {
    // Storage can be disabled by browser privacy settings.
  }
  target.setCookie(locale);
}
