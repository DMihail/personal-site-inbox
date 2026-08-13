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
  const isLoading = useMessagesStore((s) => s.isLoading);
  const messagesError = useMessagesStore((s) => s.error);
  const hasLoadedOnce = useMessagesStore((s) => s.hasLoadedOnce);
  const storeSetSearchQuery = useMessagesStore((s) => s.setSearchQuery);
  const storeSetSortBy = useMessagesStore((s) => s.setSortBy);
  const storeSetFilterBy = useMessagesStore((s) => s.setFilterBy);
  const selectMessage = useMessagesStore((s) => s.selectMessage);
  const markAsRead = useMessagesStore((s) => s.markAsRead);
  const archive = useMessagesStore((s) => s.archive);
  const toggleImportant = useMessagesStore((s) => s.toggleImportant);
  const queueDelete = useMessagesStore((s) => s.queueDelete);
  const undoDelete = useMessagesStore((s) => s.undoDelete);
  const commitDelete = useMessagesStore((s) => s.commitDelete);
  const startSubscription = useMessagesStore((s) => s.startSubscription);
  const stopSubscription = useMessagesStore((s) => s.stopSubscription);
  const restartSubscription = useMessagesStore((s) => s.restartSubscription);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [, startTransition] = useTransition();

  const { inboxCount, unreadCount, importantCount } = useMessagesStore(
    useShallow((s) => selectMessageCounts(s.messages)),
  );

  const activeFilterBy =
    currentView !== "archived" && filterBy === "archived" ? "all" : filterBy;

  const filteredMessages = selectFilteredMessages(
    messages,
    currentView,
    activeFilterBy,
    deferredSearchQuery,
    sortBy,
  );
  const selectedMessage = selectSelectedMessage(messages, selectedMessageId);
  const isSearchPending = searchQuery !== deferredSearchQuery;
  const showMessagesLoading = isLoading && !hasLoadedOnce;

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
    isLoading: showMessagesLoading,
    messagesError,
    inboxCount,
    unreadCount,
    importantCount,
    searchQuery,
    sortBy,
    filterBy: activeFilterBy,
    setSearchQuery,
    setSortBy,
    setFilterBy,
    selectMessage,
    markAsRead,
    archive,
    toggleImportant,
    queueDelete,
    undoDelete,
    commitDelete,
    startSubscription,
    stopSubscription,
    restartSubscription,
  };
}
