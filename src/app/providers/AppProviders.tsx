import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { PortraitOrientationGate } from "@/app/components/PortraitOrientationGate";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { MEDIA_QUERIES } from "@/shared/constants/media-queries";
import { TelegramProvider } from "./TelegramProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const blockLandscape = useMediaQuery(MEDIA_QUERIES.phoneOrTabletLandscape);

  return (
    <TelegramProvider>
      <div className="h-full" inert={blockLandscape ? true : undefined}>
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
      </div>
      <PortraitOrientationGate open={blockLandscape} />
    </TelegramProvider>
  );
}
