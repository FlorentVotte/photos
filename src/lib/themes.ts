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
    description: "Deep forest tones with emerald accents",
    colors: {
      primary: "#1dc964",
      background: "#112118",
      surface: "#1a2e22",
      surfaceBorder: "#254633",
      textPrimary: "#ffffff",
      textMuted: "#95c6a9",
    },
  },
  "ocean-blue": {
    name: "Ocean Blue",
    description: "Cool ocean depths with aqua highlights",
    colors: {
      primary: "#1d9dc9",
      background: "#111821",
      surface: "#1a252e",
      surfaceBorder: "#253346",
      textPrimary: "#ffffff",
      textMuted: "#95b3c6",
    },
  },
  "sunset-orange": {
    name: "Sunset Orange",
    description: "Warm sunset hues with coral accents",
    colors: {
      primary: "#e86c4f",
      background: "#211814",
      surface: "#2e211a",
      surfaceBorder: "#463325",
      textPrimary: "#ffffff",
      textMuted: "#c6a095",
    },
  },
  "midnight-purple": {
    name: "Midnight Purple",
    description: "Elegant purple tones with violet accents",
    colors: {
      primary: "#9b6dff",
      background: "#17111f",
      surface: "#221a2e",
      surfaceBorder: "#352546",
      textPrimary: "#ffffff",
      textMuted: "#b095c6",
    },
  },
  "desert-sand": {
    name: "Desert Sand",
    description: "Warm earth tones with golden highlights",
    colors: {
      primary: "#d4a653",
      background: "#1f1c14",
      surface: "#2e2a1a",
      surfaceBorder: "#463f25",
      textPrimary: "#ffffff",
      textMuted: "#c6b895",
    },
  },
} as const;

export type ThemePresetKey = keyof typeof THEME_PRESETS;

export const DEFAULT_THEME: ThemePresetKey = "forest-green";

export function isValidTheme(theme: string): theme is ThemePresetKey {
  return theme in THEME_PRESETS;
}
