import { logPush } from "@/push/debug";

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
  sessionStorage.setItem(SESSION_KEY, JSON.stringify([...ids].slice(-MAX_TRACKED_IDS)));
}

/** At most one in-app/system alert per message id per session (foreground only). */
export async function showNotificationOnce(
  messageId: string | undefined,
  show: () => Promise<unknown>,
): Promise<void> {
  const id = messageId?.trim();
  if (id && loadShownIds().has(id)) {
    logPush("skip-duplicate-messageId", { messageId: id });
    return;
  }
  if (id) {
    const ids = loadShownIds();
    ids.add(id);
    persistShownIds(ids);
  }
  await show();
}
