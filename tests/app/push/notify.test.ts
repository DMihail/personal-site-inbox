import { afterEach, describe, expect, it, vi } from "vitest";
import { showBrowserNotification } from "@/push/display";

vi.mock("@/push/service-worker", () => ({
  getActiveFcmRegistration: vi.fn().mockResolvedValue(null),
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
    expect(notificationCtor).toHaveBeenCalled();
  });

  it("returns permission error when not granted", async () => {
    vi.stubGlobal("Notification", { permission: "default", requestPermission: vi.fn() });
    vi.stubGlobal("window", {
      Notification: { permission: "default", requestPermission: vi.fn() },
    });

    const result = await showBrowserNotification("Test", {});

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("permission");
  });
});
