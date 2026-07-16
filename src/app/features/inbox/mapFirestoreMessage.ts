import type { Message } from "@/app/features/inbox/types";

type FirestoreMessageDoc = {
  name: string;
  email: string;
  company: string | null;
  message: string;
  createdAt: { toDate: () => Date } | null;
  source?: string;
  read?: boolean;
  archived?: boolean;
  important?: boolean;
  repliedAt?: { toDate: () => Date } | null;
  lastReplyPreview?: string;
};

/** Maps a Firestore contact-message document into the inbox Message model. */
export function mapFirestoreMessage(id: string, d: FirestoreMessageDoc): Message {
  const timestamp = d.createdAt ? d.createdAt.toDate() : new Date(0);
  const company = d.company ?? "—";
  const preview = d.message;
  return {
    id,
    senderName: d.name,
    senderEmail: d.email,
    company,
    subject: `Message from ${d.name}`,
    preview,
    timestamp,
    isRead: Boolean(d.read),
    isImportant: Boolean(d.important),
    isArchived: Boolean(d.archived),
    source: d.source ?? "contact",
    repliedAt: d.repliedAt ? d.repliedAt.toDate() : undefined,
    lastReplyPreview:
      typeof d.lastReplyPreview === "string" ? d.lastReplyPreview : undefined,
    tags: d.source ? [d.source] : undefined,
  };
}

export type { FirestoreMessageDoc };
