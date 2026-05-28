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
  const isCurrent = currentView === view;

  return (
    <button
      type="button"
      onClick={() => onSelect(view)}
      aria-current={isCurrent ? "page" : undefined}
      className={`ui-transition flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
        isCurrent
          ? "glass-elevated border border-cyan/30 text-text-primary shadow-lg shadow-cyan/5"
          : "ui-hover-nav text-text-muted"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="bg-cyan/20 text-cyan border border-cyan/30 text-xs">
          {count}
        </Badge>
      )}
    </button>
  );
}

