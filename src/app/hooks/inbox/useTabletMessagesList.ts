import { useState } from "react";
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

  const messagesListOpen = (() => {
    if (!isTablet || currentView === "settings") return false;
    if (userOverride !== null) return userOverride;
    return !selectedMessageId;
  })();

  const onOpenMessagesList = () => {
    setOverrideKey(contextKey);
    setUserOpen(true);
  };

  const onCloseMessagesList = () => {
    setOverrideKey(contextKey);
    setUserOpen(false);
  };

  return {
    messagesListOpen,
    onOpenMessagesList,
    onCloseMessagesList,
  };
}
