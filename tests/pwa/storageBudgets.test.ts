import { describe, expect, it } from "vitest";
import {
  FIRESTORE_OFFLINE_CACHE_BYTES,
  MIB,
  WORKBOX_ASSETS_MAX_ENTRIES,
} from "@/pwa/storageBudgets";

describe("storageBudgets", () => {
  it("allocates increased mobile-friendly cache budgets", () => {
    expect(FIRESTORE_OFFLINE_CACHE_BYTES).toBeGreaterThanOrEqual(40 * MIB);
    expect(WORKBOX_ASSETS_MAX_ENTRIES).toBeGreaterThanOrEqual(80);
  });
});
