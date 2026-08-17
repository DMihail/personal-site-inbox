import {
  Archive,
  ArchiveRestore,
  CheckCheck,
  Mail,
  Star,
  Trash2,
  Reply,
  ExternalLink,
  MailCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { EmptyState } from "./EmptyState";
import type { Message } from "../features/inbox/types";
import {
  formatClockTime,
  formatDateTime,
  formatMediumDate,
  formatShortDate,
} from "@/utils/formatDate";

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
        titleLevel="h2"
      />
    );
  }

  return (
    <article className="flex flex-col md:h-full md:min-h-0" aria-labelledby="message-from-heading">
      <header className="glass shrink-0 space-y-3 border-b border-glass-border p-4 md:space-y-4 md:p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="message-from-heading"
                  className="text-heading text-text-primary md:text-heading-lg"
                >
                  {message.senderName}
                </h2>
                {message.isImportant ? (
                  <Star className="h-5 w-5 fill-mint text-mint" aria-label="Important" />
                ) : null}
                {message.repliedAt ? (
                  <span className="text-meta inline-flex items-center gap-1 rounded-full border border-mint/30 px-2 py-0.5 text-mint">
                    <MailCheck className="h-3 w-3" aria-hidden="true" />
                    Replied {formatShortDate(message.repliedAt)}
                  </span>
                ) : null}
              </div>
              <address className="space-y-1 not-italic">
                <a
                  href={`mailto:${message.senderEmail}`}
                  className="ui-hover-link ui-transition text-meta text-text-secondary"
                >
                  {message.senderEmail}
                </a>
                <p className="text-meta text-text-muted">{message.company}</p>
              </address>
            </div>
            <time
              className="block space-y-0.5 text-end text-meta text-text-muted"
              dateTime={message.timestamp.toISOString()}
            >
              <span className="block">{formatMediumDate(message.timestamp)}</span>
              <span className="block">{formatClockTime(message.timestamp)}</span>
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
            className="ui-hover-cyan ui-transition bg-cyan text-background"
          >
            <Reply className="me-2 h-4 w-4" aria-hidden="true" />
            Reply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onToggleImportant(message.id)}
            className={`glass ui-hover-glass border-glass-border ${
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
            className="glass ui-hover-glass border-glass-border"
          >
            <CheckCheck className="me-2 h-4 w-4" aria-hidden="true" />
            Mark read
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onArchive(message.id)}
            className="glass ui-hover-glass border-glass-border"
          >
            {message.isArchived ? (
              <ArchiveRestore className="me-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <Archive className="me-2 h-4 w-4" aria-hidden="true" />
            )}
            {message.isArchived ? "Move to inbox" : "Archive"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => window.open(`mailto:${message.senderEmail}`, "_blank")}
            className="glass ui-hover-glass border-glass-border"
          >
            <ExternalLink className="me-2 h-4 w-4" aria-hidden="true" />
            Open in mail
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDelete(message.id)}
            className="ui-hover-danger glass ms-auto border-glass-border"
          >
            <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-y-contain">
        <div className="space-y-6 p-4 md:p-6">
          <section className="space-y-3" aria-labelledby="message-body-label">
            <h3 id="message-body-label" className="text-body-sm font-medium text-text-primary">
              Message
            </h3>
            <div className="glass-elevated rounded-xl border border-glass-border p-6">
              <p className="leading-relaxed whitespace-pre-wrap text-text-primary">
                {message.preview}
              </p>
            </div>
          </section>

          {message.lastReplyPreview ? (
            <section className="space-y-3" aria-labelledby="last-reply-label">
              <h3 id="last-reply-label" className="text-body-sm font-medium text-text-primary">
                Your last reply
              </h3>
              <blockquote className="glass rounded-xl border border-mint/20 p-4">
                <p className="text-body-sm line-clamp-6 whitespace-pre-wrap text-text-secondary">
                  {message.lastReplyPreview}
                </p>
                {message.repliedAt ? (
                  <footer className="mt-2">
                    <time
                      className="text-meta text-text-muted"
                      dateTime={message.repliedAt.toISOString()}
                    >
                      {formatDateTime(message.repliedAt)}
                    </time>
                  </footer>
                ) : null}
              </blockquote>
            </section>
          ) : null}

          <Separator className="bg-glass-border" />

          <section className="space-y-3" aria-labelledby="message-meta-label">
            <h3 id="message-meta-label" className="text-body-sm font-medium text-text-primary">
              Details
            </h3>
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
                    className="ui-hover-link ui-transition font-mono text-meta text-text-secondary"
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
                    {formatDateTime(message.timestamp)}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center">
                <dt className="shrink-0 text-text-muted sm:w-32">Status</dt>
                <dd className="flex items-center gap-2">
                  <span className={message.isRead ? "text-text-muted" : "text-cyan"}>
                    {message.isRead ? "Read" : "Unread"}
                  </span>
                  {message.isImportant ? (
                    <>
                      <span className="text-text-muted" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-mint">Important</span>
                    </>
                  ) : null}
                  {message.isArchived ? (
                    <>
                      <span className="text-text-muted" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-text-muted">Archived</span>
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
