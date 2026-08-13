import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import {
  Archive,
  ArchiveRestore,
  Mail,
  MailOpen,
  MoreHorizontal,
  Star,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import { Button } from "./ui/button";
import type { Message } from "../features/inbox/types";
import { useSwipeRowActions } from "../hooks/useSwipeRowActions";
import { SWIPE_ACTION_WIDTH } from "../hooks/swipeRowGesture";

interface InboxItemProps {
  message: Message;
  isActive: boolean;
  onClick: () => void;
  onToggleImportant?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Desktop hover quick-actions */
  showActions?: boolean;
  /** Mobile / tablet Mail-style swipe actions */
  enableSwipe?: boolean;
  swipeOpen?: boolean;
  onSwipeOpenChange?: (open: boolean) => void;
}

export function InboxItem({
  message,
  isActive,
  onClick,
  onToggleImportant,
  onArchive,
  onDelete,
  showActions = false,
  enableSwipe = false,
  swipeOpen = false,
  onSwipeOpenChange,
}: InboxItemProps) {
  const itemLabel = `${message.isRead ? "" : "Unread: "}${message.senderName}, ${message.company}`;
  const swipeEnabled = enableSwipe && Boolean(onToggleImportant || onArchive || onDelete);
  const actionCount = [onToggleImportant, onArchive, onDelete].filter(Boolean).length;
  const maxReveal = actionCount * SWIPE_ACTION_WIDTH;

  const handleSwipeOpenChange = useCallback(
    (open: boolean) => {
      onSwipeOpenChange?.(open);
    },
    [onSwipeOpenChange],
  );

  const swipe = useSwipeRowActions({
    enabled: swipeEnabled,
    open: swipeOpen,
    onOpenChange: handleSwipeOpenChange,
    maxReveal,
  });

  const surfaceClass = [
    "inbox-row-surface group flex w-full items-start gap-1 rounded-xl border",
    isActive
      ? "inbox-row-surface--active border-cyan/40"
      : message.isRead
        ? "inbox-row-surface--read ui-hover-inbox border-glass-border"
        : "inbox-row-surface--unread ui-hover-inbox-unread border-cyan/20",
  ].join(" ");

  const runAction = (action?: (id: string) => void) => {
    action?.(message.id);
    onSwipeOpenChange?.(false);
  };

  const actionsRevealed = swipeEnabled && (swipeOpen || swipe.offset < 0);

  return (
    <li className="inbox-row list-none">
      {swipeEnabled ? (
        <div
          className={`inbox-row-actions absolute inset-y-0 end-0 flex items-stretch overflow-hidden rounded-xl${
            actionsRevealed ? " inbox-row-actions--revealed" : ""
          }`}
          style={{ width: swipe.maxReveal }}
          hidden={!actionsRevealed}
          aria-hidden={!actionsRevealed}
        >
          {onToggleImportant ? (
            <button
              type="button"
              data-swipe-action
              tabIndex={actionsRevealed ? 0 : -1}
              className="inbox-swipe-action inbox-swipe-action--important"
              style={{ width: SWIPE_ACTION_WIDTH }}
              aria-label={message.isImportant ? "Remove star" : "Mark important"}
              onClick={() => runAction(onToggleImportant)}
            >
              <Star
                className={`h-5 w-5 ${message.isImportant ? "fill-current" : ""}`}
                aria-hidden="true"
              />
            </button>
          ) : null}
          {onArchive ? (
            <button
              type="button"
              data-swipe-action
              tabIndex={actionsRevealed ? 0 : -1}
              className="inbox-swipe-action inbox-swipe-action--archive"
              style={{ width: SWIPE_ACTION_WIDTH }}
              aria-label={message.isArchived ? "Move to inbox" : "Archive message"}
              onClick={() => runAction(onArchive)}
            >
              {message.isArchived ? (
                <ArchiveRestore className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Archive className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              data-swipe-action
              tabIndex={actionsRevealed ? 0 : -1}
              className="inbox-swipe-action inbox-swipe-action--delete"
              style={{ width: SWIPE_ACTION_WIDTH }}
              aria-label={`Delete message from ${message.senderName}`}
              onClick={() => runAction(onDelete)}
            >
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={surfaceClass}
        style={swipeEnabled ? swipe.surfaceStyle : undefined}
        {...(swipeEnabled ? swipe.surfaceHandlers : {})}
      >
        <button
          type="button"
          onClick={() => {
            if (swipeEnabled && swipe.consumeSuppressedClick()) return;
            if (swipeEnabled && swipeOpen) {
              onSwipeOpenChange?.(false);
              return;
            }
            onClick();
          }}
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
                  className={message.isRead ? "text-text-primary" : "font-medium text-text-primary"}
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

        {swipeEnabled ? (
          <div className="flex shrink-0 items-center self-center pe-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-swipe-action
              className="ui-hover-ghost h-8 w-8 p-0"
              aria-expanded={swipeOpen}
              aria-label={swipeOpen ? "Hide message actions" : "Show message actions"}
              onClick={(event) => {
                event.stopPropagation();
                onSwipeOpenChange?.(!swipeOpen);
              }}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : null}

        {showActions && !enableSwipe ? (
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
            {onArchive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onArchive(message.id);
                }}
                className="ui-hover-ghost h-7 w-7 p-0"
                aria-label={message.isArchived ? "Move to inbox" : "Archive message"}
              >
                {message.isArchived ? (
                  <ArchiveRestore className="h-4 w-4 text-text-muted" aria-hidden="true" />
                ) : (
                  <Archive className="h-4 w-4 text-text-muted" aria-hidden="true" />
                )}
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
