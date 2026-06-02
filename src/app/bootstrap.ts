import { useAuthStore } from "@/app/store/authStore";
import { initPushModule } from "@/push/init";
import { ensurePersistentStorage } from "@/pwa/persistentBrowserStorage";

/** Side effects before React mounts. */
export function bootstrapApp(): void {
  void ensurePersistentStorage();
  useAuthStore.getState().startAuthListener();
  initPushModule();
}
