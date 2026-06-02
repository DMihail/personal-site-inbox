import { getTelegramWebApp } from "@/telegram/detect";
import type { View } from "@/app/features/inbox/types";
import { viewToPath } from "@/app/features/inbox/viewRouting";

const STORAGE_KEY = "telegram-start-param";

const START_PARAM_TO_VIEW: Record<string, View> = {
  inbox: "inbox",
  unread: "unread",
  important: "important",
  archived: "archived",
  settings: "settings",
};

/** Persist `start_param` from BotFather deep link until after login. */
export function captureTelegramStartParam(): void {
  const param = getTelegramWebApp()?.initDataUnsafe?.start_param?.trim();
  if (!param) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, param);
  } catch {
    /* private mode */
  }
}

export function peekTelegramStartPath(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)?.trim();
    if (!raw) return null;
    const view = START_PARAM_TO_VIEW[raw.toLowerCase()];
    return view ? viewToPath(view) : null;
  } catch {
    return null;
  }
}

/** Read and clear stored start param (call once after auth). */
export function consumeTelegramStartPath(): string | null {
  const path = peekTelegramStartPath();
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return path;
}
