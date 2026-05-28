import { useState } from "react";
import { Send, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { SystemMetadata } from "./SystemMetadata";
import type { Message } from "../features/inbox/types";
import { isPortfolioApiConfigured } from "@/utils/reply-api";

const MIN_REPLY_LENGTH = 2;

interface ReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onSend: (content: string) => void | Promise<void>;
  onOpenInMailClient: () => void;
}

export function ReplyDialog({ isOpen, onClose, message, onSend, onOpenInMailClient }: ReplyDialogProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const apiConfigured = isPortfolioApiConfigured();
  const trimmed = content.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_REPLY_LENGTH;
  const canSend = apiConfigured && trimmed.length >= MIN_REPLY_LENGTH && !isSending;

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setContent("");
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-elevated border-glass-border max-w-2xl max-h-[min(90dvh,100%)] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Reply to {message.senderName}</DialogTitle>
              <DialogDescription className="text-body-sm text-text-secondary">
                Your reply will be sent by email to {message.senderEmail} through the portfolio API.
              </DialogDescription>
              <SystemMetadata className="mt-1">
                {message.company} • portfolio.api/inbox/reply
              </SystemMetadata>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {!apiConfigured ? (
            <p className="text-body-sm rounded-lg border border-error/30 bg-error/10 p-3 text-error">
              Set <code className="text-meta">VITE_PORTFOLIO_API_URL</code> in <code className="text-meta">.env</code>{" "}
              (engineering-profile origin, e.g. http://localhost:3000 or https://dzhezhelo.dev).
            </p>
          ) : null}

          <div className="glass rounded-lg p-4 border border-glass-border">
            <p className="text-body-sm mb-2 text-text-muted">Replying to:</p>
            <p className="text-body-sm line-clamp-3 text-text-secondary">{message.preview}</p>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Write your reply..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!apiConfigured || isSending}
              className="min-h-[200px] glass border-glass-border focus:border-cyan resize-none"
            />
            {tooShort ? (
              <p className="text-meta text-error">
                Reply must be at least {MIN_REPLY_LENGTH} characters.
              </p>
            ) : (
              <SystemMetadata>Sent via engineering-profile → SMTP to {message.senderEmail}</SystemMetadata>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onOpenInMailClient}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Mail Client
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="bg-cyan hover:bg-cyan/90 text-background"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send Reply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
