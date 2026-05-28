import { format } from "date-fns";
import { Archive, CheckCheck, Mail, Star, Trash2, Reply, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { SystemMetadata } from "./SystemMetadata";
import { EmptyState } from "./EmptyState";
import type { Message } from "../features/inbox/types";

interface MessageDetailProps {
  message: Message | null;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onDelete: (id: string) => void;
  onReply: () => void;
}

export function MessageDetail({
  message,
  onMarkAsRead,
  onArchive,
  onToggleImportant,
  onDelete,
  onReply
}: MessageDetailProps) {
  if (!message) {
    return (
      <EmptyState
        icon={Mail}
        title="No message selected"
        description="Select a message from the inbox to view details"
        metadata="inbox.v1"
      />
    );
  }

  return (
    <div className="flex flex-col md:h-full md:min-h-0">
      <div className="shrink-0 border-b border-glass-border p-4 md:p-6 space-y-3 md:space-y-4 glass">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl text-text-primary">{message.senderName}</h2>
                {message.isImportant && (
                  <Star className="h-5 w-5 text-mint fill-mint" />
                )}
              </div>
              <div className="space-y-1">
                <SystemMetadata className="text-text-secondary">
                  {message.senderEmail}
                </SystemMetadata>
                <SystemMetadata>{message.company}</SystemMetadata>
              </div>
            </div>
            <div className="text-right space-y-1">
              <SystemMetadata>
                {format(message.timestamp, "MMM d, yyyy")}
              </SystemMetadata>
              <SystemMetadata>
                {format(message.timestamp, "HH:mm")}
              </SystemMetadata>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={onReply}
            className="bg-cyan hover:bg-cyan/90 text-background"
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleImportant(message.id)}
            className={`glass border-glass-border hover:bg-glass-elevated ${
              message.isImportant ? "border-mint/40 text-mint" : ""
            }`}
          >
            <Star className={`h-4 w-4 mr-2 ${message.isImportant ? "fill-mint" : ""}`} />
            {message.isImportant ? "Starred" : "Star"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarkAsRead(message.id)}
            disabled={message.isRead}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark Read
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onArchive(message.id)}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`mailto:${message.senderEmail}`, '_blank')}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Mail
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(message.id)}
            className="glass border-glass-border hover:bg-glass-elevated hover:border-error/40 hover:text-error ml-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:overscroll-y-contain">
        <div className="p-4 md:p-6 space-y-6">
          <div className="space-y-3">
            <SystemMetadata>message.body</SystemMetadata>
            <div className="glass-elevated rounded-xl p-6 border border-glass-border">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                {message.preview}
              </p>
            </div>
          </div>

          <Separator className="bg-glass-border" />

          <div className="space-y-3">
            <SystemMetadata>metadata</SystemMetadata>
            <div className="glass rounded-xl p-4 border border-glass-border space-y-3">
              <div className="grid gap-3 text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                  <span className="text-text-muted sm:w-32 shrink-0">From:</span>
                  <span className="text-text-primary">{message.senderName}</span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                  <span className="text-text-muted sm:w-32 shrink-0">Email:</span>
                  <span className="text-text-secondary font-mono text-xs">{message.senderEmail}</span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                  <span className="text-text-muted sm:w-32 shrink-0">Company:</span>
                  <span className="text-text-primary">{message.company}</span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                  <span className="text-text-muted sm:w-32 shrink-0">Source:</span>
                  <span className="text-text-secondary">{message.source}</span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                  <span className="text-text-muted sm:w-32 shrink-0">Received:</span>
                  <span className="text-text-secondary">
                    {format(message.timestamp, "PPpp")}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                  <span className="text-text-muted sm:w-32 shrink-0">Status:</span>
                  <div className="flex items-center gap-2">
                    <span className={message.isRead ? "text-text-muted" : "text-cyan"}>
                      {message.isRead ? "read" : "unread"}
                    </span>
                    {message.isImportant && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span className="text-mint">important</span>
                      </>
                    )}
                    {message.isArchived && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-muted">archived</span>
                      </>
                    )}
                  </div>
                </div>
                {message.tags && message.tags.length > 0 && (
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start">
                    <span className="text-text-muted sm:w-32 shrink-0">Tags:</span>
                    <div className="flex gap-2 flex-wrap">
                      {message.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-md text-xs bg-cyan/10 text-cyan border border-cyan/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
