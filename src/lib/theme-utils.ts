import { THEME_PRESETS, ThemePresetKey, ThemeMode, DEFAULT_THEME } from "./themes";

/**
 * Generate CSS custom properties for a given theme and mode
 */
export function generateThemeCSSVars(
  theme: ThemePresetKey,
  mode: ThemeMode
): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  const modeColors = preset.colors[mode];

  return `
    --color-primary: ${preset.colors.primary};
    --color-background: ${modeColors.background};
    --color-surface: ${modeColors.surface};
    --color-surface-border: ${modeColors.surfaceBorder};
    --color-text-primary: ${modeColors.textPrimary};
    --color-text-muted: ${modeColors.textMuted};
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
 * Get the background color for a theme and mode (for manifest, etc.)
 */
export function getThemeBackgroundColor(
  theme: ThemePresetKey,
  mode: ThemeMode
): string {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS[DEFAULT_THEME];
  return preset.colors[mode].background;
}
