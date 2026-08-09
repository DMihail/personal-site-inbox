import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useAppServiceWorkerUpdate } from "../hooks/useAppServiceWorkerUpdate";
import { isTelegramMiniApp } from "@/telegram/detect";

/**
 * Prompts when a new `/sw.js` is waiting. Safe with FCM: one SW owns scope `/`.
 */
export function PwaUpdateBanner() {
  const { needRefresh, applyUpdate } = useAppServiceWorkerUpdate();

  if (isTelegramMiniApp() || !needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="app-chrome-safe-top fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-2 pointer-events-none"
    >
      <div className="pointer-events-auto glass-elevated flex max-w-lg items-center gap-3 rounded-xl border border-cyan/30 px-4 py-3 shadow-lg">
        <p className="text-body-sm text-text-primary">A new version of Inbox is ready.</p>
        <Button
          type="button"
          size="sm"
          className="shrink-0 bg-cyan text-background hover:bg-cyan/90"
          onClick={applyUpdate}
        >
          <RefreshCw className="me-1.5 h-3.5 w-3.5" aria-hidden />
          Update
        </Button>
      </div>
    </div>
  );
}
