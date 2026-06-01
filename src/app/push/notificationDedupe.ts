import { logPushDebug } from "@/app/push/pushDebug";

const SESSION_KEY = "inbox-notified-message-ids";
const MAX_TRACKED_IDS = 200;

function loadShownIds(): Set<string> {
  if (typeof sessionStorage === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function persistShownIds(ids: Set<string>): void {
  if (typeof sessionStorage === "undefined") return;
  const trimmed = [...ids].slice(-MAX_TRACKED_IDS);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
}

export function markNotificationShown(messageId: string): void {
  const id = messageId.trim();
  if (!id) return;
  const ids = loadShownIds();
  ids.add(id);
  persistShownIds(ids);
}

export function wasNotificationShown(messageId: string): boolean {
  const id = messageId.trim();
  if (!id) return false;
  return loadShownIds().has(id);
}

/** Shows at most one system alert per message id per browser session. */
export async function showNotificationOnce(
  messageId: string | undefined,
  show: () => Promise<unknown>,
): Promise<void> {
  const id = messageId?.trim();
  if (id && wasNotificationShown(id)) {
    logPushDebug("notification-skipped-duplicate-messageId", { messageId: id });
    return;
  }
  if (id) markNotificationShown(id);
  await show();
}
