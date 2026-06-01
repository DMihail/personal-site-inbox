import { afterEach, describe, expect, it, vi } from "vitest";
import { showBrowserNotification } from "@/app/push/notify";

const mockGetPwaRegistration = vi.fn().mockResolvedValue(null);

vi.mock("@/app/push/fcm", () => ({
  getPwaServiceWorkerRegistration: (...args: unknown[]) => mockGetPwaRegistration(...args),
}));

describe("showBrowserNotification", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses Notification constructor when no service worker registration", async () => {
    const notificationCtor = vi.fn();
    const notification = { permission: "granted" };
    vi.stubGlobal("Notification", Object.assign(notificationCtor, notification));
    vi.stubGlobal("window", { Notification: Object.assign(notificationCtor, notification) });

    const result = await showBrowserNotification("Test title", { body: "Hello" });

    expect(result.ok).toBe(true);
    expect(notificationCtor).toHaveBeenCalledWith(
      "Test title",
      expect.objectContaining({ body: "Hello", icon: "/favicon.png" }),
    );
  });

  it("uses service worker showNotification when page is controlled", async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    const registration = { active: { state: "activated" }, showNotification };

    vi.stubGlobal("navigator", {
      serviceWorker: {
        controller: {},
        getRegistration: vi.fn().mockResolvedValue(registration),
        ready: Promise.resolve(registration),
      },
    });
    vi.stubGlobal("Notification", { permission: "granted" });
    vi.stubGlobal("window", { Notification: { permission: "granted" } });

    const result = await showBrowserNotification("Test title", { body: "Hello" });

    expect(result.ok).toBe(true);
    expect(showNotification).toHaveBeenCalledWith(
      "Test title",
      expect.objectContaining({ body: "Hello" }),
    );
  });

  it("returns permission error when not granted", async () => {
    const notification = { permission: "default", requestPermission: vi.fn() };
    vi.stubGlobal("Notification", notification);
    vi.stubGlobal("window", { Notification: notification });

    const result = await showBrowserNotification("Test", {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("permission");
    }
  });
});
