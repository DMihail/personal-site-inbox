import type { TelegramWebApp } from "@/telegram/types";

const APP_BG = "#0a0a0a";
const APP_HEADER = "#0a0a0a";

/** Keep Telegram header/background aligned with the dark inbox chrome. */
export function applyTelegramTheme(webApp: TelegramWebApp): void {
  try {
    webApp.setHeaderColor(APP_HEADER);
    webApp.setBackgroundColor(APP_BG);
  } catch {
    /* older clients */
  }
}

export function syncTelegramViewportCss(webApp: TelegramWebApp): void {
  const root = document.documentElement;
  const stable = webApp.viewportStableHeight;
  const height = stable > 0 ? stable : webApp.viewportHeight;
  if (height > 0) {
    root.style.setProperty("--tg-viewport-stable-height", `${height}px`);
  }

  const contentTop = webApp.contentSafeAreaInset?.top ?? webApp.safeAreaInset?.top ?? 0;
  root.style.setProperty("--tg-content-safe-area-inset-top", `${Math.max(0, contentTop)}px`);
}
