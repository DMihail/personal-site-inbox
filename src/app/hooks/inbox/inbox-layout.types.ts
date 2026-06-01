import type { ReactNode } from "react";
import type { Message, View } from "@/app/features/inbox/types";
import type { FilterOption, SortOption } from "@/app/components/FilterBar";

/** Shared props for desktop + mobile inbox layouts. */
export interface InboxLayoutBaseProps {
  isOnline: boolean;
  currentView: View;
  selectedMessage: Message | null;
  selectedMessageId: string | null;
  filteredMessages: Message[];
  inboxCount: number;
  unreadCount: number;
  importantCount: number;
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  navMenuOpen: boolean;
  messagesListOpen: boolean;
  onOpenNavMenu: () => void;
  onCloseNavMenu: () => void;
  onOpenMessagesList: () => void;
  onCloseMessagesList: () => void;
  onSelectView: (view: View) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: FilterOption) => void;
  onArchive: (messageId: string) => void;
  onToggleImportant: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onReply: () => void;
  settingsView: ReactNode;
  pushEnabled: boolean;
  pushRegistering: boolean;
  pushError: string | null;
  isSendingTest: boolean;
  onEnablePush: () => void;
  onDisablePush: () => void;
  onTestPush: () => void;
}

export interface InboxPushHandlers {
  pushEnabled: boolean;
  pushRegistering: boolean;
  pushError: string | null;
  isSendingTest: boolean;
  onEnablePush: () => void;
  onDisablePush: () => void;
  onTestPush: () => void;
}
