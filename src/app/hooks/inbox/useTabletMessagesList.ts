import { useCallback, useMemo, useState } from "react";
import type { View } from "@/app/features/inbox/types";

interface UseTabletMessagesListOptions {
  isTablet: boolean;
  currentView: View;
  selectedMessageId: string | null;
}

/**
 * Tablet drawer for the message list: auto-open when nothing is selected,
 * explicit open/close from UI or gestures.
 */
export function useTabletMessagesList({
  isTablet,
  currentView,
  selectedMessageId,
}: UseTabletMessagesListOptions) {
  const contextKey = `${isTablet}:${currentView}:${selectedMessageId ?? "none"}`;
  const [overrideKey, setOverrideKey] = useState(contextKey);
  const [userOpen, setUserOpen] = useState<boolean | null>(null);

  const userOverride = overrideKey === contextKey ? userOpen : null;

  const messagesListOpen = useMemo(() => {
    if (!isTablet || currentView === "settings") return false;
    if (userOverride !== null) return userOverride;
    return !selectedMessageId;
  }, [isTablet, currentView, selectedMessageId, userOverride]);

  const onOpenMessagesList = useCallback(() => {
    setOverrideKey(contextKey);
    setUserOpen(true);
  }, [contextKey]);

  const onCloseMessagesList = useCallback(() => {
    setOverrideKey(contextKey);
    setUserOpen(false);
  }, [contextKey]);

  return {
    messagesListOpen,
    onOpenMessagesList,
    onCloseMessagesList,
  };
}
