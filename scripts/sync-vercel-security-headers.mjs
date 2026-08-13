/**
 * Writes security headers from `security-headers.ts` into `vercel.json`.
 * Run: npm run sync:security-headers
 *
 * Loads `.env*` first so `VITE_PORTFOLIO_API_URL` can tighten `connect-src`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vercelPath = path.join(root, "vercel.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
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

for (const name of [".env", ".env.local", ".env.production", ".env.production.local"]) {
  loadEnvFile(path.join(root, name));
}

const { vercelHeaderEntries, portfolioApiConnectOrigin } = await import(
  pathToFileURL(path.join(root, "security-headers.ts")).href
);

const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
const globalHeaders = vercel.headers?.find((entry) => entry.source === "/(.*)");

if (!globalHeaders) {
  throw new Error('vercel.json: missing headers entry with source "/(.*)"');
}

globalHeaders.headers = vercelHeaderEntries();

fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, "utf8");

const portfolioOrigin = portfolioApiConnectOrigin();
console.log(
  portfolioOrigin
    ? `[sync:security-headers] connect-src includes portfolio origin ${portfolioOrigin}`
    : "[sync:security-headers] VITE_PORTFOLIO_API_URL unset — connect-src keeps https: fallback",
);
