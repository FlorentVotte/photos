// Theme preset definitions for the photobook

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textMuted: string;
}

export interface ThemePreset {
  name: string;
  description: string;
  colors: ThemeColors;
}

export const THEME_PRESETS = {
  "forest-green": {
    name: "Forest Green",
    description: "Deep forest tones with restrained sage accents",
    colors: {
      primary: "#7ba88e",
      background: "#0f1c14",
      surface: "#172620",
      surfaceBorder: "#22372e",
      textPrimary: "#f4f4f3",
      textMuted: "#9aae9f",
    },
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
  },
} as const;

export type ThemePresetKey = keyof typeof THEME_PRESETS;

export const DEFAULT_THEME: ThemePresetKey = "forest-green";

export function isValidTheme(theme: string): theme is ThemePresetKey {
  return theme in THEME_PRESETS;
}
