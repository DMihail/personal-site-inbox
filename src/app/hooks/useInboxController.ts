import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  selectFilteredMessages,
  selectImportantCount,
  selectInboxCount,
  selectSelectedMessage,
  selectUnreadCount,
} from "../features/inbox/messageSelectors";
import { pathToView, VIEW_PAGE_TITLES, viewToPath } from "../features/inbox/viewRouting";
import type { View } from "../features/inbox/types";
import { useAuthStore } from "../store/authStore";
import { useMessagesStore } from "../store/messagesStore";
import { usePushStore } from "../store/pushStore";
import { isPortfolioApiConfigured, sendInboxReply } from "@/utils/reply-api";
import { useDocumentTitle } from "./useDocumentTitle";
import { useOnlineStatus } from "./useOnlineStatus";

export function useInboxController() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = pathToView(location.pathname);
  useDocumentTitle(VIEW_PAGE_TITLES[currentView]);

  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const pushEnabled = usePushStore((s) => s.enabled);
  const pushRegistering = usePushStore((s) => s.isRegistering);
  const pushError = usePushStore((s) => s.error);
  const setPushEnabled = usePushStore((s) => s.setEnabled);
  const syncPushWithUser = usePushStore((s) => s.syncWithUser);
  const sendTestNotification = usePushStore((s) => s.sendTestNotification);

  const startSubscription = useMessagesStore((s) => s.startSubscription);
  const stopSubscription = useMessagesStore((s) => s.stopSubscription);
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

  const filteredMessages = useMemo(
    () => selectFilteredMessages(messages, currentView, filterBy, searchQuery, sortBy),
    [messages, currentView, filterBy, searchQuery, sortBy],
  );
  const selectedMessage = useMemo(
    () => selectSelectedMessage(messages, selectedMessageId),
    [messages, selectedMessageId],
  );
  const inboxCount = useMemo(() => selectInboxCount(messages), [messages]);
  const unreadCount = useMemo(() => selectUnreadCount(messages), [messages]);
  const importantCount = useMemo(() => selectImportantCount(messages), [messages]);

  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [lastSync, setLastSync] = useState(() => new Date());

  useEffect(() => {
    startSubscription();
    return () => stopSubscription();
  }, [startSubscription, stopSubscription]);

  const handleOnline = useCallback(() => {
    setShowOfflineModal(false);
    toast.success("Connection restored", { description: "You're back online" });
    setLastSync(new Date());
  }, []);

  const handleOffline = useCallback(() => {
    setShowOfflineModal(true);
    toast.error("Connection lost", { description: "You're currently offline" });
  }, []);

  const isOnline = useOnlineStatus({ onOnline: handleOnline, onOffline: handleOffline });

  useEffect(() => {
    void syncPushWithUser(user?.uid ?? null);
  }, [user?.uid, syncPushWithUser]);

  const handleLogout = useCallback(() => {
    void logout().finally(() => {
      toast.info("Signed out successfully");
      navigate("/login", { replace: true });
    });
  }, [logout, navigate]);

  const handlePushEnabledChange = useCallback(
    (enabled: boolean) => {
      void setPushEnabled(enabled, user?.uid ?? null);
    },
    [setPushEnabled, user?.uid],
  );

  const onEnablePush = useCallback(() => {
    void setPushEnabled(true, user?.uid ?? null);
  }, [setPushEnabled, user?.uid]);

  const onDisablePush = useCallback(() => {
    void setPushEnabled(false, user?.uid ?? null);
  }, [setPushEnabled, user?.uid]);

  const onTestPush = useCallback(() => {
    void sendTestNotification();
  }, [sendTestNotification]);

  const pushHandlers = useMemo(
    () => ({
      pushEnabled,
      pushRegistering,
      pushError,
      onEnablePush,
      onDisablePush,
      onTestPush,
    }),
    [pushEnabled, pushRegistering, pushError, onEnablePush, onDisablePush, onTestPush],
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

  return {
    currentView,
    isOnline,
    lastSync,
    navMenuOpen,
    mobileDetailOpen,
    replyDialogOpen,
    showOfflineModal,
    filteredMessages,
    selectedMessage,
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
    pushHandlers,
    handleLogout,
    handlePushEnabledChange,
    handleSelectView,
    handleSelectMessage,
    handleArchive,
    handleDelete,
    handleToggleImportant: toggleImportant,
    handleReply,
    handleSendReply,
    handleOpenInMailClient,
    setReplyDialogOpen,
    setShowOfflineModal,
    setMobileDetailOpen,
    onOpenNavMenu: () => setNavMenuOpen(true),
    onCloseNavMenu: () => setNavMenuOpen(false),
    onOpenMobileDetail: () => setMobileDetailOpen(true),
    onCloseMobileDetail: () => setMobileDetailOpen(false),
    onRetryReconnect: () => {
      setShowOfflineModal(false);
      toast.info("Attempting to reconnect...");
    },
    onContinueOffline: () => setShowOfflineModal(false),
  };
}
