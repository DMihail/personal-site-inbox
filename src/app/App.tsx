import { useCallback, useState } from "react";
import { Toaster, toast } from "sonner";
import { SettingsView } from "./components/SettingsView";
import { ReplyDialog } from "./components/ReplyDialog";
import { OfflineModal } from "./components/OfflineModal";
import { AuthScreen } from "./components/AuthScreen";
import { DesktopInboxLayout } from "./components/layout/DesktopInboxLayout";
import { MobileInboxLayout } from "./components/layout/MobileInboxLayout";
import { useInbox } from "./features/inbox/useInbox";
import type { View } from "./features/inbox/types";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const {
    currentView,
    setCurrentView,
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
  } = useInbox();

  const handleLogin = (_email: string, _password: string) => {
    toast.success("Authentication successful", {
      description: "Welcome back!",
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    toast.info("Signed out successfully");
    setIsAuthenticated(false);
    setCurrentView("inbox");
    setMobileMenuOpen(false);
    setMobileDetailOpen(false);
  };

  const handleSendReply = (_content: string) => {
    toast.success("Reply sent successfully", {
      description: "Your message has been delivered",
    });
  };

  const handleRetryReconnect = useCallback(() => {
    setShowOfflineModal(false);
    toast.info("Attempting to reconnect...");
  }, []);

  const handleContinueOffline = useCallback(() => setShowOfflineModal(false), []);

  const handleOpenInMailClient = useCallback(() => {
    if (!selectedMessage) return;
    window.open(`mailto:${selectedMessage.senderEmail}`, "_blank");
    toast.info("Opening mail client");
  }, [selectedMessage]);

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

  const handleSelectView = useCallback(
    (view: View) => {
      setCurrentView(view);
      setMobileMenuOpen(false);
      setMobileDetailOpen(false);
    },
    [setCurrentView],
  );

  const handleSelectMessage = useCallback(
    (messageId: string) => {
      selectMessage(messageId);
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
    (messageId: string) => {
      toggleImportant(messageId);
    },
    [toggleImportant],
  );

  const handleReply = useCallback(() => setReplyDialogOpen(true), []);

  const handleOpenMobileDetail = useCallback(() => setMobileDetailOpen(true), []);
  const handleCloseMobileDetail = useCallback(() => setMobileDetailOpen(false), []);
  const handleToggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);
  const handleCloseMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

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
    </div>
  );
}
