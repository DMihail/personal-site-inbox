import { afterEach, describe, expect, it } from "vitest";
import {
  captureTelegramStartParam,
  consumeTelegramStartPath,
  peekTelegramStartPath,
} from "@/telegram/start-param";
import { resetTelegramDetectionForTests } from "@/telegram/detect";

describe("telegram start_param", () => {
  afterEach(() => {
    sessionStorage.clear();
    resetTelegramDetectionForTests();
    delete window.Telegram;
  });

  it("maps start_param to inbox routes", () => {
    window.Telegram = {
      WebApp: {
        version: "7.0",
        platform: "android",
        initData: "",
        initDataUnsafe: { start_param: "unread" },
        themeParams: {},
        viewportHeight: 800,
        viewportStableHeight: 800,
        isExpanded: true,
        ready: () => undefined,
        expand: () => undefined,
        close: () => {},
        setHeaderColor: () => {},
        setBackgroundColor: () => {},
        BackButton: {
          isVisible: false,
          show: () => {},
          hide: () => {},
          onClick: () => {},
          offClick: () => {},
        },
        onEvent: () => {},
        offEvent: () => {},
      },
    };
    resetTelegramDetectionForTests();
    captureTelegramStartParam();
    expect(peekTelegramStartPath()).toBe("/unread");
    expect(consumeTelegramStartPath()).toBe("/unread");
    expect(peekTelegramStartPath()).toBeNull();
  });
});
