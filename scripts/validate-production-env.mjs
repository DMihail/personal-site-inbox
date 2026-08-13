#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/** Load key=value pairs from a dotenv file into process.env (does not override). */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env.production"));
loadEnvFile(resolve(process.cwd(), ".env.production.local"));

/** Fail production builds when required client env is missing. */
const required = [
  "VITE_ZUSTAND_STORAGE_KEY",
  "VITE_FIREBASE_APIKEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

/** Recommended for push; warn but do not fail the build. */
const recommended = ["VITE_FIREBASE_MESSAGE_SENDER_ID", "VITE_FIREBASE_VAPID_KEY"];

const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error(`[build] Missing required environment variable(s): ${missing.join(", ")}`);
  console.error(
    "[build] Set them in .env / Vercel env. See .env.example for the full list.",
  );
  process.exit(1);
}

const missingRecommended = recommended.filter((name) => !process.env[name]?.trim());
if (missingRecommended.length > 0) {
  console.warn(
    `[build] Missing recommended push env (background FCM may be limited): ${missingRecommended.join(", ")}`,
  );
}
