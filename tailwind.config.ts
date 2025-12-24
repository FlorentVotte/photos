import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic theme colors via CSS variables
        primary: "var(--color-primary)",
        "background-light": "var(--color-background)",
        "background-dark": "var(--color-background)",
        "surface-dark": "var(--color-surface)",
        "surface-border": "var(--color-surface-border)",
        "text-muted": "var(--color-text-muted)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Noto Serif", "serif"],
        sans: ["var(--font-sans)", "Noto Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
