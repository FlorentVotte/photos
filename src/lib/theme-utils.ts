import { THEME_PRESETS, ThemePresetKey, DEFAULT_THEME } from "./themes";

/**
 * Generate CSS custom properties for a given theme
 */
export function generateThemeCSSVars(theme: ThemePresetKey): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  const colors = preset.colors;

  return `
    --color-primary: ${colors.primary};
    --color-background: ${colors.background};
    --color-surface: ${colors.surface};
    --color-surface-border: ${colors.surfaceBorder};
    --color-text-primary: ${colors.textPrimary};
    --color-text-muted: ${colors.textMuted};
  `.trim();
}

/**
 * Get the primary color for meta theme-color tag
 */
export function getThemeMetaColor(theme: ThemePresetKey): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  return preset.colors.primary;
}

/**
 * Get the background color for a theme (for manifest, etc.)
 */
export function getThemeBackgroundColor(theme: ThemePresetKey): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  return preset.colors.background;
}
