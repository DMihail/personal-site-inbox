import { afterEach, describe, expect, it, vi } from "vitest";
import {
  markNotificationShown,
  showNotificationOnce,
  wasNotificationShown,
} from "@/app/push/notificationDedupe";

describe("notificationDedupe", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("shows once per message id per session", async () => {
    const show = vi.fn().mockResolvedValue(undefined);

    await showNotificationOnce("msg-1", show);
    await showNotificationOnce("msg-1", show);

    expect(show).toHaveBeenCalledTimes(1);
    expect(wasNotificationShown("msg-1")).toBe(true);
  });

  it("allows different message ids", async () => {
    const show = vi.fn().mockResolvedValue(undefined);

    await showNotificationOnce("msg-1", show);
    await showNotificationOnce("msg-2", show);

    expect(show).toHaveBeenCalledTimes(2);
  });

  it("tracks ids via markNotificationShown", () => {
    markNotificationShown("abc");
    expect(wasNotificationShown("abc")).toBe(true);
    expect(wasNotificationShown("xyz")).toBe(false);
  });
});
