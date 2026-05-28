import { useId, useState } from "react";
import { Send, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import type { Message } from "../features/inbox/types";
import { isPortfolioApiConfigured } from "@/utils/reply-api";
import { cn } from "./ui/utils";

const MIN_REPLY_LENGTH = 2;

interface ReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onSend: (content: string) => void | Promise<void>;
  onOpenInMailClient: () => void;
}

export function ReplyDialog({ isOpen, onClose, message, onSend, onOpenInMailClient }: ReplyDialogProps) {
  const bodyId = useId();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const apiConfigured = isPortfolioApiConfigured();
  const trimmed = content.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_REPLY_LENGTH;
  const canSend = apiConfigured && trimmed.length >= MIN_REPLY_LENGTH && !isSending;

  const resetForm = () => {
    setContent("");
    setIsSending(false);
  };

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      resetForm();
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="glass-elevated border-glass-border gap-5 p-6 sm:max-w-2xl">
        <DialogHeader className="gap-1.5 space-y-0 text-left">
          <DialogTitle className="pe-8 text-heading-sm text-text-primary">
            Reply to {message.senderName}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-text-secondary">
            Your reply will be emailed to{" "}
            <span className="text-text-primary">{message.senderEmail}</span>
            {message.company ? (
              <>
                {" "}
                <span className="text-text-muted">· {message.company}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {!apiConfigured ? (
          <p
            className="rounded-lg border border-error/30 bg-error/10 p-3 text-body-sm text-error"
            role="alert"
          >
            Set <code className="text-meta">VITE_PORTFOLIO_API_URL</code> in{" "}
            <code className="text-meta">.env</code> (portfolio site origin).
          </p>
        ) : null}

        <div className="glass rounded-xl border border-glass-border p-4">
          <p className="text-meta mb-2 text-text-muted">Original message</p>
          <p className="text-body-sm line-clamp-4 text-text-secondary">{message.preview}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={bodyId} className="text-text-primary">
            Your reply
          </Label>
          <Textarea
            id={bodyId}
            name="reply-body"
            placeholder="Write your reply…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!apiConfigured || isSending}
            aria-invalid={tooShort}
            aria-describedby={`${bodyId}-hint`}
            className="reply-composer min-h-[12rem] resize-none focus-visible:ring-0"
          />
          <p
            id={`${bodyId}-hint`}
            className={cn("text-meta", tooShort ? "text-error" : "text-text-muted")}
          >
            {tooShort
              ? `At least ${MIN_REPLY_LENGTH} characters required.`
              : "Sent via your portfolio contact API."}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onOpenInMailClient}
            className="glass ui-hover-glass border-glass-border"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open in Mail
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="ui-hover-cyan border-0 bg-cyan text-background"
            aria-busy={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Send Reply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
