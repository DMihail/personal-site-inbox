import type { ReactNode } from "react";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{ className: "glass-elevated border-glass-border" }}
      />
    </>
  );
}
