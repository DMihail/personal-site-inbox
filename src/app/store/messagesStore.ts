import { create } from "zustand";
import { getFirestoreDb } from "@/utils/firestore";
import type { FilterOption, Message, SortOption } from "../features/inbox/types";
import { mapFirestoreMessage } from "../features/inbox/mapFirestoreMessage";
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

  startSubscription: () => void;
  stopSubscription: () => void;

  selectMessage: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (s: SortOption) => void;
  setFilterBy: (f: FilterOption) => void;

  markAsRead: (id: string) => Promise<void>;
  archive: (id: string) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
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

  startSubscription: () => {
    if (get()._unsubscribe || get()._subscribeInFlight) return;

    set({ isLoading: true, error: null, _subscribeInFlight: true });

    void getFirestoreDb()
      .then(async (firestoreDb) => {
        if (get()._unsubscribe) return;

        const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
        const q = query(collection(firestoreDb, "messages"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(
          q,
          (snap) => {
            const knownMessageIds = new Set(get().messages.map((m) => m.id));
            const { hasLoadedOnce } = get();

            for (const ch of snap.docChanges()) {
              if (!shouldToastForMessageChange(ch, { hasLoadedOnce, knownMessageIds })) {
                continue;
              }
              const msg = mapFirestoreMessage(
                ch.doc.id,
                ch.doc.data() as Parameters<typeof mapFirestoreMessage>[1],
              );
              notifyIncomingMessage(msg, (id) => get().selectMessage(id));
            }

            const msgs: Message[] = [];
            snap.forEach((d) =>
              msgs.push(
                mapFirestoreMessage(d.id, d.data() as Parameters<typeof mapFirestoreMessage>[1]),
              ),
            );
            set({ messages: msgs, isLoading: false, error: null, hasLoadedOnce: true });
          },
          (err) => {
            set({ error: err.message, isLoading: false });
          },
        );

        set({ _unsubscribe: unsub });
      })
      .finally(() => {
        set({ _subscribeInFlight: false });
      });
  },

  stopSubscription: () => {
    const unsub = get()._unsubscribe;
    if (unsub) unsub();
    set({ _unsubscribe: null, _subscribeInFlight: false });
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
    const firestoreDb = await getFirestoreDb();
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(firestoreDb, "messages", id), { read: true });
  },
  archive: async (id) => {
    const firestoreDb = await getFirestoreDb();
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(firestoreDb, "messages", id), { archived: true });
    if (get().selectedMessageId === id) set({ selectedMessageId: null });
  },
  toggleImportant: async (id) => {
    const current = get().messages.find((m) => m.id === id);
    const firestoreDb = await getFirestoreDb();
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(firestoreDb, "messages", id), { important: !current?.isImportant });
  },
  remove: async (id) => {
    const firestoreDb = await getFirestoreDb();
    const { deleteDoc, doc } = await import("firebase/firestore");
    await deleteDoc(doc(firestoreDb, "messages", id));
    if (get().selectedMessageId === id) set({ selectedMessageId: null });
  },
}));
