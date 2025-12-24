"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemePresetKey, ThemeMode, DEFAULT_MODE, THEME_PRESETS } from "./themes";
import { generateThemeCSSVars } from "./theme-utils";

interface ThemeContextType {
  theme: ThemePresetKey;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme: ThemePresetKey;
  initialMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  initialTheme,
  initialMode = DEFAULT_MODE
}: ThemeProviderProps) {
  // Theme comes from server (admin setting), mode from localStorage (visitor preference)
  const [theme] = useState<ThemePresetKey>(initialTheme);
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage for visitor's mode preference
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode && (savedMode === "light" || savedMode === "dark")) {
      setModeState(savedMode);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply CSS variables to document root
    const cssVars = generateThemeCSSVars(theme, mode);
    document.documentElement.style.cssText = cssVars;

    // Update class for light/dark mode
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.classList.toggle("light", mode === "light");
  }, [theme, mode, mounted]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const toggleMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  // Provide the theme preset object for components that need color info
  const value: ThemeContextType = {
    theme,
    mode,
    setMode,
    toggleMode,
  };

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
