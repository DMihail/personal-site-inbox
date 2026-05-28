import { create } from "zustand";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestoreDb } from "@/utils/firebase";
import type { Message, View } from "../features/inbox/types";
import type { FilterOption, SortOption } from "../components/FilterBar";
import { notifyNewMessage } from "../push/notify";
import { shouldNotifyNewMessages } from "../push/shouldNotify";

type FirestoreMessageDoc = {
  name: string;
  email: string;
  company: string | null;
  message: string;
  createdAt: Timestamp | null;
  source?: string;
  read?: boolean;
  archived?: boolean;
  important?: boolean;
  repliedAt?: Timestamp | null;
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
    source: d.source ?? "portfolio",
    repliedAt: d.repliedAt ? d.repliedAt.toDate() : undefined,
    lastReplyPreview:
      typeof d.lastReplyPreview === "string" ? d.lastReplyPreview : undefined,
    tags: d.source ? [d.source] : undefined,
  };
}

function sortMessages(messages: Message[], sortBy: SortOption) {
  return [...messages].sort((a, b) => {
    if (sortBy === "newest") return b.timestamp.getTime() - a.timestamp.getTime();
    if (sortBy === "oldest") return a.timestamp.getTime() - b.timestamp.getTime();
    if (sortBy === "unread") return (a.isRead ? 1 : 0) - (b.isRead ? 1 : 0);
    if (sortBy === "important") return (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0);
    return 0;
  });
}

function applyView(messages: Message[], view: View) {
  if (view === "unread") return messages.filter((m) => !m.isRead && !m.isArchived);
  if (view === "important") return messages.filter((m) => m.isImportant && !m.isArchived);
  if (view === "archived") return messages.filter((m) => m.isArchived);
  if (view === "inbox") return messages.filter((m) => !m.isArchived);
  return messages;
}

function applyFilter(messages: Message[], filterBy: FilterOption) {
  if (filterBy === "all") return messages;
  if (filterBy === "unread") return messages.filter((m) => !m.isRead);
  if (filterBy === "important") return messages.filter((m) => m.isImportant);
  return messages.filter((m) => m.isArchived);
}

function applySearch(messages: Message[], queryStr: string) {
  const q = queryStr.trim().toLowerCase();
  if (!q) return messages;
  return messages.filter(
    (m) =>
      m.senderName.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.preview.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q),
  );
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

  startSubscription: () => void;
  stopSubscription: () => void;

  selectMessage: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (s: SortOption) => void;
  setFilterBy: (f: FilterOption) => void;

  inboxCount: () => number;
  unreadCount: () => number;
  importantCount: () => number;
  selectedMessage: () => Message | null;
  filteredMessages: (view: View) => Message[];

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

  startSubscription: () => {
    const existing = get()._unsubscribe;
    if (existing) return;

    set({ isLoading: true, error: null });

    const q = query(collection(firestoreDb, "messages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs: Message[] = [];
        snap.forEach((d) => msgs.push(toAppMessage(d.id, d.data() as FirestoreMessageDoc)));
        const { hasLoadedOnce } = get();
        if (hasLoadedOnce) {
          for (const ch of snap.docChanges()) {
            if (ch.type !== "added") continue;
            const msg = toAppMessage(ch.doc.id, ch.doc.data() as FirestoreMessageDoc);
            if (shouldNotifyNewMessages()) {
              void notifyNewMessage(msg);
            }
          }
        }

        set({ messages: msgs, isLoading: false, error: null, hasLoadedOnce: true });
      },
      (err) => {
        set({ error: err.message, isLoading: false });
      },
    );

    set({ _unsubscribe: unsub });
  },

  stopSubscription: () => {
    const unsub = get()._unsubscribe;
    if (unsub) unsub();
    set({ _unsubscribe: null });
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

  inboxCount: () => get().messages.filter((m) => !m.isArchived).length,
  unreadCount: () => get().messages.filter((m) => !m.isRead && !m.isArchived).length,
  importantCount: () => get().messages.filter((m) => m.isImportant && !m.isArchived).length,
  selectedMessage: () =>
    get().messages.find((m) => m.id === get().selectedMessageId) ?? null,
  filteredMessages: (view) => {
    const { messages, filterBy, searchQuery, sortBy } = get();
    const viewed = applyView(messages, view);
    const filtered = applyFilter(viewed, filterBy);
    const searched = applySearch(filtered, searchQuery);
    return sortMessages(searched, sortBy);
  },

  markAsRead: async (id) => {
    await updateDoc(doc(firestoreDb, "messages", id), { read: true });
  },
  archive: async (id) => {
    await updateDoc(doc(firestoreDb, "messages", id), { archived: true });
    if (get().selectedMessageId === id) set({ selectedMessageId: null });
  },
  toggleImportant: async (id) => {
    const current = get().messages.find((m) => m.id === id);
    await updateDoc(doc(firestoreDb, "messages", id), { important: !current?.isImportant });
  },
  remove: async (id) => {
    await deleteDoc(doc(firestoreDb, "messages", id));
    if (get().selectedMessageId === id) set({ selectedMessageId: null });
  },
}));

