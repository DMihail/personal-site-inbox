import { describe, expect, it } from "vitest";
import { isWorkboxServiceWorker } from "@/pwa/waitForServiceWorker";

describe("waitForServiceWorker helpers", () => {
  it("detects workbox service worker script", () => {
    const reg = {
      active: { scriptURL: "http://localhost/sw.js" },
    } as ServiceWorkerRegistration;
    expect(isWorkboxServiceWorker(reg)).toBe(true);
  });
});
