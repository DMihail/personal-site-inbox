import { isTelegramMiniApp, getTelegramWebApp } from "@/telegram/detect";
import { applyTelegramTheme, syncTelegramViewportCss } from "@/telegram/theme";
import { captureTelegramStartParam } from "@/telegram/start-param";

let initialized = false;

/**
 * Prepare Telegram Mini App chrome (fullscreen, colors, viewport).
 * Safe to call in a normal browser — no-op when not in Telegram.
 */
export function initTelegramMiniApp(): boolean {
  if (initialized) return isTelegramMiniApp();
  initialized = true;

  const mock = import.meta.env.VITE_TELEGRAM_MINI_APP_MOCK === "true";
  if (mock && !getTelegramWebApp()) {
    document.documentElement.classList.add("telegram-mini-app");
    return true;
  }

  const webApp = getTelegramWebApp();
  if (!webApp) {
    return false;
  }

  document.documentElement.classList.add("telegram-mini-app");

  webApp.ready();
  webApp.expand();

  try {
    webApp.disableVerticalSwipes?.();
  } catch {
    /* not supported */
  }

  applyTelegramTheme(webApp);
  syncTelegramViewportCss(webApp);
  captureTelegramStartParam();

  const onViewport = () => syncTelegramViewportCss(webApp);
  webApp.onEvent("viewportChanged", onViewport);

  return true;
}
