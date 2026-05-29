import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { pathToView, VIEW_PAGE_TITLES, viewToPath } from "@/app/features/inbox/viewRouting";
import type { View } from "@/app/features/inbox/types";
import { useAuthStore } from "@/app/store/authStore";
import { isPortfolioApiConfigured, sendInboxReply } from "@/utils/reply-api";
import { useDocumentTitle } from "../useDocumentTitle";
import { useOnlineStatus } from "../useOnlineStatus";
import { useIsTabletLayout } from "../useMediaQuery";
import { useInboxMessages } from "./useInboxMessages";
import { useInboxPush } from "./useInboxPush";
import { useTabletMessagesList } from "./useTabletMessagesList";

export function useInboxController() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = pathToView(location.pathname);
  useDocumentTitle(VIEW_PAGE_TITLES[currentView]);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const {
    startSubscription,
    stopSubscription,
    selectMessage,
    archive,
    remove,
    selectedMessage,
    selectedMessageId,
    ...inbox
  } = useInboxMessages(currentView);
  const { handlers: pushHandlers, handlePushEnabledChange } = useInboxPush(user?.uid);
  const isTablet = useIsTabletLayout();

  const {
    messagesListOpen,
    onOpenMessagesList,
    onCloseMessagesList,
  } = useTabletMessagesList({
    isTablet,
    currentView,
    selectedMessageId,
  });

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

  const handleLogout = useCallback(() => {
    return logout().finally(() => {
      toast.info("Signed out successfully");
      navigate("/login", { replace: true });
    });
  }, [logout, navigate]);

  const handleSelectView = useCallback(
    (view: View) => {
      navigate(viewToPath(view));
      setNavMenuOpen(false);
      setMobileDetailOpen(false);
      if (view !== "settings") onOpenMessagesList();
      else onCloseMessagesList();
    },
    [navigate, onCloseMessagesList, onOpenMessagesList],
  );

  const handleSelectMessage = useCallback(
    (messageId: string) => {
      selectMessage(messageId);
      setMobileDetailOpen(true);
      onCloseMessagesList();
    },
    [selectMessage, onCloseMessagesList],
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
        description: "Set VITE_PORTFOLIO_API_URL in .env to your backend origin",
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
        toast.success("Reply sent", {
          description: `Email sent to ${selectedMessage.senderEmail}`,
        });
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
    messagesListOpen,
    mobileDetailOpen,
    replyDialogOpen,
    showOfflineModal,
    pushHandlers,
    handleLogout,
    handlePushEnabledChange,
    handleSelectView,
    handleSelectMessage,
    handleArchive,
    handleDelete,
    handleToggleImportant: inbox.toggleImportant,
    handleReply,
    handleSendReply,
    handleOpenInMailClient,
    setReplyDialogOpen,
    setShowOfflineModal,
    setMobileDetailOpen,
    onOpenNavMenu: () => setNavMenuOpen(true),
    onCloseNavMenu: () => setNavMenuOpen(false),
    onOpenMessagesList,
    onCloseMessagesList,
    onOpenMobileDetail: () => setMobileDetailOpen(true),
    onCloseMobileDetail: () => setMobileDetailOpen(false),
    onRetryReconnect: () => {
      setShowOfflineModal(false);
      toast.info("Attempting to reconnect...");
    },
    onContinueOffline: () => setShowOfflineModal(false),
    selectedMessage,
    selectedMessageId,
    ...inbox,
  };
}
