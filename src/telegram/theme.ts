import type { TelegramWebApp } from "@/telegram/types";

const APP_BG = "#0a0a0a";
const APP_HEADER = "#0a0a0a";

/** Map Telegram theme into CSS variables (optional accent sync). */
export function applyTelegramTheme(webApp: TelegramWebApp): void {
  const root = document.documentElement;
  const tp = webApp.themeParams;

  root.style.setProperty("--tg-theme-bg-color", tp.bg_color ?? APP_BG);
  root.style.setProperty("--tg-theme-text-color", tp.text_color ?? "");
  root.style.setProperty("--tg-theme-hint-color", tp.hint_color ?? "");
  root.style.setProperty("--tg-theme-link-color", tp.link_color ?? "");
  root.style.setProperty("--tg-theme-button-color", tp.button_color ?? "");
  root.style.setProperty("--tg-theme-button-text-color", tp.button_text_color ?? "");
  root.style.setProperty("--tg-theme-secondary-bg-color", tp.secondary_bg_color ?? "");

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
}
