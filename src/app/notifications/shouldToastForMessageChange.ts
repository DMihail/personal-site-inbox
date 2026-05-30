/** Firestore doc change shape we care about for inbox toasts. */
interface MessageDocChange {
  type: "added" | "modified" | "removed";
  doc: { id: string };
}

/**
 * Toast only for genuinely new messages — not the initial snapshot or
 * duplicate "added" events when the listener reconnects.
 */
export function shouldToastForMessageChange(
  change: MessageDocChange,
  options: { hasLoadedOnce: boolean; knownMessageIds: ReadonlySet<string> },
): boolean {
  if (change.type !== "added") return false;
  if (!options.hasLoadedOnce) return false;
  return !options.knownMessageIds.has(change.doc.id);
}
