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

    it("should include all 6 CSS variables", () => {
      const css = generateThemeCSSVars("forest-green");

      const variables = [
        "--color-primary",
        "--color-background",
        "--color-surface",
        "--color-surface-border",
        "--color-text-primary",
        "--color-text-muted",
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
      });
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

    it("should return dark background colors (low luminance)", () => {
      const themeKeys = Object.keys(THEME_PRESETS) as ThemePresetKey[];

      themeKeys.forEach((theme) => {
        const color = getThemeBackgroundColor(theme);
        // Extract RGB values
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        // All backgrounds should be dark (low RGB values)
        expect(r).toBeLessThan(80);
        expect(g).toBeLessThan(80);
        expect(b).toBeLessThan(80);
      });
    });
  });
});
