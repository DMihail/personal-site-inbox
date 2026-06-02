import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beginNotificationPermissionRequest,
  finishNotificationPermissionRequest,
  getPushNotificationSupport,
} from "@/push/permissions";

describe("notificationPermission", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("blocks notification request outside a secure context", () => {
    vi.stubGlobal("window", {
      isSecureContext: false,
      Notification: { permission: "default", requestPermission: vi.fn() },
    });

    const support = getPushNotificationSupport();
    expect(support.ok).toBe(false);
    if (!support.ok) {
      expect(support.message).toContain("HTTPS");
    }

    const began = beginNotificationPermissionRequest();
    expect(began.ok).toBe(false);
  });

  it("starts requestPermission synchronously when permission is default", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    const notification = { permission: "default", requestPermission };
    vi.stubGlobal("Notification", notification);
    vi.stubGlobal("window", {
      isSecureContext: true,
      matchMedia: () => ({ matches: false }),
      Notification: notification,
    });
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
      standalone: false,
    });

    const began = beginNotificationPermissionRequest();
    expect(began.ok).toBe(true);
    expect(requestPermission).toHaveBeenCalledTimes(1);

    if (began.ok) {
      const result = await finishNotificationPermissionRequest(began.permissionPromise);
      expect(result.ok).toBe(true);
    }
  });

  it("does not call requestPermission when already denied", () => {
    const requestPermission = vi.fn();
    const notification = { permission: "denied", requestPermission };
    vi.stubGlobal("Notification", notification);
    vi.stubGlobal("window", {
      isSecureContext: true,
      matchMedia: () => ({ matches: false }),
      Notification: notification,
    });
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
    });

    const began = beginNotificationPermissionRequest();
    expect(began.ok).toBe(false);
    expect(requestPermission).not.toHaveBeenCalled();
  });
});
