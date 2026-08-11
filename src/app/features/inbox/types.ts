export type View = "inbox" | "unread" | "important" | "archived" | "settings";

export type SortOption = "newest" | "oldest" | "unread" | "important";
export type FilterOption = "all" | "unread" | "important" | "archived";

export interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  company: string;
  subject: string;
  preview: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  isArchived: boolean;
  source: string;
  repliedAt?: Date;
  lastReplyPreview?: string;
  tags?: string[];
}
