import { useEffect } from "react";
import { getTelegramWebApp, isTelegramMiniApp } from "@/telegram/detect";
import { syncTelegramViewportCss } from "@/telegram/theme";

/** Keep `--tg-viewport-stable-height` in sync when Telegram resizes the WebView. */
export function useTelegramViewport(): void {
  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (!webApp) return;

    const onViewport = () => syncTelegramViewportCss(webApp);
    webApp.onEvent("viewportChanged", onViewport);
    return () => webApp.offEvent("viewportChanged", onViewport);
  }, []);
}

interface TelegramBackButtonOptions {
  visible: boolean;
  onBack: () => void;
}

/** Native Telegram back control for overlays and message detail. */
export function useTelegramBackButton({ visible, onBack }: TelegramBackButtonOptions): void {
  useEffect(() => {
    if (!isTelegramMiniApp()) return;
    const webApp = getTelegramWebApp();
    if (!webApp) return;

    if (visible) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onBack);
    } else {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(onBack);
    }

    return () => {
      webApp.BackButton.offClick(onBack);
      webApp.BackButton.hide();
    };
  }, [visible, onBack]);
}

export function useIsTelegramMiniApp(): boolean {
  return isTelegramMiniApp();
}
