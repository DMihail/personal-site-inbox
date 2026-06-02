import { afterEach, describe, expect, it, vi } from "vitest";
import { showNotificationOnce } from "@/push/dedupe";

describe("notificationDedupe", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("shows once per message id per session", async () => {
    const show = vi.fn().mockResolvedValue(undefined);

    await showNotificationOnce("msg-1", show);
    await showNotificationOnce("msg-1", show);

    expect(show).toHaveBeenCalledTimes(1);
  });

  it("allows different message ids", async () => {
    const show = vi.fn().mockResolvedValue(undefined);

    await showNotificationOnce("msg-1", show);
    await showNotificationOnce("msg-2", show);

    expect(show).toHaveBeenCalledTimes(2);
  });

  it("shows when message id is missing", async () => {
    const show = vi.fn().mockResolvedValue(undefined);

    await showNotificationOnce(undefined, show);
    await showNotificationOnce(undefined, show);

    expect(show).toHaveBeenCalledTimes(2);
  });
});
