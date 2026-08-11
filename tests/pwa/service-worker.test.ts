import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { projectRoot } from "../../alias.config";

describe("app service worker source", () => {
  it("registers bundled FCM before Workbox precache (no gstatic importScripts)", () => {
    const swSource = readFileSync(path.join(projectRoot, "src/sw.js"), "utf8");
    const fcmIndex = swSource.indexOf("registerFirebaseMessagingBackground");
    const workboxIndex = swSource.indexOf("workbox-precaching");

    expect(fcmIndex).toBeGreaterThanOrEqual(0);
    expect(workboxIndex).toBeGreaterThan(fcmIndex);
    expect(swSource).not.toContain("importScripts");
    expect(swSource).not.toContain("gstatic.com");
    expect(swSource).not.toContain("storage.googleapis.com/workbox-cdn");
  });
});
