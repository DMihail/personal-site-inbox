import {
  selectFilteredMessages,
  selectMessageCounts,
  selectSelectedMessage,
} from "@/app/features/inbox/messageSelectors";
import type { View } from "@/app/features/inbox/types";
import { useMessagesStore } from "@/app/store/messagesStore";

export function useInboxMessages(currentView: View) {
  const messages = useMessagesStore((s) => s.messages);
  const selectedMessageId = useMessagesStore((s) => s.selectedMessageId);
  const searchQuery = useMessagesStore((s) => s.searchQuery);
  const sortBy = useMessagesStore((s) => s.sortBy);
  const filterBy = useMessagesStore((s) => s.filterBy);
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

  const filteredMessages = selectFilteredMessages(
    messages,
    currentView,
    filterBy,
    searchQuery,
    sortBy,
  );
  const selectedMessage = selectSelectedMessage(messages, selectedMessageId);
  const { inboxCount, unreadCount, importantCount } = selectMessageCounts(messages);

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
