import { format } from "date-fns";
import { Archive, CheckCheck, Mail, Star, Trash2, Reply, ExternalLink, MailCheck } from "lucide-react";
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
  onReply,
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
    <article className="flex flex-col md:h-full md:min-h-0" aria-labelledby="message-subject">
      <header className="glass shrink-0 space-y-3 border-b border-glass-border p-4 md:space-y-4 md:p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="message-subject" className="text-heading text-text-primary md:text-heading-lg">
                  {message.senderName}
                </h2>
                {message.isImportant ? (
                  <Star className="h-5 w-5 fill-mint text-mint" aria-label="Important" />
                ) : null}
                {message.repliedAt ? (
                  <span className="text-meta inline-flex items-center gap-1 rounded-full border border-mint/30 px-2 py-0.5 text-mint">
                    <MailCheck className="h-3 w-3" aria-hidden="true" />
                    Replied {format(message.repliedAt, "MMM d")}
                  </span>
                ) : null}
              </div>
              <address className="space-y-1 not-italic">
                <SystemMetadata className="text-text-secondary">
                  <a href={`mailto:${message.senderEmail}`} className="hover:text-cyan">
                    {message.senderEmail}
                  </a>
                </SystemMetadata>
                <SystemMetadata>{message.company}</SystemMetadata>
              </address>
            </div>
            <time
              className="space-y-1 text-end"
              dateTime={message.timestamp.toISOString()}
            >
              <SystemMetadata>{format(message.timestamp, "MMM d, yyyy")}</SystemMetadata>
              <SystemMetadata>{format(message.timestamp, "HH:mm")}</SystemMetadata>
            </time>
          </div>
        </div>

        <div
          className="flex flex-wrap items-center gap-2"
          role="toolbar"
          aria-label="Message actions"
        >
          <Button
            type="button"
            size="sm"
            onClick={onReply}
            className="bg-cyan text-background hover:bg-cyan/90"
          >
            <Reply className="me-2 h-4 w-4" aria-hidden="true" />
            Reply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onToggleImportant(message.id)}
            className={`glass border-glass-border hover:bg-glass-elevated ${
              message.isImportant ? "border-mint/40 text-mint" : ""
            }`}
            aria-pressed={message.isImportant}
          >
            <Star
              className={`me-2 h-4 w-4 ${message.isImportant ? "fill-mint" : ""}`}
              aria-hidden="true"
            />
            {message.isImportant ? "Starred" : "Star"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onMarkAsRead(message.id)}
            disabled={message.isRead}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            <CheckCheck className="me-2 h-4 w-4" aria-hidden="true" />
            Mark read
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onArchive(message.id)}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            <Archive className="me-2 h-4 w-4" aria-hidden="true" />
            Archive
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => window.open(`mailto:${message.senderEmail}`, "_blank")}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            <ExternalLink className="me-2 h-4 w-4" aria-hidden="true" />
            Open in mail
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDelete(message.id)}
            className="ms-auto glass border-glass-border hover:border-error/40 hover:bg-glass-elevated hover:text-error"
          >
            <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-y-contain">
        <div className="space-y-6 p-4 md:p-6">
          <section className="space-y-3" aria-labelledby="message-body-label">
            <h3 id="message-body-label" className="sr-only">
              Message body
            </h3>
            <SystemMetadata>message.body</SystemMetadata>
            <div className="glass-elevated rounded-xl border border-glass-border p-6">
              <p className="leading-relaxed whitespace-pre-wrap text-text-primary">
                {message.preview}
              </p>
            </div>
          </section>

          {message.lastReplyPreview ? (
            <section className="space-y-3" aria-labelledby="last-reply-label">
              <h3 id="last-reply-label" className="sr-only">
                Your last reply
              </h3>
              <SystemMetadata>your.last.reply</SystemMetadata>
              <blockquote className="glass rounded-xl border border-mint/20 p-4">
                <p className="text-body-sm line-clamp-6 whitespace-pre-wrap text-text-secondary">
                  {message.lastReplyPreview}
                </p>
                {message.repliedAt ? (
                  <footer className="mt-2">
                    <time dateTime={message.repliedAt.toISOString()}>
                      <SystemMetadata>{format(message.repliedAt, "PPpp")}</SystemMetadata>
                    </time>
                  </footer>
                ) : null}
              </blockquote>
            </section>
          ) : null}

          <Separator className="bg-glass-border" />

          <section className="space-y-3" aria-labelledby="message-meta-label">
            <h3 id="message-meta-label" className="sr-only">
              Message metadata
            </h3>
            <SystemMetadata>metadata</SystemMetadata>
            <dl className="glass text-body-sm space-y-3 rounded-xl border border-glass-border p-4">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <dt className="shrink-0 text-text-muted sm:w-32">From</dt>
                <dd className="text-text-primary">{message.senderName}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <dt className="shrink-0 text-text-muted sm:w-32">Email</dt>
                <dd>
                  <a
                    href={`mailto:${message.senderEmail}`}
                    className="font-mono text-meta text-text-secondary hover:text-cyan"
                  >
                    {message.senderEmail}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <dt className="shrink-0 text-text-muted sm:w-32">Company</dt>
                <dd className="text-text-primary">{message.company}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <dt className="shrink-0 text-text-muted sm:w-32">Source</dt>
                <dd className="text-text-secondary">{message.source}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <dt className="shrink-0 text-text-muted sm:w-32">Received</dt>
                <dd className="text-text-secondary">
                  <time dateTime={message.timestamp.toISOString()}>
                    {format(message.timestamp, "PPpp")}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <dt className="shrink-0 text-text-muted sm:w-32">Status</dt>
                <dd className="flex items-center gap-2">
                  <span className={message.isRead ? "text-text-muted" : "text-cyan"}>
                    {message.isRead ? "read" : "unread"}
                  </span>
                  {message.isImportant ? (
                    <>
                      <span className="text-text-muted" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-mint">important</span>
                    </>
                  ) : null}
                  {message.isArchived ? (
                    <>
                      <span className="text-text-muted" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-text-muted">archived</span>
                    </>
                  ) : null}
                </dd>
              </div>
              {message.tags && message.tags.length > 0 ? (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start">
                  <dt className="shrink-0 text-text-muted sm:w-32">Tags</dt>
                  <dd className="flex flex-wrap gap-2">
                    {message.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-meta rounded-md border border-cyan/20 bg-cyan/10 px-2 py-1 text-cyan"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>
      </div>
    </article>
  );
}
