import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// Next 16 removed the `next lint` command, so ESLint is driven by its own CLI
// against this flat config instead.
export default [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    // Build-time Node scripts are plain CommonJS.
    files: ["scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
];
