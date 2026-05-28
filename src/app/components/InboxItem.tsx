import { formatDistanceToNow } from "date-fns";
import { Mail, MailOpen, Star, Trash2 } from "lucide-react";
import { SystemMetadata } from "./SystemMetadata";
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
  showActions = false
}: InboxItemProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
        isActive
          ? "glass-elevated border-cyan/40 shadow-lg shadow-cyan/5"
          : message.isRead
          ? "glass border-glass-border hover:border-glass-border/50"
          : "glass-elevated border-cyan/20 shadow-md shadow-cyan/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {message.isRead ? (
            <MailOpen className="h-4 w-4 text-text-muted" />
          ) : (
            <Mail className="h-4 w-4 text-cyan" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={message.isRead ? "text-text-primary" : "text-text-primary font-medium"}>
              {message.senderName}
            </span>
            {message.isImportant && (
              <Star className="h-3 w-3 text-mint fill-mint" />
            )}
            <SystemMetadata>{message.company}</SystemMetadata>
          </div>

          <p
            className={`text-sm line-clamp-2 leading-relaxed ${
              message.isRead ? "text-text-muted" : "text-text-secondary"
            }`}
          >
            {message.preview}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <SystemMetadata>
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </SystemMetadata>
            <span className="text-text-muted">·</span>
            <SystemMetadata>{message.source}</SystemMetadata>
            {message.tags && message.tags.length > 0 && (
              <>
                <span className="text-text-muted">·</span>
                {message.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-xs bg-cyan/10 text-cyan border border-cyan/20"
                  >
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleImportant && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleImportant(message.id);
                }}
                className="h-7 w-7 p-0 hover:bg-glass-elevated"
              >
                <Star className={`h-4 w-4 ${message.isImportant ? "text-mint fill-mint" : "text-text-muted"}`} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(message.id);
                }}
                className="h-7 w-7 p-0 hover:bg-glass-elevated hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
