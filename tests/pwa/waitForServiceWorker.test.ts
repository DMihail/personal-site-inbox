import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getActiveServiceWorkerRegistration,
  isMessagingServiceWorker,
  isPushCapableServiceWorker,
  isWorkboxServiceWorker,
} from "@/pwa/waitForServiceWorker";

describe("waitForServiceWorker helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("detects workbox service worker script", () => {
    const reg = {
      active: { scriptURL: "http://localhost/sw.js" },
    } as ServiceWorkerRegistration;
    expect(isWorkboxServiceWorker(reg)).toBe(true);
    expect(isPushCapableServiceWorker(reg)).toBe(true);
  });

  it("detects standalone FCM service worker script", () => {
    const reg = {
      active: { scriptURL: "http://localhost/firebase-messaging-sw.js" },
    } as ServiceWorkerRegistration;
    expect(isMessagingServiceWorker(reg)).toBe(true);
    expect(isPushCapableServiceWorker(reg)).toBe(true);
    expect(isWorkboxServiceWorker(reg)).toBe(false);
  });

  it("returns null immediately when no registration exists", async () => {
    const ready = new Promise<ServiceWorkerRegistration>(() => {
      // Intentionally never resolves — would hang the old implementation.
    });

    vi.stubGlobal("navigator", {
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue(undefined),
        ready,
      },
    });

    const result = await Promise.race([
      getActiveServiceWorkerRegistration("/"),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 50);
      }).then((value) => value ?? "timeout"),
    ]);

    expect(result).toBe(null);
  });
});
