interface SystemMetadataProps {
  children: React.ReactNode;
  className?: string;
}

export function SystemMetadata({ children, className = "" }: SystemMetadataProps) {
  return (
    <span className={`font-mono text-xs text-text-muted ${className}`}>
      {children}
    </span>
  );
}
