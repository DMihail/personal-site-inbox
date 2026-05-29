import { RefreshCw } from "lucide-react";
import { getNotificationUnblockSteps } from "../push/notificationUnblock";
import { Button } from "./ui/button";

interface NotificationPermissionHelpProps {
  onRecheck?: () => void;
  compact?: boolean;
}

export function NotificationPermissionHelp({ onRecheck, compact }: NotificationPermissionHelpProps) {
  const steps = getNotificationUnblockSteps();

  return (
    <div
      className={`rounded-lg border border-error/35 bg-error/5 ${compact ? "p-2.5" : "p-3.5"}`}
      role="note"
    >
      <p className="text-xs font-semibold text-error">Notifications blocked by the browser</p>
      <p className="mt-1 text-meta text-text-muted">
        The app cannot show the permission prompt again until you allow this site in browser
        settings.
      </p>
      <ol className="mt-2.5 list-decimal space-y-1.5 ps-4 text-meta text-text-secondary">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {onRecheck ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`mt-3 w-full glass border-glass-border ${compact ? "h-8" : ""}`}
          onClick={onRecheck}
        >
          <RefreshCw className="me-2 h-3.5 w-3.5" aria-hidden />
          I allowed notifications — check again
        </Button>
      ) : null}
    </div>
  );
}
