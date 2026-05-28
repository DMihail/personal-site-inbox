import type { ReactNode } from "react";

interface SystemMetadataProps {
  children: ReactNode;
  className?: string;
}

/** Secondary caption text (not monospace — for humans, not API keys). */
export function SystemMetadata({ children, className = "" }: SystemMetadataProps) {
  return (
    <span className={`text-meta text-text-muted ${className}`.trim()}>
      {children}
    </span>
  );
}
