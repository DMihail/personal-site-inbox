import { Bell, BellOff } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { SystemMetadata } from "./SystemMetadata";
import { Badge } from "./ui/badge";

interface TopBarProps {
  unreadCount: number;
  isOnline: boolean;
}

export function TopBar({ unreadCount, isOnline }: TopBarProps) {
  return (
    <div className="h-16 border-b border-glass-border glass backdrop-blur-xl px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <StatusIndicator label="realtime.active" status={isOnline ? "online" : "offline"} />
        <StatusIndicator label="notifications.enabled" status="online" showPulse={false} />
        <SystemMetadata>pwa.v1</SystemMetadata>
      </div>

      <div className="flex items-center gap-4">
        {unreadCount > 0 ? (
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan" />
            <Badge variant="secondary" className="bg-cyan/20 text-cyan border border-cyan/30">
              {unreadCount} unread
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted">
            <BellOff className="h-4 w-4" />
            <span className="text-xs">All caught up</span>
          </div>
        )}
      </div>
    </div>
  );
}
