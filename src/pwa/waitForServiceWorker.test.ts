import { describe, expect, it } from "vitest";
import { isMessagingServiceWorker, isWorkboxServiceWorker } from "./waitForServiceWorker";

describe("waitForServiceWorker helpers", () => {
  it("detects messaging worker script", () => {
    const reg = {
      active: { scriptURL: "http://localhost/firebase-messaging-sw.js" },
    } as ServiceWorkerRegistration;
    expect(isMessagingServiceWorker(reg)).toBe(true);
    expect(isWorkboxServiceWorker(reg)).toBe(false);
  });

  it("detects workbox worker script", () => {
    const reg = {
      active: { scriptURL: "http://localhost/sw.js" },
    } as ServiceWorkerRegistration;
    expect(isWorkboxServiceWorker(reg)).toBe(true);
  });
});
