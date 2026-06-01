import { useCallback, useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { isPwaRuntime } from "@/pwa/config";
import { Button } from "./ui/button";

const DISMISS_KEY = "pwa-update-dismissed-script";

function shouldOfferReload(registration: ServiceWorkerRegistration): boolean {
  if (!registration.waiting || !navigator.serviceWorker.controller) {
    return false;
  }
  return sessionStorage.getItem(DISMISS_KEY) !== registration.waiting.scriptURL;
}

function watchWaitingWorker(registration: ServiceWorkerRegistration, onUpdate: (show: boolean) => void) {
  const sync = () => {
    onUpdate(shouldOfferReload(registration));
  };

  sync();
  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    installing?.addEventListener("statechange", () => {
      if (installing.state === "installed") {
        sync();
      }
    });
  });
}

export function PwaUpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const useWorkboxUpdates = isPwaRuntime;

  useRegisterSW({
    immediate: useWorkboxUpdates,
    onRegisteredSW(_swUrl, registration) {
      if (!useWorkboxUpdates || !registration) return;
      watchWaitingWorker(registration, (show) => {
        setShowUpdate(show);
      });
    },
  });

  useEffect(() => {
    if (!useWorkboxUpdates || !("serviceWorker" in navigator)) return;

    const onControllerChange = () => {
      void navigator.serviceWorker.getRegistration("/").then((reg) => {
        setShowUpdate(reg ? shouldOfferReload(reg) : false);
      });
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, [useWorkboxUpdates]);

  const applyUpdate = useCallback(async () => {
    setShowUpdate(false);
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
      await new Promise<void>((resolve) => {
        const timeout = window.setTimeout(resolve, 5000);
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            window.clearTimeout(timeout);
            resolve();
          },
          { once: true },
        );
      });
    }
    window.location.reload();
  }, []);

  const dismissUpdate = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (reg?.waiting) {
      sessionStorage.setItem(DISMISS_KEY, reg.waiting.scriptURL);
    }
    setShowUpdate(false);
  }, []);

  if (!useWorkboxUpdates || !showUpdate) return null;

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
          <Button type="button" size="sm" className="btn-primary" onClick={() => void applyUpdate()}>
            Reload now
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ui-hover-ghost"
            onClick={() => void dismissUpdate()}
            aria-label="Dismiss update notice"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
