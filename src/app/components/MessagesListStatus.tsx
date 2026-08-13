import { AlertTriangle, Loader2, MailX } from "lucide-react";
import { Button } from "./ui/button";
import { EmptyState } from "./EmptyState";

interface MessagesListStatusProps {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyTitle?: string;
  emptyDescription: string;
  onRetry?: () => void;
}

/** Loading / error / empty states for the message list scroll pane. */
export function MessagesListStatus({
  isLoading,
  error,
  isEmpty,
  emptyTitle = "No messages",
  emptyDescription,
  onRetry,
}: MessagesListStatusProps) {
  if (isLoading) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-3 p-6 text-text-muted"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        <p className="text-body-sm">Loading messages…</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn’t load inbox"
        description={error}
        action={
          onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry} className="glass ui-hover-glass border-glass-border">
              Try again
            </Button>
          ) : null
        }
      />
    );
  }

  if (isEmpty) {
    return <EmptyState icon={MailX} title={emptyTitle} description={emptyDescription} />;
  }

  return null;
}
