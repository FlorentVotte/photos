import type { Locale } from "@/lib/translations";

/**
 * Lightroom metadata returns country names in whatever language they were
 * entered with (usually French in this archive). This helper maps the common
 * FR/EN forms to a target locale so the About page reads consistently.
 *
 * Unknown names are returned unchanged.
 */
const FR_EN: Record<string, string> = {
  France: "France",
  Allemagne: "Germany",
  Belgique: "Belgium",
  Suisse: "Switzerland",
  Italie: "Italy",
  Espagne: "Spain",
  Portugal: "Portugal",
  "Pays-Bas": "Netherlands",
  Luxembourg: "Luxembourg",
  "Royaume-Uni": "United Kingdom",
  Angleterre: "England",
  Écosse: "Scotland",
  Irlande: "Ireland",
  Islande: "Iceland",
  Norvège: "Norway",
  Suède: "Sweden",
  Finlande: "Finland",
  Danemark: "Denmark",
  Pologne: "Poland",
  Autriche: "Austria",
  Grèce: "Greece",
  Croatie: "Croatia",
  "République tchèque": "Czech Republic",
  Hongrie: "Hungary",
  Turquie: "Turkey",
  Maroc: "Morocco",
  Tunisie: "Tunisia",
  Égypte: "Egypt",
  "Afrique du Sud": "South Africa",
  Sénégal: "Senegal",
  Kenya: "Kenya",
  Tanzanie: "Tanzania",
  Oman: "Oman",
  Jordanie: "Jordan",
  "Émirats arabes unis": "United Arab Emirates",
  Israël: "Israel",
  Inde: "India",
  Japon: "Japan",
  Chine: "China",
  Thaïlande: "Thailand",
  Vietnam: "Vietnam",
  Indonésie: "Indonesia",
  Australie: "Australia",
  "Nouvelle-Zélande": "New Zealand",
  "États-Unis": "United States",
  Canada: "Canada",
  Mexique: "Mexico",
  Brésil: "Brazil",
  Argentine: "Argentina",
  Chili: "Chile",
  Pérou: "Peru",
  Guadeloupe: "Guadeloupe",
  Martinique: "Martinique",
  Jersey: "Jersey",
};

const EN_FR: Record<string, string> = Object.fromEntries(
  Object.entries(FR_EN).map(([fr, en]) => [en, fr])
);

export function localizeCountryName(name: string, locale: Locale): string {
  if (!name) return name;
  if (locale === "en") return FR_EN[name] ?? name;
  return EN_FR[name] ?? name;
}

export function localizeCountryNames(names: string[], locale: Locale): string[] {
  return names.map((name) => localizeCountryName(name, locale));
}
