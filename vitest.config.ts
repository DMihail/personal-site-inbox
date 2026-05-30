import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { createAliases } from "./alias.config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: createAliases(),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
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
