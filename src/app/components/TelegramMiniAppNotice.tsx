import { MessageCircle } from "lucide-react";

export function TelegramMiniAppNotice() {
  return (
    <div
      role="region"
      aria-labelledby="telegram-mini-app-title"
      className="glass-elevated rounded-xl border border-cyan/25 bg-cyan/5 p-4"
    >
      <div className="flex gap-3">
        <div className="icon-well icon-well-md shrink-0">
          <MessageCircle className="h-4 w-4 text-cyan" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <p id="telegram-mini-app-title" className="text-body-sm font-medium text-text-primary">
            Telegram Mini App
          </p>
          <p className="text-meta text-text-muted">
            You are using the inbox inside Telegram. Browser push (FCM) is not available here — new
            contact alerts still arrive via Telegram from the portfolio site. For background push in
            the inbox app, open the installed PWA from your home screen.
          </p>
        </div>
      </div>
    </div>
  );
}
