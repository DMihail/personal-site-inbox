import type { Message } from "@/app/features/inbox/types";

type RawFirestoreMessageDoc = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
  createdAt?: { toDate?: () => Date } | null;
  source?: unknown;
  read?: unknown;
  archived?: unknown;
  important?: unknown;
  repliedAt?: { toDate?: () => Date } | null;
  lastReplyPreview?: unknown;
};

type ValidFirestoreMessageDoc = {
  name: string;
  email: string;
  message: string;
  company?: unknown;
  createdAt?: { toDate?: () => Date } | null;
  source?: unknown;
  read?: unknown;
  archived?: unknown;
  important?: unknown;
  repliedAt?: { toDate?: () => Date } | null;
  lastReplyPreview?: unknown;
};

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  );
}

/** Returns true when a Firestore doc has the minimum fields for an inbox row. */
export function isFirestoreMessageDoc(data: unknown): data is ValidFirestoreMessageDoc {
  if (!data || typeof data !== "object") return false;
  const d = data as RawFirestoreMessageDoc;
  return (
    typeof d.name === "string" &&
    d.name.trim().length > 0 &&
    typeof d.email === "string" &&
    d.email.trim().length > 0 &&
    typeof d.message === "string"
  );
}

/**
 * Maps a Firestore contact-message document into the inbox Message model.
 * Returns `null` for malformed docs so the snapshot mapper can skip them.
 */
export function mapFirestoreMessage(id: string, data: unknown): Message | null {
  if (!isFirestoreMessageDoc(data)) return null;

  const name = data.name.trim();
  const email = data.email.trim();
  const body = data.message;
  const timestamp = hasToDate(data.createdAt) ? data.createdAt.toDate() : new Date(0);
  const company =
    typeof data.company === "string" && data.company.trim() ? data.company.trim() : "—";
  const source = typeof data.source === "string" && data.source.trim() ? data.source : "contact";

  return {
    id,
    senderName: name,
    senderEmail: email,
    company,
    subject: `Message from ${name}`,
    preview: body,
    timestamp,
    isRead: Boolean(data.read),
    isImportant: Boolean(data.important),
    isArchived: Boolean(data.archived),
    source,
    repliedAt: hasToDate(data.repliedAt) ? data.repliedAt.toDate() : undefined,
    lastReplyPreview:
      typeof data.lastReplyPreview === "string" ? data.lastReplyPreview : undefined,
    tags: source !== "contact" ? [source] : undefined,
  };
}

export type { ValidFirestoreMessageDoc as FirestoreMessageDoc };
