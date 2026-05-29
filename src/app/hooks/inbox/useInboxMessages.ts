import { useMemo } from "react";
import {
  selectFilteredMessages,
  selectImportantCount,
  selectInboxCount,
  selectSelectedMessage,
  selectUnreadCount,
} from "@/app/features/inbox/messageSelectors";
import type { View } from "@/app/features/inbox/types";
import { useMessagesStore } from "@/app/store/messagesStore";

export function useInboxMessages(currentView: View) {
  const messages = useMessagesStore((s) => s.messages);
  const selectedMessageId = useMessagesStore((s) => s.selectedMessageId);
  const searchQuery = useMessagesStore((s) => s.searchQuery);
  const sortBy = useMessagesStore((s) => s.sortBy);
  const filterBy = useMessagesStore((s) => s.filterBy);

  const filteredMessages = useMemo(
    () => selectFilteredMessages(messages, currentView, filterBy, searchQuery, sortBy),
    [messages, currentView, filterBy, searchQuery, sortBy],
  );

  const selectedMessage = useMemo(
    () => selectSelectedMessage(messages, selectedMessageId),
    [messages, selectedMessageId],
  );

  const inboxCount = useMemo(() => selectInboxCount(messages), [messages]);
  const unreadCount = useMemo(() => selectUnreadCount(messages), [messages]);
  const importantCount = useMemo(() => selectImportantCount(messages), [messages]);

  const setSearchQuery = useMessagesStore((s) => s.setSearchQuery);
  const setSortBy = useMessagesStore((s) => s.setSortBy);
  const setFilterBy = useMessagesStore((s) => s.setFilterBy);
  const selectMessage = useMessagesStore((s) => s.selectMessage);
  const markAsRead = useMessagesStore((s) => s.markAsRead);
  const archive = useMessagesStore((s) => s.archive);
  const toggleImportant = useMessagesStore((s) => s.toggleImportant);
  const remove = useMessagesStore((s) => s.remove);
  const startSubscription = useMessagesStore((s) => s.startSubscription);
  const stopSubscription = useMessagesStore((s) => s.stopSubscription);

  return {
    selectedMessageId,
    selectedMessage,
    filteredMessages,
    inboxCount,
    unreadCount,
    importantCount,
    searchQuery,
    sortBy,
    filterBy,
    setSearchQuery,
    setSortBy,
    setFilterBy,
    selectMessage,
    markAsRead,
    archive,
    toggleImportant,
    remove,
    startSubscription,
    stopSubscription,
  };
}
