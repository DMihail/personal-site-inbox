/** Shared helpers for inbox mutation UX (toasts / deep links). */

export function mutationErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Deep-link path for opening a message from a push notification. */
export function messageDeepLinkPath(messageId: string): string {
  const id = messageId.trim();
  if (!id) return "/inbox";
  return `/inbox?message=${encodeURIComponent(id)}`;
}

export function parseMessageIdFromSearch(search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const id = params.get("message")?.trim();
  return id || null;
}
