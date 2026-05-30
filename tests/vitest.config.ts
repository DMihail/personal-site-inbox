import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { createAliases, projectRoot } from "../alias.config";

const testsDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  resolve: {
    alias: createAliases(),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [path.join(testsDir, "setup.ts")],
    include: [path.join(testsDir, "**/*.{test,spec}.{ts,tsx}")],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "tests/**",
        "src/main.tsx",
        "src/vite-plugins/**",
        "src/app/pages/dev/**",
      ],
    },
  },
});
