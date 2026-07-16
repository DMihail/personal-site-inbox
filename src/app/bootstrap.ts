import { useAuthStore } from "@/app/store/authStore";
import { initPushModule } from "@/push/init";
import { ensurePersistentStorage } from "@/pwa/persistentBrowserStorage";
import { initTelegramMiniApp } from "@/telegram/init";

let stopAuthListener: (() => void) | null = null;

/** Side effects before React mounts. */
export function bootstrapApp(): void {
  void ensurePersistentStorage();
  initTelegramMiniApp();
  stopAuthListener?.();
  stopAuthListener = useAuthStore.getState().startAuthListener();
  initPushModule();
}
