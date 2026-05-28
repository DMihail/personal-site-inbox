import { APP_NAME, APP_VERSION } from "@/utils/app-info";

interface AppVersionProps {
  className?: string;
}

export function AppVersion({ className = "" }: AppVersionProps) {
  return (
    <p
      className={`text-center text-meta text-text-muted ${className}`.trim()}
      aria-label={`${APP_NAME} version ${APP_VERSION}`}
    >
      {APP_NAME} · v{APP_VERSION}
    </p>
  );
}
