import { useCallback } from "react";
import { useTelegramBackButton } from "@/telegram/hooks";

interface TelegramInboxBackOptions {
  navMenuOpen: boolean;
  messagesListOpen: boolean;
  mobileDetailOpen: boolean;
  onCloseNavMenu: () => void;
  onCloseMessagesList: () => void;
  onCloseMobileDetail: () => void;
}

export function useTelegramInboxBack({
  navMenuOpen,
  messagesListOpen,
  mobileDetailOpen,
  onCloseNavMenu,
  onCloseMessagesList,
  onCloseMobileDetail,
}: TelegramInboxBackOptions): void {
  const visible = navMenuOpen || messagesListOpen || mobileDetailOpen;

  const onBack = useCallback(() => {
    if (mobileDetailOpen) {
      onCloseMobileDetail();
      return;
    }
    if (messagesListOpen) {
      onCloseMessagesList();
      return;
    }
    if (navMenuOpen) {
      onCloseNavMenu();
    }
  }, [
    mobileDetailOpen,
    messagesListOpen,
    navMenuOpen,
    onCloseMobileDetail,
    onCloseMessagesList,
    onCloseNavMenu,
  ]);

  useTelegramBackButton({ visible, onBack });
}
