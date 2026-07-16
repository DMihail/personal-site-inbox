import { useId, useState } from "react";
import { Bell, CheckCircle2, Database, Wifi, LogOut, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPortfolioApiLabel, isPortfolioApiConfigured } from "@/utils/reply-api";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import { useRecheckPushPermission } from "../hooks/useRecheckPushPermission";
import { beginEnablePushFlow } from "../notifications/beginEnablePushFlow";
import { NotificationPermissionHelp } from "./NotificationPermissionHelp";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { AppVersion } from "./AppVersion";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { isStandaloneDisplayMode } from "@/pwa/runtime";
import { isTelegramMiniApp } from "@/telegram/detect";
import { TelegramMiniAppNotice } from "./TelegramMiniAppNotice";

interface SettingsViewProps {
  isOnline: boolean;
  onLogout: () => void | Promise<void>;
  pushEnabled: boolean;
  pushRegistering: boolean;
  pushError: string | null;
  isSendingTest?: boolean;
  onPushEnabledChange: (enabled: boolean) => void;
  onTestPush?: () => void;
}

export function SettingsView({
  isOnline,
  onLogout,
  pushEnabled,
  pushRegistering,
  pushError,
  isSendingTest = false,
  onPushEnabledChange,
  onTestPush,
}: SettingsViewProps) {
  const { permission, refresh } = useNotificationPermission();
  const recheckPermission = useRecheckPushPermission(refresh);
  const isDenied = permission === "denied";
  const needsPermissionPrompt = permission === "default" || permission === "unsupported";
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pushSwitchId = useId();
  const inTelegram = isTelegramMiniApp();

  const handleSignOut = () => {
    setIsSigningOut(true);
    void Promise.resolve(onLogout()).finally(() => {
      setIsSigningOut(false);
    });
  };

  const handleAllowNotifications = () => {
    const result = beginEnablePushFlow(() => onPushEnabledChange(true));

    if (result.status === "unsupported") {
      toast.error("Could not enable notifications", { description: result.message });
      return;
    }

    if (result.status === "blocked") {
      return;
    }

    if (result.status === "enabled") {
      refresh();
      return;
    }

    void result.promise.then((ok) => {
      if (ok) refresh();
    });
  };

  const handlePushSwitchChange = (checked: boolean) => {
    if (!checked) {
      onPushEnabledChange(false);
      return;
    }
    handleAllowNotifications();
  };

  return (
    <div className="h-full min-h-0 space-y-6 overflow-y-auto overscroll-y-contain p-4 md:p-6">
      <header className="space-y-1">
        <h2 className="text-3xl text-text-primary">Settings</h2>
        <p className="text-meta text-text-muted">Notifications, connection, and account</p>
      </header>

      <Separator className="bg-glass-border" />

      <div className="space-y-6">
        {inTelegram ? <TelegramMiniAppNotice /> : <PwaInstallPrompt />}

        {!inTelegram ? (
        <section className="space-y-3" aria-labelledby="settings-notifications">
          <h3 id="settings-notifications" className="text-body text-text-primary">
            Notifications
          </h3>
          <div className="glass-elevated space-y-4 rounded-xl border border-glass-border p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan" aria-hidden="true" />
                  <Label htmlFor={pushSwitchId} className="text-body text-text-primary">
                    Push notifications
                  </Label>
                </div>
                <p className="text-meta text-text-muted">Browser alerts for new messages</p>
                {isDenied ? null : pushError ? (
                  <p className="text-meta max-w-xs text-error">{pushError}</p>
                ) : pushRegistering ? (
                  <p className="text-meta text-text-muted">Enabling push… usually under 15 seconds.</p>
                ) : pushEnabled ? (
                  <p className="text-meta text-mint">
                    Enabled — alerts for new messages in this browser.
                  </p>
                ) : (
                  <p className="text-meta text-text-muted">
                    Tap Allow below — the browser will ask for permission. FCM is needed when the app is closed.
                  </p>
                )}
              </div>
              <Switch
                id={pushSwitchId}
                checked={pushEnabled && !isDenied}
                disabled={pushRegistering || isDenied || needsPermissionPrompt}
                onCheckedChange={handlePushSwitchChange}
                aria-label="Push notifications enabled"
              />
            </div>

            {needsPermissionPrompt && !isDenied ? (
              <Button
                type="button"
                size="sm"
                className="w-full bg-cyan text-background hover:bg-cyan/90"
                disabled={pushRegistering}
                onClick={handleAllowNotifications}
              >
                Allow notifications
              </Button>
            ) : null}

            {isDenied ? (
              <NotificationPermissionHelp onRecheck={recheckPermission} />
            ) : null}

            {pushEnabled && onTestPush ? (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="glass ui-hover-glass w-full border-glass-border"
                  disabled={isSendingTest}
                  aria-busy={isSendingTest}
                  onClick={onTestPush}
                >
                  {isSendingTest ? "Testing…" : "Send test notification"}
                </Button>
                <p className="text-meta text-text-muted">
                  Refreshes FCM token, shows a local alert, and POSTs to{" "}
                  <code className="text-text-secondary">/api/inbox/test-push</code> when{" "}
                  <code className="text-text-secondary">VITE_PORTFOLIO_API_URL</code> is set.
                </p>
              </div>
            ) : null}
          </div>
        </section>
        ) : null}

        <section className="space-y-3" aria-labelledby="settings-reply-api">
          <h3 id="settings-reply-api" className="text-body text-text-primary">
            Email replies
          </h3>
          <div className="glass-elevated space-y-2 rounded-xl border border-glass-border p-5">
            <div className="flex items-center gap-2">
              <Mail
                className={`h-4 w-4 ${isPortfolioApiConfigured() ? "text-mint" : "text-error"}`}
                aria-hidden="true"
              />
              <span className="text-body text-text-primary">Reply API</span>
            </div>
            <p className="text-meta text-text-muted">Sends replies through the configured backend</p>
            <p
              className={`text-body-sm ${isPortfolioApiConfigured() ? "text-mint" : "text-error"}`}
            >
              {isPortfolioApiConfigured()
                ? `Connected — ${getPortfolioApiLabel()}`
                : "Not configured — set VITE_PORTFOLIO_API_URL"}
            </p>
            <p className="text-meta text-text-muted">
              Replies are delivered by email from the backend (SMTP or provider).
            </p>
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="settings-status">
          <h3 id="settings-status" className="text-body text-text-primary">
            Service status
          </h3>
          <div className="glass-elevated space-y-4 rounded-xl border border-glass-border p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wifi
                  className={`h-4 w-4 ${isOnline ? "text-mint" : "text-error"}`}
                  aria-hidden="true"
                />
                <span className="text-body text-text-primary">Connection</span>
              </div>
              <p className={`text-body-sm ${isOnline ? "text-mint" : "text-error"}`}>
                {isOnline ? "Connected" : "Disconnected"}
              </p>
            </div>

            <Separator className="bg-glass-border" />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan" aria-hidden="true" />
                <span className="text-body text-text-primary">Live updates</span>
              </div>
              <p className="text-meta text-text-muted">Messages refresh automatically while you are signed in</p>
              <p className="text-body-sm text-cyan">Active</p>
            </div>

            <Separator className="bg-glass-border" />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${isStandaloneDisplayMode() ? "text-mint" : "text-text-muted"}`}
                  aria-hidden="true"
                />
                <span className="text-body text-text-primary">Installed app</span>
              </div>
              <p className="text-meta text-text-muted">
                {inTelegram
                  ? "Opened from Telegram — install the PWA for background push"
                  : isStandaloneDisplayMode()
                    ? "Running from your home screen"
                    : "Add to Home Screen for background push (especially on iOS)"}
              </p>
              <p
                className={`text-body-sm ${isStandaloneDisplayMode() && !inTelegram ? "text-mint" : inTelegram ? "text-cyan" : "text-text-muted"}`}
              >
                {inTelegram ? "Telegram Mini App" : isStandaloneDisplayMode() ? "Installed" : "Browser tab"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="settings-account">
          <h3 id="settings-account" className="text-body text-text-primary">
            Account
          </h3>
          <div className="glass-elevated rounded-xl border border-glass-border p-5">
            <Button
              type="button"
              onClick={handleSignOut}
              variant="outline"
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              className="btn-sign-out h-11 w-full shadow-none"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing out…
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </>
              )}
            </Button>
          </div>
        </section>

        <AppVersion className="pb-2 pt-4" />
      </div>
    </div>
  );
}
