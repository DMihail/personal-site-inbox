import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("service worker", () => {
  it("loads FCM handlers before Workbox setup", () => {
    const swSource = readFileSync(path.join(process.cwd(), "src/sw.js"), "utf8");
    const firebaseIndex = swSource.indexOf('importScripts("/firebase-messaging-sw.js")');
    const workboxIndex = swSource.indexOf("workbox-precaching");

    expect(firebaseIndex).toBeGreaterThanOrEqual(0);
    expect(workboxIndex).toBeGreaterThan(firebaseIndex);
    expect(swSource).not.toContain("storage.googleapis.com/workbox-cdn");
  });

  it("registers clientsClaim at top level, not inside activate", () => {
    const swSource = readFileSync(path.join(process.cwd(), "src/sw.js"), "utf8");
    expect(swSource).toMatch(/clientsClaim\(\)/);
    expect(swSource).not.toMatch(
      /addEventListener\s*\(\s*["']activate["'][^)]*clientsClaim/,
    );
  });
});
