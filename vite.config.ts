import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { VitePWA } from "vite-plugin-pwa";
import { createAliases } from "./alias.config";
import {
  buildDevSecurityHeaders,
  buildProductionSecurityHeaders,
} from "./security-headers";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
  const portfolioApiProxyTarget =
    env.VITE_PORTFOLIO_API_URL?.trim().replace(/\/$/, "") || "http://localhost:3000";

  return {
    plugins: [
      react(),
      babel({
        presets: [reactCompilerPreset()],
      }),
      tailwindcss(),
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.js",
        registerType: "prompt",
        injectRegister: false,
        includeAssets: [
          "favicon.png",
          "apple-touch-icon.png",
          "icon.png",
          "icon-192.png",
          "icon-512.png",
          "robots.txt",
        ],
        devOptions: {
          enabled: false,
        },
        manifest: {
          name: "Developer Inbox",
          short_name: "Inbox",
          description:
            "Private operator inbox for contact messages. Sign-in required — not a public site.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#0a0a0a",
          theme_color: "#0a0a0a",
          ...({ gcm_sender_id: "103953800507" } as { gcm_sender_id: string }),
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest,woff2}"],
        },
      }),
    ],
    resolve: {
      alias: createAliases(),
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
      headers: buildDevSecurityHeaders(),
      proxy: {
        "/api": {
          target: portfolioApiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      headers: buildProductionSecurityHeaders(),
    },
    assetsInclude: ["**/*.svg"],
  };
});
