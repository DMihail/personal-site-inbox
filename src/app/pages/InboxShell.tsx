import { useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { ReplyDialog } from "../components/ReplyDialog";
import { OfflineModal } from "../components/OfflineModal";
import { SettingsView } from "../components/SettingsView";
import { DesktopInboxLayout } from "../components/layout/DesktopInboxLayout";
import { MobileInboxLayout } from "../components/layout/MobileInboxLayout";
import { useInbox } from "../features/inbox/useInbox";
import type { View } from "../features/inbox/types";
import { pathToView, viewToPath } from "../features/inbox/viewRouting";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useAuth } from "../auth/AuthContext";

export function InboxShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const currentView = pathToView(location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const {
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
  } = useInbox(currentView);

  const isOnline = useOnlineStatus({
    onOnline: () => {
      setShowOfflineModal(false);
      toast.success("Connection restored", { description: "You're back online" });
      setLastSync(new Date());
    },
    onOffline: () => {
      setShowOfflineModal(true);
      toast.error("Connection lost", { description: "You're currently offline" });
    },
  });

  const handleLogout = useCallback(() => {
    logout();
    toast.info("Signed out successfully");
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleSelectView = useCallback(
    (view: View) => {
      navigate(viewToPath(view));
      setMobileMenuOpen(false);
      setMobileDetailOpen(false);
    },
    [navigate],
  );

  const handleSelectMessage = useCallback(
    (messageId: string) => {
      selectMessage(messageId);
      setMobileDetailOpen(true);
    },
    [selectMessage],
  );

  const handleArchive = useCallback(
    (messageId: string) => {
      archive(messageId);
      setMobileDetailOpen(false);
    },
    [archive],
  );

  const handleDelete = useCallback(
    (messageId: string) => {
      remove(messageId);
      setMobileDetailOpen(false);
    },
    [remove],
  );

  const handleToggleImportant = useCallback(
    (messageId: string) => toggleImportant(messageId),
    [toggleImportant],
  );

  const handleReply = useCallback(() => setReplyDialogOpen(true), []);

  const handleSendReply = useCallback((_content: string) => {
    toast.success("Reply sent successfully", { description: "Your message has been delivered" });
  }, []);

  const handleOpenInMailClient = useCallback(() => {
    if (!selectedMessage) return;
    window.open(`mailto:${selectedMessage.senderEmail}`, "_blank");
    toast.info("Opening mail client");
  }, [selectedMessage]);

  const handleRetryReconnect = useCallback(() => {
    setShowOfflineModal(false);
    toast.info("Attempting to reconnect...");
  }, []);

  const handleContinueOffline = useCallback(() => setShowOfflineModal(false), []);

  const handleOpenMobileDetail = useCallback(() => setMobileDetailOpen(true), []);
  const handleCloseMobileDetail = useCallback(() => setMobileDetailOpen(false), []);
  const handleToggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);
  const handleCloseMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="h-screen w-screen bg-background text-foreground dark overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "glass-elevated border-glass-border",
        }}
      />

      <OfflineModal
        isOpen={showOfflineModal}
        onRetry={handleRetryReconnect}
        onContinue={handleContinueOffline}
        lastSync={lastSync}
      />

      <ReplyDialog
        isOpen={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        message={selectedMessage}
        onSend={handleSendReply}
        onOpenInMailClient={handleOpenInMailClient}
      />

      <DesktopInboxLayout
        isOnline={isOnline}
        currentView={currentView}
        selectedMessage={selectedMessage}
        filteredMessages={filteredMessages}
        inboxCount={inboxCount}
        unreadCount={unreadCount}
        importantCount={importantCount}
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterBy={filterBy}
        onSelectView={handleSelectView}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
        onSelectMessage={handleSelectMessage}
        onArchive={handleArchive}
        onToggleImportant={handleToggleImportant}
        onDelete={handleDelete}
        onMarkAsRead={markAsRead}
        onReply={handleReply}
        onLogout={handleLogout}
      />

      <MobileInboxLayout
        isOnline={isOnline}
        currentView={currentView}
        selectedMessage={selectedMessage}
        filteredMessages={filteredMessages}
        inboxCount={inboxCount}
        unreadCount={unreadCount}
        importantCount={importantCount}
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterBy={filterBy}
        mobileMenuOpen={mobileMenuOpen}
        mobileDetailOpen={mobileDetailOpen}
        onToggleMobileMenu={handleToggleMobileMenu}
        onCloseMobileMenu={handleCloseMobileMenu}
        onSelectView={handleSelectView}
        onOpenDetail={handleOpenMobileDetail}
        onCloseDetail={handleCloseMobileDetail}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
        onSelectMessage={selectMessage}
        onArchive={handleArchive}
        onToggleImportant={handleToggleImportant}
        onDelete={handleDelete}
        onMarkAsRead={markAsRead}
        onReply={handleReply}
        settingsView={<SettingsView isOnline={isOnline} onLogout={handleLogout} />}
      />

      <Outlet />
    </div>
  );
}

