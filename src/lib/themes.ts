// Theme preset definitions for the photobook

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textMuted: string;
}

export interface ThemeFonts {
  /** Display family: full font-family stack, e.g. "var(--font-eb-garamond), 'EB Garamond', serif" */
  display: string;
  /** Sans family: full font-family stack, e.g. "var(--font-dm-sans), 'DM Sans', sans-serif" */
  sans: string;
}

export interface ThemePreset {
  name: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  /** "dark" or "light" — informs the swatch UI in the admin theme picker. */
  mode: "dark" | "light";
}

/** Default font pairing: Noto Serif + Noto Sans (matches the live site). */
const NOTO_FONTS: ThemeFonts = {
  display: "var(--font-noto-serif), 'Noto Serif', serif",
  sans: "var(--font-noto-sans), 'Noto Sans', sans-serif",
};

export const THEME_PRESETS = {
  // ---------- Original colour-only presets (Noto Serif/Sans) ----------
  "forest-green": {
    name: "Forest Sage",
    description: "Deep forest tones with restrained sage accents",
    colors: {
      primary: "#7ba88e",
      background: "#0f1c14",
      surface: "#172620",
      surfaceBorder: "#22372e",
      textPrimary: "#f4f4f3",
      textMuted: "#9aae9f",
    },
    fonts: NOTO_FONTS,
    mode: "dark",
  },
  "ocean-blue": {
    name: "Ocean Blue",
    description: "Cool ocean depths with restrained slate accents",
    colors: {
      primary: "#6c9bb5",
      background: "#0f1a23",
      surface: "#162330",
      surfaceBorder: "#22354a",
      textPrimary: "#f3f4f5",
      textMuted: "#9aabbb",
    },
    fonts: NOTO_FONTS,
    mode: "dark",
  },
  "sunset-orange": {
    name: "Sunset Orange",
    description: "Warm sunset hues with restrained terracotta accents",
    colors: {
      primary: "#c08770",
      background: "#1f1612",
      surface: "#2a1f18",
      surfaceBorder: "#473428",
      textPrimary: "#f5f3f1",
      textMuted: "#b39a8f",
    },
    fonts: NOTO_FONTS,
    mode: "dark",
  },
  "midnight-purple": {
    name: "Midnight Purple",
    description: "Elegant purple tones with restrained plum accents",
    colors: {
      primary: "#8a7cad",
      background: "#150f1d",
      surface: "#1f172a",
      surfaceBorder: "#332647",
      textPrimary: "#f3f2f5",
      textMuted: "#a59cbb",
    },
    fonts: NOTO_FONTS,
    mode: "dark",
  },
  "desert-sand": {
    name: "Desert Sand",
    description: "Warm earth tones with restrained wheat accents",
    colors: {
      primary: "#b39870",
      background: "#1c1912",
      surface: "#272318",
      surfaceBorder: "#473d25",
      textPrimary: "#f5f4f1",
      textMuted: "#b8aa8f",
    },
    fonts: NOTO_FONTS,
    mode: "dark",
  },

  // ---------- New design-system presets (each with its own font pairing) ----------
  "editorial-monograph": {
    name: "Editorial Monograph",
    description: "Photo-book monograph — EB Garamond + Hanken Grotesk, cream on matte black",
    colors: {
      primary: "#c5a059",
      background: "#121212",
      surface: "#1a1a1a",
      surfaceBorder: "#2a2a2a",
      textPrimary: "#f5f2ed",
      textMuted: "#a8a39a",
    },
    fonts: {
      display: "var(--font-eb-garamond), 'EB Garamond', serif",
      sans: "var(--font-hanken-grotesk), 'Hanken Grotesk', sans-serif",
    },
    mode: "dark",
  },
  "brutalist-photojournalist": {
    name: "Brutalist Photojournalist",
    description: "Newsroom photo essay — Anton + Inter, strict monochrome",
    colors: {
      primary: "#fafafa",
      background: "#0a0a0a",
      surface: "#141414",
      surfaceBorder: "#262626",
      textPrimary: "#fafafa",
      textMuted: "#888888",
    },
    fonts: {
      display: "var(--font-anton), 'Anton', sans-serif",
      sans: "var(--font-inter), 'Inter', sans-serif",
    },
    mode: "dark",
  },
  "warm-print-catalogue": {
    name: "Warm Print Catalogue",
    description: "Light-mode exhibition catalogue — Newsreader + DM Sans, ink on warm cream",
    colors: {
      primary: "#b8533a",
      background: "#f5ede2",
      surface: "#ebe1d2",
      surfaceBorder: "#d8cdb8",
      textPrimary: "#2a2520",
      textMuted: "#6b5f52",
    },
    fonts: {
      display: "var(--font-newsreader), 'Newsreader', serif",
      sans: "var(--font-dm-sans), 'DM Sans', sans-serif",
    },
    mode: "light",
  },
  "modernist-tonal": {
    name: "Modernist Tonal",
    description: "Contemporary art-magazine — Bodoni Moda + DM Sans, slate on deep navy-charcoal",
    colors: {
      primary: "#7a8a9a",
      background: "#16181c",
      surface: "#1f2227",
      surfaceBorder: "#2a2d33",
      textPrimary: "#d8d4cf",
      textMuted: "#9aa1ab",
    },
    fonts: {
      display: "var(--font-bodoni-moda), 'Bodoni Moda', serif",
      sans: "var(--font-dm-sans), 'DM Sans', sans-serif",
    },
    mode: "dark",
  },
} as const satisfies Record<string, ThemePreset>;

export type ThemePresetKey = keyof typeof THEME_PRESETS;

export const DEFAULT_THEME: ThemePresetKey = "forest-green";

export function isValidTheme(theme: string): theme is ThemePresetKey {
  return theme in THEME_PRESETS;
}
