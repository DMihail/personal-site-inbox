import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/firestore", () => ({
  getFirestoreDb: vi.fn(() => new Promise(() => {})),
}));

vi.mock("@/app/notifications/notifyIncomingMessage", () => ({
  notifyIncomingMessage: vi.fn(),
}));

import { useMessagesStore } from "@/app/store/messagesStore";
import {
  clearPendingDeleteIdsForTests,
  readPendingDeleteIds,
} from "@/app/store/pendingDeletesStorage";

describe("messagesStore subscription lifecycle", () => {
  beforeEach(() => {
    clearPendingDeleteIdsForTests();
    useMessagesStore.setState({
      messages: [],
      selectedMessageId: null,
      searchQuery: "",
      sortBy: "newest",
      filterBy: "all",
      isLoading: false,
      error: null,
      hasLoadedOnce: false,
      _unsubscribe: null,
      _subscribeInFlight: false,
      _subscribeGeneration: 0,
      _pendingDeletes: {},
    });
  });

  it("marks loading when subscription starts", () => {
    useMessagesStore.getState().startSubscription();
    const state = useMessagesStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state._subscribeInFlight).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stopSubscription cancels an in-flight start via generation bump", () => {
    useMessagesStore.getState().startSubscription();
    const generationWhileLoading = useMessagesStore.getState()._subscribeGeneration;
    useMessagesStore.getState().stopSubscription();
    const afterStop = useMessagesStore.getState();
    expect(afterStop._subscribeInFlight).toBe(false);
    expect(afterStop.isLoading).toBe(false);
    expect(afterStop._subscribeGeneration).toBeGreaterThan(generationWhileLoading);
  });

  it("restartSubscription stops then starts again", () => {
    useMessagesStore.getState().startSubscription();
    useMessagesStore.getState().restartSubscription();
    const state = useMessagesStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state._subscribeInFlight).toBe(true);
  });

  it("queueDelete hides a message and undoDelete restores it", () => {
    const message = {
      id: "m1",
      senderName: "Ada",
      senderEmail: "ada@example.com",
      company: "—",
      subject: "Message from Ada",
      preview: "Hello",
      timestamp: new Date("2024-01-01T00:00:00.000Z"),
      isRead: false,
      isImportant: false,
      isArchived: false,
      source: "contact",
    };
    useMessagesStore.setState({ messages: [message], selectedMessageId: "m1" });
    expect(useMessagesStore.getState().queueDelete("m1")).toBe(true);
    expect(useMessagesStore.getState().messages).toEqual([]);
    expect(useMessagesStore.getState().selectedMessageId).toBeNull();
    expect(readPendingDeleteIds()).toEqual(["m1"]);
    expect(useMessagesStore.getState().undoDelete("m1")).toBe(true);
    expect(useMessagesStore.getState().messages).toEqual([message]);
    expect(useMessagesStore.getState().selectedMessageId).toBe("m1");
    expect(readPendingDeleteIds()).toEqual([]);
  });

  it("commitDelete is a no-op after undo", async () => {
    const message = {
      id: "m1",
      senderName: "Ada",
      senderEmail: "ada@example.com",
      company: "—",
      subject: "Message from Ada",
      preview: "Hello",
      timestamp: new Date("2024-01-01T00:00:00.000Z"),
      isRead: false,
      isImportant: false,
      isArchived: false,
      source: "contact",
    };
    useMessagesStore.setState({ messages: [message], selectedMessageId: "m1" });
    expect(useMessagesStore.getState().queueDelete("m1")).toBe(true);
    expect(useMessagesStore.getState().undoDelete("m1")).toBe(true);
    await expect(useMessagesStore.getState().commitDelete("m1")).resolves.toBeUndefined();
    expect(useMessagesStore.getState().messages).toEqual([message]);
    expect(useMessagesStore.getState()._pendingDeletes).toEqual({});
  });
});
