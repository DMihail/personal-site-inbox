import type { ReactNode } from "react";

interface SystemMetadataProps {
  children: ReactNode;
  className?: string;
}

export function SystemMetadata({ children, className = "" }: SystemMetadataProps) {
  return (
    <span className={`font-mono text-meta text-text-muted ${className}`.trim()}>
      {children}
    </span>
  );
}
