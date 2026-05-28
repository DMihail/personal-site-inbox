import { Circle } from "lucide-react";

interface StatusIndicatorProps {
  label: string;
  status: "online" | "offline" | "syncing";
  showPulse?: boolean;
}

export function StatusIndicator({ label, status, showPulse = true }: StatusIndicatorProps) {
  const statusColors = {
    online: "text-mint",
    offline: "text-text-muted",
    syncing: "text-warning",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <Circle
          className={`h-2 w-2 fill-current ${statusColors[status]}`}
          strokeWidth={0}
        />
        {showPulse && status === "online" && (
          <Circle
            className="absolute inset-0 h-2 w-2 animate-ping text-mint opacity-75"
            strokeWidth={0}
          />
        )}
      </div>
      <span className="font-mono text-xs text-text-muted">{label}</span>
    </div>
  );
}
