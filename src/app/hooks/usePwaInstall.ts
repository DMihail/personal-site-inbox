import { useCallback, useEffect, useState } from "react";
import {
  getPwaInstallPlatform,
  isStandaloneDisplayMode,
  type PwaInstallPlatform,
} from "@/pwa/runtime";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

export function usePwaInstall() {
  const [platform, setPlatform] = useState<PwaInstallPlatform>(() => getPwaInstallPlatform());
  const [installed, setInstalled] = useState(isStandaloneDisplayMode);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  });

  useEffect(() => {
    const sync = () => {
      setInstalled(isStandaloneDisplayMode());
      setPlatform(getPwaInstallPlatform());
    };

    sync();
    window.addEventListener("appinstalled", sync);
    window.matchMedia("(display-mode: standalone)").addEventListener("change", sync);

    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPlatform("android");
    };

    window.addEventListener("beforeinstallprompt", onBip);

    return () => {
      window.removeEventListener("appinstalled", sync);
      window.matchMedia("(display-mode: standalone)").removeEventListener("change", sync);
      window.removeEventListener("beforeinstallprompt", onBip);
    };
  }, []);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setInstalled(isStandaloneDisplayMode());
    }
    return outcome === "accepted";
  }, [deferredPrompt]);

  const visible =
    !installed &&
    !dismissed &&
    platform !== null &&
    (platform === "ios" || deferredPrompt !== null);

  return {
    platform,
    installed,
    visible,
    canNativePrompt: platform === "android" && deferredPrompt !== null,
    dismiss,
    promptInstall,
  };
}
