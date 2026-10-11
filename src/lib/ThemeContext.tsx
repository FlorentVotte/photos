"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemePresetKey, THEME_PRESETS } from "./themes";
import { generateThemeCSSVars } from "./theme-utils";

interface ThemeContextType {
  theme: ThemePresetKey;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme: ThemePresetKey;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme] = useState<ThemePresetKey>(initialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply CSS variables to document root
    const cssVars = generateThemeCSSVars(theme);
    // cssText replaces the whole inline style, so keep the colour-scheme the server rendered.
    document.documentElement.style.cssText = `${cssVars}; color-scheme: ${THEME_PRESETS[theme].mode};`;
  }, [theme, mounted]);

  const value: ThemeContextType = { theme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Get preset data for a theme (useful for admin UI)
export function getThemePreset(theme: ThemePresetKey) {
  return THEME_PRESETS[theme];
}
