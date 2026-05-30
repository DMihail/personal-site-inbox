import { formatDistanceToNow } from "date-fns";
import { Mail, MailOpen, Star, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import type { Message } from "../features/inbox/types";

interface InboxItemProps {
  message: Message;
  isActive: boolean;
  onClick: () => void;
  onToggleImportant?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function InboxItem({
  message,
  isActive,
  onClick,
  onToggleImportant,
  onDelete,
  showActions = false,
}: InboxItemProps) {
  const itemLabel = `${message.isRead ? "" : "Unread: "}${message.senderName}, ${message.company}`;

  return (
    <li className="list-none">
      <div
        className={`group ui-transition flex w-full items-start gap-1 rounded-xl border ${
          isActive
            ? "glass-elevated border-cyan/40 shadow-lg shadow-cyan/5"
            : message.isRead
              ? "glass ui-hover-inbox border-glass-border"
              : "glass-elevated ui-hover-inbox-unread border-cyan/20 shadow-md shadow-cyan/5"
        }`}
      >
        <button
          type="button"
          onClick={onClick}
          aria-current={isActive ? "true" : undefined}
          aria-label={itemLabel}
          className="min-w-0 flex-1 cursor-pointer rounded-xl p-4 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5" aria-hidden="true">
              {message.isRead ? (
                <MailOpen className="h-4 w-4 text-text-muted" />
              ) : (
                <Mail className="h-4 w-4 text-cyan" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    message.isRead ? "text-text-primary" : "font-medium text-text-primary"
                  }
                >
                  {message.senderName}
                </span>
                {message.isImportant ? (
                  <Star className="h-3 w-3 fill-mint text-mint" aria-label="Important" />
                ) : null}
                <span className="text-meta text-text-muted">{message.company}</span>
              </div>

              <p
                className={`text-body-sm line-clamp-2 leading-relaxed ${
                  message.isRead ? "text-text-muted" : "text-text-secondary"
                }`}
              >
                {message.preview}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <time
                  className="font-mono text-meta text-text-muted"
                  dateTime={message.timestamp.toISOString()}
                >
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </time>
                <span className="text-text-muted" aria-hidden="true">
                  ·
                </span>
                <span className="text-meta text-text-muted">{message.source}</span>
                {message.tags && message.tags.length > 0 ? (
                  <>
                    <span className="text-text-muted" aria-hidden="true">
                      ·
                    </span>
                    {message.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-meta rounded-md border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-cyan"
                      >
                        {tag}
                      </span>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </button>

        {showActions ? (
          <div className="flex shrink-0 items-center gap-1 self-center pe-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            {onToggleImportant ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleImportant(message.id);
                }}
                className="ui-hover-ghost h-7 w-7 p-0"
                aria-label={message.isImportant ? "Remove star" : "Mark important"}
              >
                <Star
                  className={`h-4 w-4 ${message.isImportant ? "fill-mint text-mint" : "text-text-muted"}`}
                />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(message.id);
                }}
                className="ui-hover-ghost ui-hover-danger h-7 w-7 p-0"
                aria-label={`Delete message from ${message.senderName}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}
