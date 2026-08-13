import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/firestore", () => ({
  getFirestoreDb: vi.fn(() => new Promise(() => {})),
}));

vi.mock("@/app/notifications/notifyIncomingMessage", () => ({
  notifyIncomingMessage: vi.fn(),
}));

import { useMessagesStore } from "@/app/store/messagesStore";

describe("messagesStore subscription lifecycle", () => {
  beforeEach(() => {
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
});
