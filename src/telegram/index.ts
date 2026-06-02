export { isTelegramMiniApp, getTelegramWebApp, resetTelegramDetectionForTests } from "@/telegram/detect";
export { initTelegramMiniApp } from "@/telegram/init";
export {
  captureTelegramStartParam,
  consumeTelegramStartPath,
  peekTelegramStartPath,
} from "@/telegram/start-param";
export { useTelegramViewport, useTelegramBackButton, useIsTelegramMiniApp } from "@/telegram/hooks";
