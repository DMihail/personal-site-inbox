import { Share, Smartphone, X } from "lucide-react";
import { isTelegramMiniApp } from "@/telegram/detect";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { Button } from "./ui/button";

export function PwaInstallPrompt() {
  const { platform, visible, canNativePrompt, dismiss, promptInstall } = usePwaInstall();

  if (isTelegramMiniApp() || !visible || !platform) return null;

  return (
    <div
      role="region"
      aria-labelledby="pwa-install-title"
      className="glass-elevated rounded-xl border border-cyan/25 bg-cyan/5 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-glass-border glass">
            <Smartphone className="h-4 w-4 text-cyan" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p id="pwa-install-title" className="text-body-sm font-medium text-text-primary">
              Install Developer Inbox
            </p>
            {platform === "ios" ? (
              <>
                <p className="text-meta text-text-muted">
                  On iPhone and iPad, push notifications work only after you add the app to the Home
                  Screen.
                </p>
                <ol className="mt-2 list-decimal space-y-1 ps-4 text-meta text-text-secondary">
                  <li className="flex items-start gap-1.5">
                    <Share className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" aria-hidden />
                    <span>
                      Tap <strong className="text-text-primary">Share</strong> in Safari
                    </span>
                  </li>
                  <li>
                    Choose <strong className="text-text-primary">Add to Home Screen</strong>
                  </li>
                  <li>Open the app from the new icon, then enable notifications in Settings</li>
                </ol>
              </>
            ) : (
              <p className="text-meta text-text-muted">
                Install the app for background alerts when it is closed.
              </p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ui-hover-ghost shrink-0"
          onClick={dismiss}
          aria-label="Dismiss install instructions"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {canNativePrompt ? (
        <Button
          type="button"
          size="sm"
          className="mt-3 w-full bg-cyan text-background hover:bg-cyan/90"
          onClick={() => void promptInstall()}
        >
          Install app
        </Button>
      ) : null}
    </div>
  );
}
