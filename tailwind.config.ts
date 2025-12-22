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
        primary: "#1dc964",
        "background-light": "#f6f8f7",
        "background-dark": "#112118",
        "surface-dark": "#1a2e22",
        "surface-border": "#254633",
        "text-muted": "#95c6a9",
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
