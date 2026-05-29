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

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      react(),
      babel({
        presets: [reactCompilerPreset()],
      }),
      tailwindcss(),
      firebaseMessagingSwPlugin(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: isProd ? "inline" : false,
        includeAssets: ["favicon.png", "icon.png", "site.webmanifest", "robots.txt"],
        devOptions: {
          enabled: false,
        },
        manifest: {
          name: "Developer Inbox",
          short_name: "Inbox",
          description: "Contact message inbox with push notifications",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#0a0a0a",
          theme_color: "#0a0a0a",
          icons: [
            {
              src: "/icon.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
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
                matchOptions: { ignoreVary: true },
              },
            },
            {
              urlPattern: ({ request }) =>
                request.destination === "image" || request.destination === "font",
              handler: "CacheFirst",
              options: {
                cacheName: "assets",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
                matchOptions: { ignoreVary: true },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "es2022",
      cssMinify: true,
      modulePreload: {
        resolveDependencies(_filename, deps) {
          return deps.filter(
            (dep) =>
              !dep.includes("firebase-firestore") &&
              !dep.includes("firebase-messaging") &&
              !dep.includes("InboxShell") &&
              !dep.includes("MobileInboxLayout") &&
              !dep.includes("DesktopInboxLayout"),
          );
        },
      },
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "firebase-firestore",
                test: /node_modules\/(firebase\/firestore|@firebase\/firestore)/,
              },
              {
                name: "firebase-auth",
                test: /node_modules\/(firebase\/auth|@firebase\/auth)/,
              },
              {
                name: "firebase-messaging",
                test: /node_modules\/(firebase\/messaging|@firebase\/messaging)/,
              },
              {
                name: "vendor",
                test: /node_modules/,
              },
            ],
          },
        },
      },
    },
    server: {
      headers: securityHeaders,
    },
    preview: {
      headers: securityHeaders,
    },
    assetsInclude: ["**/*.svg", "**/*.csv"],
  };
});
