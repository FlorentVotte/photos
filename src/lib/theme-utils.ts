import { THEME_PRESETS, ThemePresetKey, DEFAULT_THEME } from "./themes";

/**
 * Generate CSS custom properties for a given theme
 */
export function generateThemeCSSVars(theme: ThemePresetKey): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  const { colors, fonts } = preset;

  return `
    --color-primary: ${colors.primary};
    --color-background: ${colors.background};
    --color-surface: ${colors.surface};
    --color-surface-border: ${colors.surfaceBorder};
    --color-text-primary: ${colors.textPrimary};
    --color-text-muted: ${colors.textMuted};
    --font-display: ${fonts.display};
    --font-sans: ${fonts.sans};
  `.trim();
}

/**
 * Get the color for the meta theme-color tag. It is the page background (not the
 * accent) so the browser/status bar blends with the page.
 */
export function getThemeMetaColor(theme: ThemePresetKey): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  return preset.colors.background;
}

/**
 * Get the background color for a theme (for manifest, etc.)
 */
export function getThemeBackgroundColor(theme: ThemePresetKey): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  return preset.colors.background;
}

/**
 * Convert a #rrggbb colour to an rgba() string. Used where CSS variables are
 * unavailable (next/og) and a theme colour needs transparency.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
