const STORAGE_KEY = "inbox-pending-message-deletes";
const MAX_ID_LENGTH = 256;

function canUseLocalStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function isMessageId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_ID_LENGTH;
}

/** Message IDs waiting for Firestore delete — survives reload during the undo window. */
export function readPendingDeleteIds(): string[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter(isMessageId))];
  } catch {
    return [];
  }
}

function writePendingDeleteIds(ids: string[]): void {
  if (!canUseLocalStorage()) return;
  try {
    if (ids.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota / private mode — in-memory pending deletes still work this session */
  }
}

export function addPendingDeleteId(id: string): void {
  if (!isMessageId(id)) return;
  const ids = new Set(readPendingDeleteIds());
  ids.add(id);
  writePendingDeleteIds([...ids]);
}

export function removePendingDeleteId(id: string): void {
  writePendingDeleteIds(readPendingDeleteIds().filter((item) => item !== id));
}

export function clearPendingDeleteIdsForTests(): void {
  writePendingDeleteIds([]);
}
