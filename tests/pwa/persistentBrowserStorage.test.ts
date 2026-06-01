import { afterEach, describe, expect, it } from "vitest";
import {
  getPersistedString,
  removePersistedString,
  resetPersistentBrowserStorageForTests,
  setPersistedString,
} from "@/pwa/persistentBrowserStorage";

describe("persistentBrowserStorage", () => {
  afterEach(async () => {
    await resetPersistentBrowserStorageForTests();
  });

  it("stores and reads a string value", async () => {
    await setPersistedString("test-key", "hello");
    await expect(getPersistedString("test-key")).resolves.toBe("hello");
  });

  it("migrates a legacy localStorage value when IndexedDB is available", async () => {
    localStorage.setItem("legacy-key", "from-local");
    await expect(getPersistedString("legacy-key")).resolves.toBe("from-local");

    if (typeof indexedDB === "undefined") {
      expect(localStorage.getItem("legacy-key")).toBe("from-local");
      return;
    }

    expect(localStorage.getItem("legacy-key")).toBeNull();
    await expect(getPersistedString("legacy-key")).resolves.toBe("from-local");
  });

  it("removes a stored value", async () => {
    await setPersistedString("rm-key", "x");
    await removePersistedString("rm-key");
    await expect(getPersistedString("rm-key")).resolves.toBeNull();
  });
});
