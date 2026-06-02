import { afterEach, describe, expect, it } from "vitest";
import {
  getTelegramWebApp,
  isTelegramMiniApp,
  resetTelegramDetectionForTests,
} from "@/telegram/detect";

describe("isTelegramMiniApp", () => {
  afterEach(() => {
    resetTelegramDetectionForTests();
    delete window.Telegram;
  });

  it("returns false without Telegram WebApp", () => {
    expect(isTelegramMiniApp()).toBe(false);
    expect(getTelegramWebApp()).toBeNull();
  });

  it("returns false when WebApp stub lacks ready()", () => {
    window.Telegram = {
      WebApp: {
        version: "7.2",
        platform: "ios",
        initData: "",
        initDataUnsafe: {},
        themeParams: {},
        viewportHeight: 600,
        viewportStableHeight: 600,
        isExpanded: true,
        close: () => undefined,
        setHeaderColor: () => undefined,
        setBackgroundColor: () => undefined,
        BackButton: {
          isVisible: false,
          show: () => undefined,
          hide: () => undefined,
          onClick: () => undefined,
          offClick: () => undefined,
        },
        onEvent: () => undefined,
        offEvent: () => undefined,
      } as unknown as import("@/telegram/types").TelegramWebApp,
    };
    resetTelegramDetectionForTests();
    expect(isTelegramMiniApp()).toBe(false);
  });

  it("returns true when WebApp.version is present", () => {
    window.Telegram = {
      WebApp: {
        version: "7.2",
        platform: "ios",
        initData: "x",
        initDataUnsafe: {},
        themeParams: {},
        viewportHeight: 600,
        viewportStableHeight: 600,
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
    expect(isTelegramMiniApp()).toBe(true);
    expect(getTelegramWebApp()?.platform).toBe("ios");
  });
});
