import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMessage } from "../../fixtures/messages";

const deleteDoc = vi.hoisted(() => vi.fn(async () => {}));
const doc = vi.hoisted(() => vi.fn((db: unknown, ...path: string[]) => ({ db, path })));

vi.mock("@/utils/firestore", () => ({
  getFirestoreDb: vi.fn(async () => ({ name: "db" })),
}));

vi.mock("firebase/firestore", () => ({
  deleteDoc,
  doc,
}));

vi.mock("@/app/notifications/notifyIncomingMessage", () => ({
  notifyIncomingMessage: vi.fn(),
}));

import { useMessagesStore, flushPendingDeletesOnUnload } from "@/app/store/messagesStore";
import {
  clearPendingDeleteIdsForTests,
  readPendingDeleteIds,
} from "@/app/store/pendingDeletesStorage";

describe("messagesStore delete persistence", () => {
  beforeEach(() => {
    deleteDoc.mockClear();
    doc.mockClear();
    clearPendingDeleteIdsForTests();
    useMessagesStore.setState({
      messages: [createMessage({ id: "m1" })],
      selectedMessageId: "m1",
      searchQuery: "",
      sortBy: "newest",
      filterBy: "all",
      isLoading: false,
      error: null,
      hasLoadedOnce: true,
      _unsubscribe: null,
      _subscribeInFlight: false,
      _subscribeGeneration: 0,
      _pendingDeletes: {},
    });
  });

  it("commits Firestore delete after reload using persisted ids", async () => {
    expect(useMessagesStore.getState().queueDelete("m1")).toBe(true);
    expect(readPendingDeleteIds()).toEqual(["m1"]);

    useMessagesStore.setState({ messages: [], selectedMessageId: null, _pendingDeletes: {} });

    await useMessagesStore.getState().commitDelete("m1");

    expect(deleteDoc).toHaveBeenCalledOnce();
    expect(doc).toHaveBeenCalledWith({ name: "db" }, "messages", "m1");
    expect(readPendingDeleteIds()).toEqual([]);
  });

  it("commits pending deletes on unload so reload does not restore them", async () => {
    expect(useMessagesStore.getState().queueDelete("m1")).toBe(true);
    flushPendingDeletesOnUnload();
    await vi.waitFor(() => expect(deleteDoc).toHaveBeenCalledOnce());
    expect(readPendingDeleteIds()).toEqual([]);
  });
});
