// Theme preset definitions for the photobook

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textMuted: string;
}

export interface ThemePreset {
  name: string;
  description: string;
  colors: {
    primary: string;
    light: ThemeColors;
    dark: ThemeColors;
  };
}

export const THEME_PRESETS = {
  "forest-green": {
    name: "Forest Green",
    description: "Deep forest tones with emerald accents",
    colors: {
      primary: "#1dc964",
      light: {
        background: "#f6f8f7",
        surface: "#e8ede9",
        surfaceBorder: "#c8d9ce",
        textPrimary: "#112118",
        textMuted: "#5a7c66",
      },
      dark: {
        background: "#112118",
        surface: "#1a2e22",
        surfaceBorder: "#254633",
        textPrimary: "#ffffff",
        textMuted: "#95c6a9",
      },
    },
  },
  "ocean-blue": {
    name: "Ocean Blue",
    description: "Cool ocean depths with aqua highlights",
    colors: {
      primary: "#1d9dc9",
      light: {
        background: "#f6f8fa",
        surface: "#e8eef2",
        surfaceBorder: "#c8d4dc",
        textPrimary: "#111821",
        textMuted: "#5a7c8c",
      },
      dark: {
        background: "#111821",
        surface: "#1a252e",
        surfaceBorder: "#253346",
        textPrimary: "#ffffff",
        textMuted: "#95b3c6",
      },
    },
  },
  "sunset-orange": {
    name: "Sunset Orange",
    description: "Warm sunset hues with coral accents",
    colors: {
      primary: "#e86c4f",
      light: {
        background: "#faf7f6",
        surface: "#f2ebe8",
        surfaceBorder: "#dcc8c3",
        textPrimary: "#211511",
        textMuted: "#8c6c5a",
      },
      dark: {
        background: "#211814",
        surface: "#2e211a",
        surfaceBorder: "#463325",
        textPrimary: "#ffffff",
        textMuted: "#c6a095",
      },
    },
  },
  "midnight-purple": {
    name: "Midnight Purple",
    description: "Elegant purple tones with violet accents",
    colors: {
      primary: "#9b6dff",
      light: {
        background: "#f8f6fa",
        surface: "#ede8f2",
        surfaceBorder: "#d4c8dc",
        textPrimary: "#1a1121",
        textMuted: "#7c5a8c",
      },
      dark: {
        background: "#17111f",
        surface: "#221a2e",
        surfaceBorder: "#352546",
        textPrimary: "#ffffff",
        textMuted: "#b095c6",
      },
    },
  },
  "desert-sand": {
    name: "Desert Sand",
    description: "Warm earth tones with golden highlights",
    colors: {
      primary: "#d4a653",
      light: {
        background: "#faf9f6",
        surface: "#f2efe8",
        surfaceBorder: "#dcd5c8",
        textPrimary: "#211e11",
        textMuted: "#8c7c5a",
      },
      dark: {
        background: "#1f1c14",
        surface: "#2e2a1a",
        surfaceBorder: "#463f25",
        textPrimary: "#ffffff",
        textMuted: "#c6b895",
      },
    },
  },
} as const;

export type ThemePresetKey = keyof typeof THEME_PRESETS;

export const DEFAULT_THEME: ThemePresetKey = "forest-green";
export const DEFAULT_MODE: ThemeMode = "dark";

export function isValidTheme(theme: string): theme is ThemePresetKey {
  return theme in THEME_PRESETS;
}
