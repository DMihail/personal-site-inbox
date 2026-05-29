import { useActionState, useRef } from "react";
import { Send, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
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
import { FormPendingFieldset, FormSubmitButton } from "./form";
import { ReplyFormFields } from "./reply/ReplyFormFields";

const MIN_REPLY_LENGTH = 2;

interface ReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onSend: (content: string) => void | Promise<void>;
  onOpenInMailClient: () => void;
}

export function ReplyDialog({ isOpen, onClose, message, onSend, onOpenInMailClient }: ReplyDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const apiConfigured = isPortfolioApiConfigured();

  const [replyState, sendReplyAction] = useActionState(
    async (_previous: { error?: string } | null, formData: FormData) => {
      if (!message || !apiConfigured) return null;

      const trimmed = String(formData.get("reply-body") ?? "").trim();
      if (trimmed.length < MIN_REPLY_LENGTH) {
        return { error: `Reply must be at least ${MIN_REPLY_LENGTH} characters.` };
      }

      try {
        await onSend(trimmed);
        formRef.current?.reset();
        onClose();
        return null;
      } catch (error) {
        const messageText = error instanceof Error ? error.message : "Failed to send reply.";
        return { error: messageText };
      }
    },
    null,
  );

  if (!message) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          formRef.current?.reset();
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
            <code className="text-meta">.env</code> (backend origin).
          </p>
        ) : null}

        <div className="glass rounded-xl border border-glass-border p-4">
          <p className="text-meta mb-2 text-text-muted">Original message</p>
          <p className="text-body-sm line-clamp-4 text-text-secondary">{message.preview}</p>
        </div>

        <form
          ref={formRef}
          key={message.id}
          action={sendReplyAction}
          className="flex flex-col gap-5"
        >
          <FormPendingFieldset>
            <ReplyFormFields apiConfigured={apiConfigured} />
            {replyState?.error ? (
              <p className="text-body-sm text-error" role="alert">
                {replyState.error}
              </p>
            ) : null}
          </FormPendingFieldset>

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
            <FormSubmitButton
              pendingLabel="Sending…"
              disabled={!apiConfigured}
              className="ui-hover-cyan border-0 bg-cyan text-background"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Send Reply
            </FormSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
