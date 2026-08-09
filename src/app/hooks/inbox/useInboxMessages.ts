import { useDeferredValue, useTransition } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  selectFilteredMessages,
  selectMessageCounts,
  selectSelectedMessage,
} from "@/app/features/inbox/messageSelectors";
import type { FilterOption, SortOption, View } from "@/app/features/inbox/types";
import { useMessagesStore } from "@/app/store/messagesStore";

export function useInboxMessages(currentView: View) {
  const messages = useMessagesStore((s) => s.messages);
  const selectedMessageId = useMessagesStore((s) => s.selectedMessageId);
  const searchQuery = useMessagesStore((s) => s.searchQuery);
  const sortBy = useMessagesStore((s) => s.sortBy);
  const filterBy = useMessagesStore((s) => s.filterBy);
  const storeSetSearchQuery = useMessagesStore((s) => s.setSearchQuery);
  const storeSetSortBy = useMessagesStore((s) => s.setSortBy);
  const storeSetFilterBy = useMessagesStore((s) => s.setFilterBy);
  const selectMessage = useMessagesStore((s) => s.selectMessage);
  const markAsRead = useMessagesStore((s) => s.markAsRead);
  const archive = useMessagesStore((s) => s.archive);
  const toggleImportant = useMessagesStore((s) => s.toggleImportant);
  const remove = useMessagesStore((s) => s.remove);
  const startSubscription = useMessagesStore((s) => s.startSubscription);
  const stopSubscription = useMessagesStore((s) => s.stopSubscription);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [, startTransition] = useTransition();

  const { inboxCount, unreadCount, importantCount } = useMessagesStore(
    useShallow((s) => selectMessageCounts(s.messages)),
  );

  const filteredMessages = selectFilteredMessages(
    messages,
    currentView,
    filterBy,
    deferredSearchQuery,
    sortBy,
  );
  const selectedMessage = selectSelectedMessage(messages, selectedMessageId);
  const isSearchPending = searchQuery !== deferredSearchQuery;

  const setSearchQuery = (value: string) => {
    storeSetSearchQuery(value);
  };

  const setSortBy = (value: SortOption) => {
    startTransition(() => storeSetSortBy(value));
  };

  const setFilterBy = (value: FilterOption) => {
    startTransition(() => storeSetFilterBy(value));
  };

  return {
    selectedMessageId,
    selectedMessage,
    filteredMessages,
    isSearchPending,
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
