import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { TelegramProvider } from "./TelegramProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TelegramProvider>
      {children}
      <Toaster
        position="top-right"
        offset={{
          top: "max(0.75rem, env(safe-area-inset-top, 0px))",
          right: "max(0.75rem, env(safe-area-inset-right, 0px))",
        }}
        mobileOffset={{
          top: "max(0.75rem, env(safe-area-inset-top, 0px))",
          right: "max(0.75rem, env(safe-area-inset-right, 0px))",
          left: "max(0.75rem, env(safe-area-inset-left, 0px))",
        }}
        toastOptions={{ className: "glass-elevated border-glass-border" }}
      />
    </TelegramProvider>
  );
}
