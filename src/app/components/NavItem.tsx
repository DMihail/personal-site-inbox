import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Badge } from "./ui/badge";

import type { View } from "../features/inbox/types";
import { viewToPath } from "../features/inbox/viewRouting";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  view: View;
  count?: number;
  onSelect: (view: View) => void;
}

export function NavItem({ icon: Icon, label, view, count, onSelect }: NavItemProps) {
  const navLabel =
    count !== undefined && count > 0 ? `${label}, ${count} messages` : label;

  return (
    <NavLink
      to={viewToPath(view)}
      onClick={() => onSelect(view)}
      aria-label={navLabel}
      className={({ isActive }) =>
        `ui-transition flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
          isActive
            ? "glass-elevated border border-cyan/30 text-text-primary shadow-lg shadow-cyan/5"
            : "ui-hover-nav text-text-muted"
        }`
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge
          className="border border-cyan/30 bg-cyan/20 text-xs text-cyan"
          aria-hidden="true"
        >
          {count}
        </Badge>
      )}
    </NavLink>
  );
}
