import { useAuthStore } from "@/app/store/authStore";
import { initPushModule } from "@/push/init";
import { ensurePersistentStorage } from "@/pwa/persistentBrowserStorage";
import { initTelegramMiniApp } from "@/telegram/init";

/** Side effects before React mounts. */
export function bootstrapApp(): void {
  void ensurePersistentStorage();
  initTelegramMiniApp();
  useAuthStore.getState().startAuthListener();
  initPushModule();
}
