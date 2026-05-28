import { describe, expect, it, vi } from "vitest";
import {
  getNotificationPermissionError,
  getPushNotificationSupport,
} from "./notificationPermission";

describe("getNotificationPermissionError", () => {
  it("describes denied state", () => {
    expect(getNotificationPermissionError("denied")).toMatch(/blocked/i);
  });

  it("describes default state", () => {
    expect(getNotificationPermissionError("default")).toMatch(/not granted/i);
  });
});

describe("getPushNotificationSupport", () => {
  it("requires secure context", () => {
    vi.stubGlobal("isSecureContext", false);
    const result = getPushNotificationSupport();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/HTTPS/i);
    }
    vi.unstubAllGlobals();
  });
});
