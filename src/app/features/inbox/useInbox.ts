import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { mockMessages } from "./mockMessages";
import type { Message, View } from "./types";
import type { FilterOption, SortOption } from "../../components/FilterBar";

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

function applySearch(messages: Message[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return messages;
  return messages.filter(
    (m) =>
      m.senderName.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.preview.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q),
  );
}

export function useInbox() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedMessageId) ?? null,
    [messages, selectedMessageId],
  );

  const inboxCount = useMemo(() => messages.filter((m) => !m.isArchived).length, [messages]);

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.isRead && !m.isArchived).length,
    [messages],
  );

  const importantCount = useMemo(
    () => messages.filter((m) => m.isImportant && !m.isArchived).length,
    [messages],
  );

  const filteredMessages = useMemo(() => {
    const viewed = applyView(messages, currentView);
    const filtered = applyFilter(viewed, filterBy);
    const searched = applySearch(filtered, searchQuery);
    return sortMessages(searched, sortBy);
  }, [messages, currentView, filterBy, searchQuery, sortBy]);

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    toast.success("Marked as read");
  }, []);

  const archive = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: true } : m)),
    );
    setSelectedMessageId(null);
    toast.success("Message archived");
  }, []);

  const toggleImportant = useCallback(
    (id: string) => {
      setMessages((prev) => {
        const current = prev.find((m) => m.id === id);
        if (current) {
          toast.success(current.isImportant ? "Removed from important" : "Marked as important");
        }
        return prev.map((m) => (m.id === id ? { ...m, isImportant: !m.isImportant } : m));
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelectedMessageId(null);
    toast.success("Message deleted");
  }, []);

  const selectMessage = useCallback(
    (id: string) => {
      setSelectedMessageId(id);
      const message = messages.find((m) => m.id === id);
      if (message && !message.isRead) markAsRead(id);
    },
    [markAsRead, messages],
  );

  return {
    messages,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    selectedMessage,
    inboxCount,
    unreadCount,
    importantCount,
    filteredMessages,
    selectMessage,
    markAsRead,
    archive,
    toggleImportant,
    remove,
  };
}

