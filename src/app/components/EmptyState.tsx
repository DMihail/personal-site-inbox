import type { LucideIcon } from "lucide-react";
import { SystemMetadata } from "./SystemMetadata";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  metadata?: string;
}

export function EmptyState({ icon: Icon, title, description, metadata }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center p-6" role="status" aria-live="polite">
      <div className="max-w-md space-y-4 text-center">
        <div
          className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-glass-border glass-elevated"
          aria-hidden="true"
        >
          <Icon className="h-10 w-10 text-text-muted" />
        </div>
        <div className="space-y-2">
          <p className="text-heading text-text-primary">{title}</p>
          {description ? <p className="text-body-sm text-text-secondary">{description}</p> : null}
        </div>
        {metadata ? <SystemMetadata>{metadata}</SystemMetadata> : null}
      </div>
    </div>
  );
}
