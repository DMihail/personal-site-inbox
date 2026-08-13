import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { pathToView, VIEW_PAGE_TITLES, viewToPath } from "@/app/features/inbox/viewRouting";
import { mutationErrorMessage, parseMessageIdFromSearch } from "@/app/features/inbox/messageLinks";
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
    restartSubscription,
    selectMessage,
    archive,
    queueDelete,
    undoDelete,
    commitDelete,
    markAsRead,
    toggleImportant,
    selectedMessage,
    selectedMessageId,
    ...inbox
  } = useInboxMessages(currentView);
  const { handlers: pushHandlers, handlePushEnabledChange } = useInboxPush(user?.uid);
  const isTablet = useIsTabletLayout();

  const { messagesListOpen, onOpenMessagesList, onCloseMessagesList } = useTabletMessagesList({
    isTablet,
    currentView,
    selectedMessageId,
  });

  const [, startViewTransition] = useTransition();
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const pendingDeleteTimers = useRef(new Map<string, number>());
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [lastSync, setLastSync] = useState(() => new Date());

  const deepLinkMessageId = parseMessageIdFromSearch(location.search);
  if (deepLinkMessageId && !mobileDetailOpen) {
    setMobileDetailOpen(true);
  }

  useEffect(() => {
    startSubscription();
    return () => stopSubscription();
  }, [startSubscription, stopSubscription]);

  const consumeDeepLink = useEffectEvent((messageId: string) => {
    selectMessage(messageId);
    onCloseMessagesList();
    navigate({ pathname: location.pathname, search: "" }, { replace: true });
  });

  // Consume `/inbox?message=<id>` from push deep links, then strip the query.
  useEffect(() => {
    if (!deepLinkMessageId) return;
    consumeDeepLink(deepLinkMessageId);
  }, [deepLinkMessageId]);

  const navigateFromNotification = useEffectEvent((url: string) => {
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.origin !== window.location.origin) return;
      navigate(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
      /* ignore malformed urls */
    }
  });

  // SW / other tabs can ask the focused client to navigate after a notification click.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | undefined;
      if (data?.type !== "NOTIFICATION_NAVIGATE" || typeof data.url !== "string") return;
      navigateFromNotification(data.url);
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  const isOnline = useOnlineStatus({
    onOnline: () => {
      setShowOfflineModal(false);
      toast.success("Connection restored", { description: "You're back online" });
      setLastSync(new Date());
      restartSubscription();
    },
    onOffline: () => {
      setShowOfflineModal(true);
      toast.error("Connection lost", { description: "You're currently offline" });
    },
  });

  const handleLogout = () =>
    logout().finally(() => {
      toast.info("Signed out successfully");
      navigate("/login", { replace: true });
    });

  const handleSelectView = (view: View) => {
    setNavMenuOpen(false);
    setMobileDetailOpen(false);
    if (view !== "settings") onOpenMessagesList();
    else onCloseMessagesList();
    startViewTransition(() => {
      navigate(viewToPath(view), { viewTransition: true });
    });
  };

  const handleSelectMessage = (messageId: string) => {
    selectMessage(messageId);
    setMobileDetailOpen(true);
    onCloseMessagesList();
  };

  const handleArchive = (messageId: string) => {
    void archive(messageId).catch((error: unknown) => {
      toast.error("Could not update archive", {
        description: mutationErrorMessage(error),
      });
    });
    setMobileDetailOpen(false);
  };

  const handleDelete = (messageId: string) => {
    if (!queueDelete(messageId)) return;
    setMobileDetailOpen(false);

    const previousTimer = pendingDeleteTimers.current.get(messageId);
    if (previousTimer !== undefined) window.clearTimeout(previousTimer);

    const cancelPendingDelete = () => {
      const timer = pendingDeleteTimers.current.get(messageId);
      if (timer !== undefined) {
        window.clearTimeout(timer);
        pendingDeleteTimers.current.delete(messageId);
      }
    };

    toast.success("Message deleted", {
      duration: 6_000,
      action: {
        label: "Undo",
        onClick: () => {
          cancelPendingDelete();
          undoDelete(messageId);
        },
      },
    });

    pendingDeleteTimers.current.set(
      messageId,
      window.setTimeout(() => {
        pendingDeleteTimers.current.delete(messageId);
        void commitDelete(messageId).catch((error: unknown) => {
          toast.error("Could not delete message", {
            description: mutationErrorMessage(error),
          });
        });
      }, 6_000),
    );
  };

  const handleToggleImportant = (messageId: string) => {
    void toggleImportant(messageId).catch((error: unknown) => {
      toast.error("Could not update important", {
        description: mutationErrorMessage(error),
      });
    });
  };

  const handleMarkAsRead = (messageId: string) => {
    void markAsRead(messageId).catch((error: unknown) => {
      toast.error("Could not mark as read", {
        description: mutationErrorMessage(error),
      });
    });
  };

  const handleReply = () => {
    if (!isPortfolioApiConfigured()) {
      toast.error("Reply API not configured", {
        description: "Set VITE_PORTFOLIO_API_URL in .env to your backend origin",
      });
      return;
    }
    setReplyDialogOpen(true);
  };

  const handleSendReply = async (content: string, signal?: AbortSignal) => {
    if (!selectedMessage) return;
    try {
      await sendInboxReply(selectedMessage.id, content, signal);
      toast.success("Reply sent", {
        description: `Email sent to ${selectedMessage.senderEmail}`,
      });
    } catch (err) {
      if (signal?.aborted) return;
      const message = err instanceof Error ? err.message : "Failed to send reply";
      toast.error("Could not send reply", { description: message });
      throw err;
    }
  };

  const handleOpenInMailClient = () => {
    if (!selectedMessage) return;
    window.open(`mailto:${selectedMessage.senderEmail}`, "_blank");
    toast.info("Opening mail client");
  };

  const handleRetryMessages = () => {
    restartSubscription();
  };

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
    handleToggleImportant,
    handleMarkAsRead,
    handleReply,
    handleSendReply,
    handleOpenInMailClient,
    handleRetryMessages,
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
      toast.info("Reconnecting…");
      restartSubscription();
      void fetch(window.location.origin, { method: "HEAD", cache: "no-store" }).catch(() => {
        /* network probe — success is optional; subscription restart is the real work */
      });
    },
    onContinueOffline: () => setShowOfflineModal(false),
    selectedMessage,
    selectedMessageId,
    ...inbox,
  };
}
