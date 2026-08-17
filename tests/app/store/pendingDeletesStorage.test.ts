import { afterEach, describe, expect, it } from "vitest";
import {
  addPendingDeleteId,
  clearPendingDeleteIdsForTests,
  readPendingDeleteIds,
  removePendingDeleteId,
} from "@/app/store/pendingDeletesStorage";

describe("pendingDeletesStorage", () => {
  afterEach(() => {
    clearPendingDeleteIdsForTests();
  });

  it("round-trips ids and ignores junk", () => {
    addPendingDeleteId("m1");
    addPendingDeleteId("m1");
    addPendingDeleteId("");
    expect(readPendingDeleteIds()).toEqual(["m1"]);
    removePendingDeleteId("m1");
    expect(readPendingDeleteIds()).toEqual([]);
  });
});
