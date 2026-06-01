import { afterEach, describe, expect, it, vi } from "vitest";
import { showBrowserNotification } from "@/app/push/notify";

vi.mock("@/app/push/fcm", () => ({
  getPwaServiceWorkerRegistration: vi.fn().mockResolvedValue(null),
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
