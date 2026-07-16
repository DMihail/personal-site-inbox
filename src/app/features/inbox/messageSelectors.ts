import type { FilterOption, SortOption } from "@/app/features/inbox/types";
import type { Message, View } from "./types";

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

export function selectFilteredMessages(
  messages: Message[],
  view: View,
  filterBy: FilterOption,
  searchQuery: string,
  sortBy: SortOption,
): Message[] {
  const viewed = applyView(messages, view);
  const filtered = applyFilter(viewed, filterBy);
  const searched = applySearch(filtered, searchQuery);
  return sortMessages(searched, sortBy);
}

export function selectMessageCounts(messages: Message[]): {
  inboxCount: number;
  unreadCount: number;
  importantCount: number;
} {
  let inboxCount = 0;
  let unreadCount = 0;
  let importantCount = 0;

  for (const message of messages) {
    if (message.isArchived) continue;
    inboxCount += 1;
    if (!message.isRead) unreadCount += 1;
    if (message.isImportant) importantCount += 1;
  }

  return { inboxCount, unreadCount, importantCount };
}

export function selectSelectedMessage(
  messages: Message[],
  selectedMessageId: string | null,
): Message | null {
  return messages.find((m) => m.id === selectedMessageId) ?? null;
}
