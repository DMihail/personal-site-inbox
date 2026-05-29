import { beforeEach, describe, expect, it, vi } from "vitest";

const pushState = vi.hoisted(() => ({
  enabled: false,
  token: null as string | null,
}));

vi.mock("@/app/store/pushStore", () => ({
  usePushStore: {
    getState: () => pushState,
  },
}));

vi.mock("@/app/push/notificationPermission", () => ({
  canShowBrowserNotifications: vi.fn(),
}));

import { canShowBrowserNotifications } from "@/app/push/notificationPermission";
import { shouldNotifyNewMessages } from "@/app/push/shouldNotify";

describe("shouldNotifyNewMessages", () => {
  beforeEach(() => {
    pushState.enabled = false;
    pushState.token = null;
    vi.mocked(canShowBrowserNotifications).mockReturnValue(true);
  });

  it("returns false when browser notifications are not granted", () => {
    vi.mocked(canShowBrowserNotifications).mockReturnValue(false);
    pushState.enabled = true;
    expect(shouldNotifyNewMessages()).toBe(false);
  });

  it("returns false when push is disabled", () => {
    pushState.enabled = false;
    pushState.token = null;
    expect(shouldNotifyNewMessages()).toBe(false);
  });

  it("returns true when push enabled without FCM token (Firestore fallback)", () => {
    pushState.enabled = true;
    pushState.token = null;
    expect(shouldNotifyNewMessages()).toBe(true);
  });

  it("returns false when FCM token exists (server/onMessage handles alerts)", () => {
    pushState.enabled = true;
    pushState.token = "fcm-token-abc";
    expect(shouldNotifyNewMessages()).toBe(false);
  });
});
