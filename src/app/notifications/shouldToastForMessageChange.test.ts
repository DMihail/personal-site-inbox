import { describe, expect, it } from "vitest";
import { shouldToastForMessageChange } from "./shouldToastForMessageChange";

describe("shouldToastForMessageChange", () => {
  const known = new Set(["existing"]);

  it("skips before the first snapshot is applied", () => {
    expect(
      shouldToastForMessageChange(
        { type: "added", doc: { id: "new" } },
        { hasLoadedOnce: false, knownMessageIds: known },
      ),
    ).toBe(false);
  });

  it("skips added docs that were already in the list", () => {
    expect(
      shouldToastForMessageChange(
        { type: "added", doc: { id: "existing" } },
        { hasLoadedOnce: true, knownMessageIds: known },
      ),
    ).toBe(false);
  });

  it("toasts only for new message ids after initial load", () => {
    expect(
      shouldToastForMessageChange(
        { type: "added", doc: { id: "new" } },
        { hasLoadedOnce: true, knownMessageIds: known },
      ),
    ).toBe(true);
  });

  it("ignores modified and removed changes", () => {
    expect(
      shouldToastForMessageChange(
        { type: "modified", doc: { id: "new" } },
        { hasLoadedOnce: true, knownMessageIds: known },
      ),
    ).toBe(false);
  });
});
