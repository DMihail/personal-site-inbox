import { LucideIcon } from "lucide-react";
import { SystemMetadata } from "./SystemMetadata";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  metadata?: string;
}

export function EmptyState({ icon: Icon, title, description, metadata }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-elevated border border-glass-border">
          <Icon className="h-10 w-10 text-text-muted" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl text-text-primary">{title}</h3>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
        {metadata && <SystemMetadata>{metadata}</SystemMetadata>}
      </div>
    </div>
  );
}
