import { useCallback, useEffect, useRef, useState } from "react";
import {
  ensureAppServiceWorker,
  getAppServiceWorkerRegistration,
  requestAppServiceWorkerUpdate,
} from "@/pwa/appServiceWorker";
import { isPwaRuntime } from "@/pwa/config";
import { isTelegramMiniApp } from "@/telegram/detect";

const UPDATE_POLL_MS = 60 * 60 * 1000;

/**
 * Watches the unified `/sw.js` registration for a waiting worker.
 * Does not register a second SW — bootstrap owns registration.
 */
export function useAppServiceWorkerUpdate() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [needRefresh, setNeedRefresh] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!isPwaRuntime || isTelegramMiniApp() || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | undefined;
    let removeUpdateFound: (() => void) | undefined;

    const watch = (reg: ServiceWorkerRegistration) => {
      registrationRef.current = reg;
      setRegistration(reg);

      if (reg.waiting) {
        setNeedRefresh(true);
      }

      const onUpdateFound = () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setNeedRefresh(true);
          }
        });
      };

      reg.addEventListener("updatefound", onUpdateFound);
      removeUpdateFound = () => reg.removeEventListener("updatefound", onUpdateFound);

      pollId = setInterval(() => {
        void reg.update().catch(() => undefined);
      }, UPDATE_POLL_MS);
    };

    void (async () => {
      const existing =
        (await getAppServiceWorkerRegistration()) ?? (await ensureAppServiceWorker());
      if (!existing || cancelled) return;
      watch(existing);
    })();

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      removeUpdateFound?.();
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    requestAppServiceWorkerUpdate(registrationRef.current ?? registration);
    setNeedRefresh(false);
  }, [registration]);

  return { needRefresh, applyUpdate };
}
