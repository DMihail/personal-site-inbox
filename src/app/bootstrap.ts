import { useAuthStore } from "@/app/store/authStore";
import { ensurePersistentStorage } from "@/pwa/persistentBrowserStorage";
import { ensureAppServiceWorker } from "@/pwa/appServiceWorker";
import { isPwaRuntime } from "@/pwa/config";
import { initTelegramMiniApp } from "@/telegram/init";
import { isTelegramMiniApp } from "@/telegram/detect";

let stopAuthListener: (() => void) | null = null;

/** Side effects before React mounts. */
export function bootstrapApp(): void {
  void ensurePersistentStorage();
  initTelegramMiniApp();

  if (isPwaRuntime && !isTelegramMiniApp() && "serviceWorker" in navigator) {
    void ensureAppServiceWorker();
  }

  stopAuthListener?.();
  stopAuthListener = useAuthStore.getState().startAuthListener();
}
