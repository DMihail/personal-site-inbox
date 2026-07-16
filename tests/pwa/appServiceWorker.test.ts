import { describe, expect, it } from "vitest";
import { isAppServiceWorker, isLegacyMessagingServiceWorker } from "@/pwa/appServiceWorker";

describe("appServiceWorker", () => {
  it("detects unified /sw.js vs legacy messaging SW", () => {
    expect(
      isAppServiceWorker({
        active: { scriptURL: "https://inbox.example/sw.js" },
      } as ServiceWorkerRegistration),
    ).toBe(true);

    expect(
      isLegacyMessagingServiceWorker({
        active: { scriptURL: "https://inbox.example/firebase-messaging-sw.js" },
      } as ServiceWorkerRegistration),
    ).toBe(true);

    expect(
      isAppServiceWorker({
        active: { scriptURL: "https://inbox.example/firebase-messaging-sw.js" },
      } as ServiceWorkerRegistration),
    ).toBe(false);
  });
});
