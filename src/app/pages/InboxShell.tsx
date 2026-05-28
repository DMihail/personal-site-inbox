import { Toaster } from "sonner";
import { ReplyDialog } from "../components/ReplyDialog";
import { OfflineModal } from "../components/OfflineModal";
import { PwaUpdateBanner } from "../components/PwaUpdateBanner";
import { SettingsView } from "../components/SettingsView";
import { DesktopInboxLayout } from "../components/layout/DesktopInboxLayout";
import { MobileInboxLayout } from "../components/layout/MobileInboxLayout";
import { useInboxController } from "../hooks/useInboxController";

export function InboxShell() {
  const c = useInboxController();

  const settingsView = (
    <SettingsView
      isOnline={c.isOnline}
      onLogout={c.handleLogout}
      pushEnabled={c.pushHandlers.pushEnabled}
      pushRegistering={c.pushHandlers.pushRegistering}
      pushError={c.pushHandlers.pushError}
      onPushEnabledChange={c.handlePushEnabledChange}
      onTestPush={c.pushHandlers.onTestPush}
    />
  );

  const layoutProps = {
    isOnline: c.isOnline,
    currentView: c.currentView,
    selectedMessage: c.selectedMessage,
    filteredMessages: c.filteredMessages,
    inboxCount: c.inboxCount,
    unreadCount: c.unreadCount,
    importantCount: c.importantCount,
    searchQuery: c.searchQuery,
    sortBy: c.sortBy,
    filterBy: c.filterBy,
    navMenuOpen: c.navMenuOpen,
    onOpenNavMenu: c.onOpenNavMenu,
    onCloseNavMenu: c.onCloseNavMenu,
    onSelectView: c.handleSelectView,
    onSearchChange: c.setSearchQuery,
    onSortChange: c.setSortBy,
    onFilterChange: c.setFilterBy,
    onArchive: c.handleArchive,
    onToggleImportant: c.handleToggleImportant,
    onDelete: c.handleDelete,
    onMarkAsRead: c.markAsRead,
    onReply: c.handleReply,
    settingsView,
    ...c.pushHandlers,
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground dark">
      <Toaster
        position="top-right"
        toastOptions={{ className: "glass-elevated border-glass-border" }}
      />

      <OfflineModal
        isOpen={c.showOfflineModal}
        onRetry={c.onRetryReconnect}
        onContinue={c.onContinueOffline}
        lastSync={c.lastSync}
      />

      <ReplyDialog
        isOpen={c.replyDialogOpen}
        onClose={() => c.setReplyDialogOpen(false)}
        message={c.selectedMessage}
        onSend={c.handleSendReply}
        onOpenInMailClient={c.handleOpenInMailClient}
      />

      <PwaUpdateBanner />

      <DesktopInboxLayout {...layoutProps} onSelectMessage={c.selectMessage} />

      <MobileInboxLayout
        {...layoutProps}
        mobileDetailOpen={c.mobileDetailOpen}
        onOpenDetail={c.onOpenMobileDetail}
        onCloseDetail={c.onCloseMobileDetail}
        onSelectMessage={c.handleSelectMessage}
      />
    </div>
  );
}
