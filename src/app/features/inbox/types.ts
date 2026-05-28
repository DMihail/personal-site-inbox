export type View = "inbox" | "unread" | "important" | "archived" | "settings";

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
  tags?: string[];
}

