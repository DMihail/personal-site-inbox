import { afterEach, describe, expect, it } from "vitest";
import {
  getDeviceId,
  initDeviceId,
  resetDeviceIdCacheForTests,
} from "@/push/device-id";

describe("device-id", () => {
  afterEach(() => {
    resetDeviceIdCacheForTests();
    localStorage.clear();
  });

  it("returns the same id after init", async () => {
    const id = await initDeviceId();
    expect(getDeviceId()).toBe(id);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
