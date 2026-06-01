import { afterEach, describe, expect, it, vi } from "vitest";
import { getOrCreatePushDeviceId } from "@/app/push/pushDeviceId";

describe("getOrCreatePushDeviceId", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns a stable id from localStorage", () => {
    const first = getOrCreatePushDeviceId();
    const second = getOrCreatePushDeviceId();
    expect(second).toBe(first);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("creates a new id when storage is empty", () => {
    expect(localStorage.getItem("inbox-push-device-id")).toBeNull();
    const id = getOrCreatePushDeviceId();
    expect(localStorage.getItem("inbox-push-device-id")).toBe(id);
  });
});
