/** Subset of Telegram WebApp API used by the inbox (see https://core.telegram.org/bots/webapps). */
export interface TelegramWebApp {
  version: string;
  platform: string;
  initData: string;
  initDataUnsafe: {
    start_param?: string;
    user?: {
      id: number;
      first_name?: string;
      username?: string;
    };
  };
  themeParams: Record<string, string | undefined>;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  onEvent: (event: string, handler: () => void) => void;
  offEvent: (event: string, handler: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
