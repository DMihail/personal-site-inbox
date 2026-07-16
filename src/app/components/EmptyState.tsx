import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  titleLevel?: "h2" | "h3";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  titleLevel = "h3",
}: EmptyStateProps) {
  const TitleTag = titleLevel === "h2" ? "h2" : "h3";

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
          <TitleTag className="text-heading text-text-primary">{title}</TitleTag>
          {description ? <p className="text-body-sm text-text-secondary">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
