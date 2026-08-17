import { create } from "zustand";
import { getFirestoreDb } from "@/utils/firestore";
import type { FilterOption, Message, SortOption } from "../features/inbox/types";
import {
  mapFirestoreMessage,
} from "../features/inbox/mapFirestoreMessage";
import { shouldToastForMessageChange } from "../notifications/shouldToastForMessageChange";
import { notifyIncomingMessage } from "../notifications/notifyIncomingMessage";
import {
  addPendingDeleteId,
  readPendingDeleteIds,
  removePendingDeleteId,
} from "./pendingDeletesStorage";

type PendingDelete = {
  message: Message;
  index: number;
  selectedMessageId: string | null;
};

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
  _pendingDeletes: Record<string, PendingDelete>;

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
  /** Hide locally, persist the id, and wait for undo; Firestore delete happens in `commitDelete`. */
  queueDelete: (id: string) => boolean;
  undoDelete: (id: string) => boolean;
  commitDelete: (id: string) => Promise<void>;
}

function patchMessage(messages: Message[], id: string, patch: Partial<Message>): Message[] {
  return messages.map((message) => (message.id === id ? { ...message, ...patch } : message));
}

function insertAt(messages: Message[], index: number, message: Message): Message[] {
  const next = messages.slice();
  next.splice(Math.min(index, next.length), 0, message);
  return next;
}

function hiddenDeleteIds(pendingDeletes: Record<string, PendingDelete>): Set<string> {
  return new Set([...Object.keys(pendingDeletes), ...readPendingDeleteIds()]);
}

async function deleteMessageDocument(id: string): Promise<void> {
  const firestoreDb = await getFirestoreDb();
  const { deleteDoc, doc } = await import("firebase/firestore");
  await deleteDoc(doc(firestoreDb, "messages", id));
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
  _pendingDeletes: {},

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

        for (const id of readPendingDeleteIds()) {
          void get().commitDelete(id).catch(() => undefined);
        }

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

            const pendingIds = hiddenDeleteIds(get()._pendingDeletes);
            const msgs: Message[] = [];
            snap.forEach((d) => {
              if (pendingIds.has(d.id)) return;
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
    if (!get().queueDelete(id)) return;
    await get().commitDelete(id);
  },

  queueDelete: (id) => {
    const { messages, selectedMessageId, _pendingDeletes } = get();
    if (_pendingDeletes[id]) return true;
    const index = messages.findIndex((message) => message.id === id);
    if (index < 0) return false;
    const message = messages[index];
    if (!message) return false;
    addPendingDeleteId(id);
    set({
      messages: messages.filter((item) => item.id !== id),
      selectedMessageId: selectedMessageId === id ? null : selectedMessageId,
      _pendingDeletes: {
        ..._pendingDeletes,
        [id]: { message, index, selectedMessageId },
      },
    });
    return true;
  },

  undoDelete: (id) => {
    const pending = get()._pendingDeletes[id];
    if (!pending) return false;
    const { [id]: _, ...rest } = get()._pendingDeletes;
    removePendingDeleteId(id);
    set({
      messages: insertAt(get().messages, pending.index, pending.message),
      selectedMessageId: pending.selectedMessageId,
      _pendingDeletes: rest,
    });
    return true;
  },

  commitDelete: async (id) => {
    const pending = get()._pendingDeletes[id];
    const persisted = readPendingDeleteIds().includes(id);
    if (!pending && !persisted) return;

    if (pending) {
      const { [id]: _, ...rest } = get()._pendingDeletes;
      set({ _pendingDeletes: rest });
    }

    try {
      await deleteMessageDocument(id);
    } catch (error) {
      if (pending) {
        set({
          messages: insertAt(get().messages, pending.index, pending.message),
          selectedMessageId: pending.selectedMessageId,
        });
      }
      throw error;
    } finally {
      removePendingDeleteId(id);
    }
  },
}));

export function flushPendingDeletesOnUnload(): void {
  const state = useMessagesStore.getState();
  for (const id of hiddenDeleteIds(state._pendingDeletes)) {
    void state.commitDelete(id).catch(() => undefined);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushPendingDeletesOnUnload);
}
