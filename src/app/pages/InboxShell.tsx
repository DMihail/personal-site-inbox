import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { ReplyDialog } from "../components/ReplyDialog";
import { OfflineModal } from "../components/OfflineModal";
import { SettingsView } from "../components/SettingsView";
import { DesktopInboxLayout } from "../components/layout/DesktopInboxLayout";
import { MobileInboxLayout } from "../components/layout/MobileInboxLayout";
import type { View } from "../features/inbox/types";
import { pathToView, viewToPath } from "../features/inbox/viewRouting";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useAuthStore } from "../store/authStore";
import { useMessagesStore } from "../store/messagesStore";
import { usePushStore } from "../store/pushStore";
import { isPortfolioApiConfigured, sendInboxReply } from "@/utils/reply-api";

export function InboxShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const pushEnabled = usePushStore((s) => s.enabled);
  const pushRegistering = usePushStore((s) => s.isRegistering);
  const pushError = usePushStore((s) => s.error);
  const setPushEnabled = usePushStore((s) => s.setEnabled);
  const syncPushWithUser = usePushStore((s) => s.syncWithUser);
  const sendTestNotification = usePushStore((s) => s.sendTestNotification);

  const currentView = pathToView(location.pathname);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const startSubscription = useMessagesStore((s) => s.startSubscription);
  const stopSubscription = useMessagesStore((s) => s.stopSubscription);
  const messages = useMessagesStore((s) => s.messages);
  const selectedMessageId = useMessagesStore((s) => s.selectedMessageId);
  const searchQuery = useMessagesStore((s) => s.searchQuery);
  const setSearchQuery = useMessagesStore((s) => s.setSearchQuery);
  const sortBy = useMessagesStore((s) => s.sortBy);
  const setSortBy = useMessagesStore((s) => s.setSortBy);
  const filterBy = useMessagesStore((s) => s.filterBy);
  const setFilterBy = useMessagesStore((s) => s.setFilterBy);
  const selectMessage = useMessagesStore((s) => s.selectMessage);
  const markAsRead = useMessagesStore((s) => s.markAsRead);
  const archive = useMessagesStore((s) => s.archive);
  const toggleImportant = useMessagesStore((s) => s.toggleImportant);
  const remove = useMessagesStore((s) => s.remove);

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedMessageId) ?? null,
    [messages, selectedMessageId],
  );

  const inboxCount = useMemo(() => messages.filter((m) => !m.isArchived).length, [messages]);
  const unreadCount = useMemo(
    () => messages.filter((m) => !m.isRead && !m.isArchived).length,
    [messages],
  );
  const importantCount = useMemo(
    () => messages.filter((m) => m.isImportant && !m.isArchived).length,
    [messages],
  );

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const viewed =
      currentView === "unread"
        ? messages.filter((m) => !m.isRead && !m.isArchived)
        : currentView === "important"
          ? messages.filter((m) => m.isImportant && !m.isArchived)
          : currentView === "archived"
            ? messages.filter((m) => m.isArchived)
            : currentView === "inbox"
              ? messages.filter((m) => !m.isArchived)
              : messages;

    const filtered =
      filterBy === "all"
        ? viewed
        : filterBy === "unread"
          ? viewed.filter((m) => !m.isRead)
          : filterBy === "important"
            ? viewed.filter((m) => m.isImportant)
            : viewed.filter((m) => m.isArchived);

    const searched = !q
      ? filtered
      : filtered.filter(
          (m) =>
            m.senderName.toLowerCase().includes(q) ||
            m.company.toLowerCase().includes(q) ||
            m.preview.toLowerCase().includes(q) ||
            m.subject.toLowerCase().includes(q),
        );

    return [...searched].sort((a, b) => {
      if (sortBy === "newest") return b.timestamp.getTime() - a.timestamp.getTime();
      if (sortBy === "oldest") return a.timestamp.getTime() - b.timestamp.getTime();
      if (sortBy === "unread") return (a.isRead ? 1 : 0) - (b.isRead ? 1 : 0);
      if (sortBy === "important") return (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0);
      return 0;
    });
  }, [messages, currentView, filterBy, searchQuery, sortBy]);

  useEffect(() => {
    startSubscription();
    return () => stopSubscription();
  }, [startSubscription, stopSubscription]);

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
    void logout().finally(() => {
      toast.info("Signed out successfully");
      navigate("/login", { replace: true });
    });
  }, [logout, navigate]);

  useEffect(() => {
    void syncPushWithUser(user?.uid ?? null);
  }, [user?.uid, syncPushWithUser]);

  const handlePushEnabledChange = useCallback(
    (enabled: boolean) => {
      void setPushEnabled(enabled, user?.uid ?? null);
    },
    [setPushEnabled, user?.uid],
  );

  const handleEnablePush = useCallback(() => {
    void setPushEnabled(true, user?.uid ?? null);
  }, [setPushEnabled, user?.uid]);

  const handleDisablePush = useCallback(() => {
    void setPushEnabled(false, user?.uid ?? null);
  }, [setPushEnabled, user?.uid]);

  const handleTestPush = useCallback(() => {
    void sendTestNotification();
  }, [sendTestNotification]);

  const pushHandlers = {
    pushEnabled,
    pushRegistering,
    pushError,
    onEnablePush: handleEnablePush,
    onDisablePush: handleDisablePush,
    onTestPush: handleTestPush,
  };

  const settingsView = (
    <SettingsView
      isOnline={isOnline}
      onLogout={handleLogout}
      pushEnabled={pushEnabled}
      pushRegistering={pushRegistering}
      pushError={pushError}
      onPushEnabledChange={handlePushEnabledChange}
      onTestPush={handleTestPush}
    />
  );

  const handleSelectView = useCallback(
    (view: View) => {
      navigate(viewToPath(view));
      setNavMenuOpen(false);
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

  const handleReply = useCallback(() => {
    if (!isPortfolioApiConfigured()) {
      toast.error("Reply API not configured", {
        description: "Set VITE_PORTFOLIO_API_URL in .env (engineering-profile URL)",
      });
      return;
    }
    setReplyDialogOpen(true);
  }, []);

  const handleSendReply = useCallback(
    async (content: string) => {
      if (!selectedMessage) return;
      try {
        await sendInboxReply(selectedMessage.id, content);
        toast.success("Reply sent", { description: `Email sent to ${selectedMessage.senderEmail}` });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send reply";
        toast.error("Could not send reply", { description: message });
        throw err;
      }
    },
    [selectedMessage],
  );

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
  const handleOpenNavMenu = useCallback(() => setNavMenuOpen(true), []);
  const handleCloseNavMenu = useCallback(() => setNavMenuOpen(false), []);

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
        navMenuOpen={navMenuOpen}
        onOpenNavMenu={handleOpenNavMenu}
        onCloseNavMenu={handleCloseNavMenu}
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
        settingsView={settingsView}
        {...pushHandlers}
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
        navMenuOpen={navMenuOpen}
        mobileDetailOpen={mobileDetailOpen}
        onOpenNavMenu={handleOpenNavMenu}
        onCloseNavMenu={handleCloseNavMenu}
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
        settingsView={settingsView}
        {...pushHandlers}
      />

      <Outlet />
    </div>
  );
}

