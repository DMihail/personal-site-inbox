import { useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "./ui/button";

const UPDATE_CHECK_MS = 60 * 60 * 1000;

export function PwaUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    immediate: true,
    onNeedReload() {
      setNeedRefresh(true);
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        void registration.update();
      }
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let intervalId: number | undefined;

    const checkForUpdates = () => {
      void navigator.serviceWorker.ready.then((registration) => registration.update());
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdates();
    };

    void navigator.serviceWorker.ready.then(() => {
      checkForUpdates();
      window.addEventListener("focus", checkForUpdates);
      document.addEventListener("visibilitychange", onVisible);
      intervalId = window.setInterval(checkForUpdates, UPDATE_CHECK_MS);
    });

    return () => {
      window.removeEventListener("focus", checkForUpdates);
      document.removeEventListener("visibilitychange", onVisible);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  if (!needRefresh) return null;

  const applyUpdate = () => {
    setNeedRefresh(false);
    window.location.reload();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-glass-border glass-elevated px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="icon-well icon-well-md shrink-0">
            <RefreshCw className="h-4 w-4 text-cyan" aria-hidden />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-text-primary">Update available</p>
            <p className="text-xs text-text-muted">
              A new version of Developer Inbox is ready. Reload to apply it now.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" size="sm" className="btn-primary" onClick={applyUpdate}>
            Reload now
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="hover:glass-elevated"
            onClick={() => setNeedRefresh(false)}
            aria-label="Dismiss update notice"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
