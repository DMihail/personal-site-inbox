import { useState } from "react";
import { Send, ExternalLink, Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { SystemMetadata } from "./SystemMetadata";
import type { Message } from "../features/inbox/types";

interface ReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onSend: (content: string) => void;
  onOpenInMailClient: () => void;
}

export function ReplyDialog({ isOpen, onClose, message, onSend, onOpenInMailClient }: ReplyDialogProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSend(content);
    setContent("");
    setIsSending(false);
    onClose();
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-elevated border-glass-border max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Reply to {message.senderName}</DialogTitle>
              <SystemMetadata className="mt-1">
                {message.company} • compose.v1
              </SystemMetadata>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="glass rounded-lg p-4 border border-glass-border">
            <p className="text-sm text-text-muted mb-2">Replying to:</p>
            <p className="text-sm text-text-secondary line-clamp-3">
              {message.preview}
            </p>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Write your reply... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] glass border-glass-border focus:border-cyan resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="glass border-glass-border hover:bg-glass-elevated"
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach
              </Button>
              <SystemMetadata>markdown.enabled</SystemMetadata>
            </div>
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
            disabled={!content.trim() || isSending}
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
