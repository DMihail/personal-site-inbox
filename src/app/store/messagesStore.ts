import { create } from "zustand";
import { getFirestoreDb } from "@/utils/firestore";
import type { Message } from "../features/inbox/types";
import type { FilterOption, SortOption } from "../components/FilterBar";
import { shouldToastForMessageChange } from "../notifications/shouldToastForMessageChange";
import { toastNewMessage } from "../notifications/toastNewMessage";
import { notifyNewMessage } from "@/push/display";
import { showNotificationOnce } from "@/push/dedupe";
import { shouldNotifyViaFirestore, shouldToastNewMessage } from "@/push/fallback";
import { usePushStore } from "@/push/store";

type FirestoreMessageDoc = {
  name: string;
  email: string;
  company: string | null;
  message: string;
  createdAt: { toDate: () => Date } | null;
  source?: string;
  read?: boolean;
  archived?: boolean;
  important?: boolean;
  repliedAt?: { toDate: () => Date } | null;
  lastReplyPreview?: string;
};

function toAppMessage(id: string, d: FirestoreMessageDoc): Message {
  const timestamp = d.createdAt ? d.createdAt.toDate() : new Date(0);
  const company = d.company ?? "—";
  const preview = d.message;
  return {
    id,
    senderName: d.name,
    senderEmail: d.email,
    company,
    subject: `Message from ${d.name}`,
    preview,
    timestamp,
    isRead: Boolean(d.read),
    isImportant: Boolean(d.important),
    isArchived: Boolean(d.archived),
    source: d.source ?? "contact",
    repliedAt: d.repliedAt ? d.repliedAt.toDate() : undefined,
    lastReplyPreview:
      typeof d.lastReplyPreview === "string" ? d.lastReplyPreview : undefined,
    tags: d.source ? [d.source] : undefined,
  };
}

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
              if (
                !shouldToastForMessageChange(ch, { hasLoadedOnce, knownMessageIds })
              ) {
                continue;
              }
              const msg = toAppMessage(ch.doc.id, ch.doc.data() as FirestoreMessageDoc);
              if (shouldToastNewMessage()) {
                toastNewMessage(msg);
              } else if (shouldNotifyViaFirestore()) {
                void notifyNewMessage(msg);
              } else {
                const { enabled, token } = usePushStore.getState();
                if (enabled && token && msg.source === "portfolio") {
                  void showNotificationOnce(msg.id, () => notifyNewMessage(msg));
                }
              }
            }

            const msgs: Message[] = [];
            snap.forEach((d) => msgs.push(toAppMessage(d.id, d.data() as FirestoreMessageDoc)));
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
    set({ _unsubscribe: null, hasLoadedOnce: false, _subscribeInFlight: false });
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
