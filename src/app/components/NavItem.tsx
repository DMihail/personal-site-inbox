import type { LucideIcon } from "lucide-react";

import { Badge } from "./ui/badge";

import type { View } from "../features/inbox/types";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  view: View;
  currentView: View;
  count?: number;
  onSelect: (view: View) => void;
}

export function NavItem({ icon: Icon, label, view, currentView, count, onSelect }: NavItemProps) {
  return (
    <button
      onClick={() => onSelect(view)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
        currentView === view
          ? "glass-elevated border border-cyan/30 text-text-primary shadow-lg shadow-cyan/5"
          : "text-text-muted hover:glass-elevated hover:text-text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="bg-cyan/20 text-cyan border border-cyan/30 text-xs">
          {count}
        </Badge>
      )}
    </button>
  );
}

