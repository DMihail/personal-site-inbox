import { afterEach, describe, expect, it } from "vitest";
import {
  getOrCreatePushDeviceId,
  initPushDeviceId,
  resetPushDeviceIdCacheForTests,
} from "@/app/push/pushDeviceId";
import { resetPersistentBrowserStorageForTests } from "@/pwa/persistentBrowserStorage";

describe("getOrCreatePushDeviceId", () => {
  afterEach(async () => {
    resetPushDeviceIdCacheForTests();
    await resetPersistentBrowserStorageForTests();
  });

  it("returns a stable id after init", async () => {
    const first = await initPushDeviceId();
    const second = getOrCreatePushDeviceId();
    expect(second).toBe(first);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("creates a new id when storage is empty", async () => {
    const id = await initPushDeviceId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(getOrCreatePushDeviceId()).toBe(id);
  });
});
