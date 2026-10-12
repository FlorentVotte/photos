import { cache } from "react";
import prisma from "@/lib/db";
import { DEFAULT_THEME, THEME_PRESETS, ThemePresetKey } from "@/lib/themes";

/**
 * Read the active theme from the database (memoised per request via React cache). Falls back to DEFAULT_THEME when the
 * DB is absent (build time), the read fails, or the stored key is unknown.
 */
export const getActiveTheme = cache(async (): Promise<ThemePresetKey> => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
      select: { theme: true },
    });
    const theme = settings?.theme;
    return theme && theme in THEME_PRESETS ? (theme as ThemePresetKey) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
});
