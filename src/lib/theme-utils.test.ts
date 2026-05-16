import { describe, it, expect } from "vitest";
import {
  generateThemeCSSVars,
  getThemeMetaColor,
  getThemeBackgroundColor,
} from "./theme-utils";
import { THEME_PRESETS, DEFAULT_THEME, type ThemePresetKey } from "./themes";

describe("theme-utils", () => {
  describe("generateThemeCSSVars", () => {
    it("should generate CSS variables for valid theme", () => {
      const css = generateThemeCSSVars("forest-green");

      expect(css).toContain("--color-primary: #7ba88e");
      expect(css).toContain("--color-background: #0f1c14");
      expect(css).toContain("--color-surface: #172620");
      expect(css).toContain("--color-surface-border: #22372e");
      expect(css).toContain("--color-text-primary: #f4f4f3");
      expect(css).toContain("--color-text-muted: #9aae9f");
    });

    it("should generate CSS for ocean-blue theme", () => {
      const css = generateThemeCSSVars("ocean-blue");

      expect(css).toContain("--color-primary: #6c9bb5");
      expect(css).toContain("--color-background: #0f1a23");
    });

    it("should generate CSS for sunset-orange theme", () => {
      const css = generateThemeCSSVars("sunset-orange");

      expect(css).toContain("--color-primary: #c08770");
      expect(css).toContain("--color-background: #1f1612");
    });

    it("should generate CSS for midnight-purple theme", () => {
      const css = generateThemeCSSVars("midnight-purple");

      expect(css).toContain("--color-primary: #8a7cad");
      expect(css).toContain("--color-background: #150f1d");
    });

    it("should generate CSS for desert-sand theme", () => {
      const css = generateThemeCSSVars("desert-sand");

      expect(css).toContain("--color-primary: #b39870");
      expect(css).toContain("--color-background: #1c1912");
    });

    it("should fall back to default theme for invalid theme", () => {
      const css = generateThemeCSSVars("invalid-theme" as ThemePresetKey);
      const defaultCss = generateThemeCSSVars(DEFAULT_THEME);

      expect(css).toBe(defaultCss);
    });

    it("should return trimmed CSS string", () => {
      const css = generateThemeCSSVars("forest-green");

      expect(css).not.toMatch(/^\s/);
      expect(css).not.toMatch(/\s$/);
    });

    it("should include all 8 CSS variables (6 colours + 2 fonts)", () => {
      const css = generateThemeCSSVars("forest-green");

      const variables = [
        "--color-primary",
        "--color-background",
        "--color-surface",
        "--color-surface-border",
        "--color-text-primary",
        "--color-text-muted",
        "--font-display",
        "--font-sans",
      ];

      variables.forEach((variable) => {
        expect(css).toContain(variable);
      });
    });

    it("should generate valid CSS for all theme presets", () => {
      const themeKeys = Object.keys(THEME_PRESETS) as ThemePresetKey[];

      themeKeys.forEach((theme) => {
        const css = generateThemeCSSVars(theme);
        const preset = THEME_PRESETS[theme];

        expect(css).toContain(`--color-primary: ${preset.colors.primary}`);
        expect(css).toContain(`--color-background: ${preset.colors.background}`);
        expect(css).toContain(`--font-display: ${preset.fonts.display}`);
        expect(css).toContain(`--font-sans: ${preset.fonts.sans}`);
      });
    });

    it("should emit the EB Garamond + Hanken Grotesk pair for editorial-monograph", () => {
      const css = generateThemeCSSVars("editorial-monograph");
      expect(css).toContain("--font-display: var(--font-eb-garamond)");
      expect(css).toContain("--font-sans: var(--font-hanken-grotesk)");
    });

    it("should emit the Anton + Inter pair for brutalist-photojournalist", () => {
      const css = generateThemeCSSVars("brutalist-photojournalist");
      expect(css).toContain("--font-display: var(--font-anton)");
      expect(css).toContain("--font-sans: var(--font-inter)");
    });

    it("should emit the Newsreader + DM Sans pair for warm-print-catalogue", () => {
      const css = generateThemeCSSVars("warm-print-catalogue");
      expect(css).toContain("--font-display: var(--font-newsreader)");
      expect(css).toContain("--font-sans: var(--font-dm-sans)");
    });

    it("should emit the Bodoni Moda + DM Sans pair for modernist-tonal", () => {
      const css = generateThemeCSSVars("modernist-tonal");
      expect(css).toContain("--font-display: var(--font-bodoni-moda)");
      expect(css).toContain("--font-sans: var(--font-dm-sans)");
    });
  });

  describe("getThemeMetaColor", () => {
    it("should return primary color for forest-green theme", () => {
      const color = getThemeMetaColor("forest-green");
      expect(color).toBe("#7ba88e");
    });

    it("should return primary color for ocean-blue theme", () => {
      const color = getThemeMetaColor("ocean-blue");
      expect(color).toBe("#6c9bb5");
    });

    it("should return primary color for sunset-orange theme", () => {
      const color = getThemeMetaColor("sunset-orange");
      expect(color).toBe("#c08770");
    });

    it("should return primary color for midnight-purple theme", () => {
      const color = getThemeMetaColor("midnight-purple");
      expect(color).toBe("#8a7cad");
    });

    it("should return primary color for desert-sand theme", () => {
      const color = getThemeMetaColor("desert-sand");
      expect(color).toBe("#b39870");
    });

    it("should fall back to default theme for invalid theme", () => {
      const color = getThemeMetaColor("nonexistent" as ThemePresetKey);
      const defaultColor = getThemeMetaColor(DEFAULT_THEME);

      expect(color).toBe(defaultColor);
    });

    it("should return valid hex color format", () => {
      const themeKeys = Object.keys(THEME_PRESETS) as ThemePresetKey[];

      themeKeys.forEach((theme) => {
        const color = getThemeMetaColor(theme);
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe("getThemeBackgroundColor", () => {
    it("should return background color for forest-green theme", () => {
      const color = getThemeBackgroundColor("forest-green");
      expect(color).toBe("#0f1c14");
    });

    it("should return background color for ocean-blue theme", () => {
      const color = getThemeBackgroundColor("ocean-blue");
      expect(color).toBe("#0f1a23");
    });

    it("should return background color for sunset-orange theme", () => {
      const color = getThemeBackgroundColor("sunset-orange");
      expect(color).toBe("#1f1612");
    });

    it("should return background color for midnight-purple theme", () => {
      const color = getThemeBackgroundColor("midnight-purple");
      expect(color).toBe("#150f1d");
    });

    it("should return background color for desert-sand theme", () => {
      const color = getThemeBackgroundColor("desert-sand");
      expect(color).toBe("#1c1912");
    });

    it("should fall back to default theme for invalid theme", () => {
      const color = getThemeBackgroundColor("fake-theme" as ThemePresetKey);
      const defaultColor = getThemeBackgroundColor(DEFAULT_THEME);

      expect(color).toBe(defaultColor);
    });

    it("should return valid hex color format", () => {
      const themeKeys = Object.keys(THEME_PRESETS) as ThemePresetKey[];

      themeKeys.forEach((theme) => {
        const color = getThemeBackgroundColor(theme);
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it("should return appropriate background luminance for the theme's declared mode", () => {
      const themeKeys = Object.keys(THEME_PRESETS) as ThemePresetKey[];

      themeKeys.forEach((theme) => {
        const color = getThemeBackgroundColor(theme);
        const preset = THEME_PRESETS[theme];
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        if (preset.mode === "dark") {
          expect(r).toBeLessThan(80);
          expect(g).toBeLessThan(80);
          expect(b).toBeLessThan(80);
        } else {
          // Light themes should have a bright background (>= 200 on at least two channels)
          const channelsAboveThreshold = [r, g, b].filter((c) => c >= 200).length;
          expect(channelsAboveThreshold).toBeGreaterThanOrEqual(2);
        }
      });
    });
  });
});
