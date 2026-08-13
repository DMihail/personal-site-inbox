import { create } from "zustand";
import { getFirestoreDb } from "@/utils/firestore";
import type { FilterOption, Message, SortOption } from "../features/inbox/types";
import {
  mapFirestoreMessage,
} from "../features/inbox/mapFirestoreMessage";
import { shouldToastForMessageChange } from "../notifications/shouldToastForMessageChange";
import { notifyIncomingMessage } from "../notifications/notifyIncomingMessage";

interface MessagesState {
  messages: Message[];
  selectedMessageId: string | null;
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  isLoading: boolean;
  error: string | null;
  hasLoadedOnce: boolean;
  _unsubscribe: (() => void) | null;
  _subscribeInFlight: boolean;
  _subscribeGeneration: number;

  startSubscription: () => void;
  stopSubscription: () => void;
  /** Tear down and start a fresh Firestore listener (offline retry). */
  restartSubscription: () => void;

  selectMessage: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (s: SortOption) => void;
  setFilterBy: (f: FilterOption) => void;

  markAsRead: (id: string) => Promise<void>;
  /** Toggles archived; optimistic local update. */
  archive: (id: string) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function patchMessage(messages: Message[], id: string, patch: Partial<Message>): Message[] {
  return messages.map((message) => (message.id === id ? { ...message, ...patch } : message));
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
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

  startSubscription: () => {
    if (get()._unsubscribe || get()._subscribeInFlight) return;

    const generation = get()._subscribeGeneration + 1;
    set({
      isLoading: true,
      error: null,
      _subscribeInFlight: true,
      _subscribeGeneration: generation,
    });

    void getFirestoreDb()
      .then(async (firestoreDb) => {
        if (get()._subscribeGeneration !== generation) return;

        const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
        if (get()._subscribeGeneration !== generation) return;

        const q = query(collection(firestoreDb, "messages"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(
          q,
          (snap) => {
            if (get()._subscribeGeneration !== generation) return;

            const knownMessageIds = new Set(get().messages.map((m) => m.id));
            const { hasLoadedOnce } = get();

            for (const ch of snap.docChanges()) {
              if (!shouldToastForMessageChange(ch, { hasLoadedOnce, knownMessageIds })) {
                continue;
              }
              const msg = mapFirestoreMessage(ch.doc.id, ch.doc.data());
              if (!msg) continue;
              notifyIncomingMessage(msg, (id) => get().selectMessage(id));
            }

            const msgs: Message[] = [];
            snap.forEach((d) => {
              const mapped = mapFirestoreMessage(d.id, d.data());
              if (mapped) msgs.push(mapped);
            });
            set({ messages: msgs, isLoading: false, error: null, hasLoadedOnce: true });
          },
          (err) => {
            if (get()._subscribeGeneration !== generation) return;
            set({ error: err.message, isLoading: false });
          },
        );

        if (get()._subscribeGeneration !== generation) {
          unsub();
          return;
        }

        set({ _unsubscribe: unsub });
      })
      .catch((err: unknown) => {
        if (get()._subscribeGeneration !== generation) return;
        const message = err instanceof Error ? err.message : "Could not connect to inbox";
        set({ error: message, isLoading: false, _unsubscribe: null });
      })
      .finally(() => {
        if (get()._subscribeGeneration === generation) {
          set({ _subscribeInFlight: false });
        }
      });
  },

  stopSubscription: () => {
    const unsub = get()._unsubscribe;
    if (unsub) unsub();
    set({
      _unsubscribe: null,
      _subscribeInFlight: false,
      _subscribeGeneration: get()._subscribeGeneration + 1,
      isLoading: false,
    });
  },

  restartSubscription: () => {
    get().stopSubscription();
    get().startSubscription();
  },

  selectMessage: (id) => {
    set({ selectedMessageId: id });
    const msg = get().messages.find((m) => m.id === id);
    if (msg && !msg.isRead) {
      void get().markAsRead(id);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (s) => set({ sortBy: s }),
  setFilterBy: (f) => set({ filterBy: f }),

  markAsRead: async (id) => {
    const previous = get().messages;
    set({ messages: patchMessage(previous, id, { isRead: true }) });
    try {
      const firestoreDb = await getFirestoreDb();
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(firestoreDb, "messages", id), { read: true });
    } catch (error) {
      set({ messages: previous });
      throw error;
    }
  },

  archive: async (id) => {
    const previous = get().messages;
    const previousSelected = get().selectedMessageId;
    const current = previous.find((m) => m.id === id);
    const nextArchived = !current?.isArchived;
    set({
      messages: patchMessage(previous, id, { isArchived: nextArchived }),
      selectedMessageId: nextArchived && previousSelected === id ? null : previousSelected,
    });
    try {
      const firestoreDb = await getFirestoreDb();
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(firestoreDb, "messages", id), { archived: nextArchived });
    } catch (error) {
      set({ messages: previous, selectedMessageId: previousSelected });
      throw error;
    }
  },

  toggleImportant: async (id) => {
    const previous = get().messages;
    const current = previous.find((m) => m.id === id);
    const nextImportant = !current?.isImportant;
    set({ messages: patchMessage(previous, id, { isImportant: nextImportant }) });
    try {
      const firestoreDb = await getFirestoreDb();
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(firestoreDb, "messages", id), { important: nextImportant });
    } catch (error) {
      set({ messages: previous });
      throw error;
    }
  },

  remove: async (id) => {
    const previous = get().messages;
    const previousSelected = get().selectedMessageId;
    set({
      messages: previous.filter((m) => m.id !== id),
      selectedMessageId: previousSelected === id ? null : previousSelected,
    });
    try {
      const firestoreDb = await getFirestoreDb();
      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(firestoreDb, "messages", id));
    } catch (error) {
      set({ messages: previous, selectedMessageId: previousSelected });
      throw error;
    }
  },
}));
