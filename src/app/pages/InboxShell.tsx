import { lazy, Suspense } from "react";
import { OfflineModal } from "../components/OfflineModal";
import { PwaUpdateBanner } from "../components/PwaUpdateBanner";
import { SkipLink } from "../components/SkipLink";
import { useInboxController } from "../hooks/inbox";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useTelegramInboxBack } from "../hooks/useTelegramInboxBack";
import { useTelegramStartNavigation } from "../hooks/useTelegramStartNavigation";
import { MEDIA_QUERIES } from "@/shared/constants/media-queries";

const DesktopInboxLayout = lazy(() =>
  import("../components/layout/DesktopInboxLayout").then((m) => ({
    default: m.DesktopInboxLayout,
  })),
);
const MobileInboxLayout = lazy(() =>
  import("../components/layout/MobileInboxLayout").then((m) => ({
    default: m.MobileInboxLayout,
  })),
);
const ReplyDialog = lazy(() =>
  import("../components/ReplyDialog").then((m) => ({ default: m.ReplyDialog })),
);

function InboxLayoutFallback() {
  return (
    <div
      className="flex min-h-0 flex-1 items-center justify-center text-text-muted"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      Loading inbox…
    </div>
  );
}

export function InboxShell() {
  const c = useInboxController();
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp);

  useTelegramStartNavigation(true);
  useTelegramInboxBack({
    navMenuOpen: c.navMenuOpen,
    messagesListOpen: c.messagesListOpen,
    mobileDetailOpen: c.mobileDetailOpen,
    onCloseNavMenu: c.onCloseNavMenu,
    onCloseMessagesList: c.onCloseMessagesList,
    onCloseMobileDetail: c.onCloseMobileDetail,
  });

  const layoutProps = {
    isOnline: c.isOnline,
    currentView: c.currentView,
    selectedMessage: c.selectedMessage,
    selectedMessageId: c.selectedMessageId,
    filteredMessages: c.filteredMessages,
    inboxCount: c.inboxCount,
    unreadCount: c.unreadCount,
    importantCount: c.importantCount,
    searchQuery: c.searchQuery,
    sortBy: c.sortBy,
    filterBy: c.filterBy,
    navMenuOpen: c.navMenuOpen,
    messagesListOpen: c.messagesListOpen,
    onOpenNavMenu: c.onOpenNavMenu,
    onCloseNavMenu: c.onCloseNavMenu,
    onOpenMessagesList: c.onOpenMessagesList,
    onCloseMessagesList: c.onCloseMessagesList,
    onSelectView: c.handleSelectView,
    onSearchChange: c.setSearchQuery,
    onSortChange: c.setSortBy,
    onFilterChange: c.setFilterBy,
    onArchive: c.handleArchive,
    onToggleImportant: c.handleToggleImportant,
    onDelete: c.handleDelete,
    onMarkAsRead: c.markAsRead,
    onReply: c.handleReply,
    onLogout: c.handleLogout,
    onPushEnabledChange: c.handlePushEnabledChange,
    isSearchPending: c.isSearchPending,
    ...c.pushHandlers,
  };

  return (
    <div className="app-telegram-viewport flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground dark">
      <SkipLink />
      <OfflineModal
        isOpen={c.showOfflineModal}
        onRetry={c.onRetryReconnect}
        onContinue={c.onContinueOffline}
        lastSync={c.lastSync}
      />

      {c.replyDialogOpen ? (
        <Suspense fallback={null}>
          <ReplyDialog
            isOpen={c.replyDialogOpen}
            onClose={() => c.setReplyDialogOpen(false)}
            message={c.selectedMessage}
            onSend={c.handleSendReply}
            onOpenInMailClient={c.handleOpenInMailClient}
          />
        </Suspense>
      ) : null}

      <PwaUpdateBanner />

      <Suspense fallback={<InboxLayoutFallback />}>
        {isMdUp ? (
          <DesktopInboxLayout {...layoutProps} onSelectMessage={c.handleSelectMessage} />
        ) : (
          <MobileInboxLayout
            {...layoutProps}
            mobileDetailOpen={c.mobileDetailOpen}
            onOpenDetail={c.onOpenMobileDetail}
            onCloseDetail={c.onCloseMobileDetail}
            onSelectMessage={c.handleSelectMessage}
          />
        )}
      </Suspense>
    </div>
  );
}
