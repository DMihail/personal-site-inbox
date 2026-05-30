/**
 * Writes security headers from `security-headers.ts` into `vercel.json`.
 * Run: npm run sync:security-headers
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vercelPath = path.join(root, "vercel.json");

const { vercelHeaderEntries } = await import(
  pathToFileURL(path.join(root, "security-headers.ts")).href
);

const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
const globalHeaders = vercel.headers?.find((entry) => entry.source === "/(.*)");

if (!globalHeaders) {
  throw new Error('vercel.json: missing headers entry with source "/(.*)"');
}

globalHeaders.headers = vercelHeaderEntries();

fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, "utf8");
