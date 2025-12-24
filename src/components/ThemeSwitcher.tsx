"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function ThemeSwitcher() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg hover:bg-surface-dark transition-colors"
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="material-symbols-outlined text-xl">
        {mode === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
