interface RouteLoadingScreenProps {
  label?: string;
}

export function RouteLoadingScreen({ label = "Loading…" }: RouteLoadingScreenProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-background text-text-muted">
      {label}
    </div>
  );
}
