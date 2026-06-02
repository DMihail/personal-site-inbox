import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushState = { enabled: false, token: null as string | null };

vi.mock("@/push/store", () => ({
  usePushStore: {
    getState: () => pushState,
  },
}));

vi.mock("@/push/permissions", () => ({
  canShowBrowserNotifications: vi.fn(() => true),
}));

import { canShowBrowserNotifications } from "@/push/permissions";
import { shouldNotifyViaFirestore } from "@/push/fallback";

describe("shouldNotifyViaFirestore", () => {
  beforeEach(() => {
    pushState.enabled = false;
    pushState.token = null;
    vi.mocked(canShowBrowserNotifications).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when push is disabled", () => {
    pushState.enabled = false;
    expect(shouldNotifyViaFirestore()).toBe(false);
  });

  it("returns false when permission is not granted", () => {
    pushState.enabled = true;
    vi.mocked(canShowBrowserNotifications).mockReturnValue(false);
    expect(shouldNotifyViaFirestore()).toBe(false);
  });

  it("returns true when push enabled without FCM token", () => {
    pushState.enabled = true;
    pushState.token = null;
    expect(shouldNotifyViaFirestore()).toBe(true);
  });

  it("returns false when FCM token exists", () => {
    pushState.enabled = true;
    pushState.token = "fcm-token-abc";
    expect(shouldNotifyViaFirestore()).toBe(false);
  });
});
