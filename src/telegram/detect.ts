import type { TelegramWebApp } from "@/telegram/types";

let cachedWebApp: TelegramWebApp | null | undefined;

function isUsableWebApp(webApp: TelegramWebApp | undefined): webApp is TelegramWebApp {
  return Boolean(webApp?.version && typeof webApp.ready === "function" && typeof webApp.expand === "function");
}

function readWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const webApp = window.Telegram?.WebApp;
  if (!isUsableWebApp(webApp)) return null;
  return webApp;
}

/** True when opened inside the Telegram client (Mini App WebView). */
export function isTelegramMiniApp(): boolean {
  if (import.meta.env.VITE_TELEGRAM_MINI_APP_MOCK === "true") {
    return true;
  }
  return readWebApp() !== null;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (cachedWebApp !== undefined) return cachedWebApp;
  cachedWebApp = readWebApp();
  return cachedWebApp;
}

export function resetTelegramDetectionForTests(): void {
  cachedWebApp = undefined;
}
