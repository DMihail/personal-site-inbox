import { X } from "lucide-react";
import { Button } from "../ui/button";
import { SlideDrawer } from "./SlideDrawer";
import { InboxMessagesPanel } from "./InboxMessagesPanel";
import type { Message } from "../../features/inbox/types";
import type { FilterOption, SortOption } from "@/app/features/inbox/types";

interface InboxMessagesDrawerProps {
  open: boolean;
  persistent?: boolean;
  listHeading: string;
  filteredMessages: Message[];
  selectedMessageId: string | null;
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  currentView: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: FilterOption) => void;
  onSelectMessage: (messageId: string) => void;
  onToggleImportant: (messageId: string) => void;
  onArchive: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onClose: () => void;
  isSearchPending?: boolean;
}

export function InboxMessagesDrawer({
  open,
  persistent = false,
  listHeading,
  filteredMessages,
  selectedMessageId,
  searchQuery,
  sortBy,
  filterBy,
  currentView,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onSelectMessage,
  onToggleImportant,
  onArchive,
  onDelete,
  onClose,
  isSearchPending = false,
}: InboxMessagesDrawerProps) {
  const headingId = "inbox-messages-drawer-heading";

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      persistent={persistent}
      enableGesture
      edgeWidth={28}
      labelledBy={headingId}
      panelClassName="z-[45] w-[min(100vw,28rem)] max-w-full"
    >
      <div className="flex shrink-0 items-center justify-end border-b border-glass-border p-2 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="ui-hover-ghost"
          aria-label="Close message list"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      <InboxMessagesPanel
        listHeading={listHeading}
        filteredMessages={filteredMessages}
        selectedMessageId={selectedMessageId}
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterBy={filterBy}
        currentView={currentView}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        onFilterChange={onFilterChange}
        onSelectMessage={onSelectMessage}
        onToggleImportant={onToggleImportant}
        onArchive={onArchive}
        onDelete={onDelete}
        enableSwipe
        isSearchPending={isSearchPending}
        headingId={headingId}
      />
    </SlideDrawer>
  );
}
