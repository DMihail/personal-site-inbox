import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("service worker", () => {
  it("loads FCM handlers before Workbox setup", () => {
    const swSource = readFileSync(path.join(process.cwd(), "src/sw.js"), "utf8");
    const firebaseIndex = swSource.indexOf('importScripts("/firebase-messaging-sw.js")');
    const workboxIndex = swSource.indexOf("workbox-sw.js");

    expect(firebaseIndex).toBeGreaterThanOrEqual(0);
    expect(workboxIndex).toBeGreaterThan(firebaseIndex);
  });
});
