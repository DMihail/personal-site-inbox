import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { consumeTelegramStartPath, isTelegramMiniApp } from "@/telegram";

/**
 * After sign-in, open the view from BotFather `startapp` / `start_param` (e.g. `unread`).
 */
export function useTelegramStartNavigation(isAuthenticated: boolean): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isTelegramMiniApp()) return;
    const path = consumeTelegramStartPath();
    if (path) {
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, navigate]);
}
