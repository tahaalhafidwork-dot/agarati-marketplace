import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["apps/mobile/metro.config.js"],
    rules: {
      // Expo's Metro config is CommonJS and requires this package at startup.
      "@typescript-eslint/no-require-imports": [
        "error",
        { allow: ["^expo/metro-config$"] },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tools/**",
    "apps/mobile/.expo/**",
  ]),
]);

export default eslintConfig;
