import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { VitePWA } from "vite-plugin-pwa";
import { firebaseMessagingSwPlugin } from "./src/vite-plugins/firebaseMessagingSw";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const securityHeaders: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default defineConfig({
  plugins: [
    firebaseMessagingSwPlugin(),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "icon.png", "site.webmanifest", "robots.txt"],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Premium Engineering Inbox Design",
        short_name: "Inbox",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#00d9ff",
        icons: [
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        importScripts: ["firebase-messaging-sw.js"],
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "document" ||
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-shell",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image" || request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
