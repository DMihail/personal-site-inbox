import { Bell, CheckCircle2, Database, Wifi, LogOut, Mail } from "lucide-react";
import { getPortfolioApiLabel, isPortfolioApiConfigured } from "@/utils/reply-api";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { SystemMetadata } from "./SystemMetadata";
import { Separator } from "./ui/separator";

interface SettingsViewProps {
  isOnline: boolean;
  onLogout: () => void;
  pushEnabled: boolean;
  pushRegistering: boolean;
  pushError: string | null;
  onPushEnabledChange: (enabled: boolean) => void;
  onTestPush?: () => void;
}

export function SettingsView({
  isOnline,
  onLogout,
  pushEnabled,
  pushRegistering,
  pushError,
  onPushEnabledChange,
  onTestPush,
}: SettingsViewProps) {
  return (
    <div className="h-full min-h-0 space-y-6 overflow-y-auto overscroll-y-contain p-4 md:p-6">
      <header className="space-y-1">
        <h2 className="text-3xl text-text-primary">Settings</h2>
        <SystemMetadata>system.config.v1</SystemMetadata>
      </header>

      <Separator className="bg-glass-border" />

      <div className="space-y-6">
        <section className="space-y-3" aria-labelledby="settings-notifications">
          <h3 id="settings-notifications" className="text-body text-text-primary">
            Notifications
          </h3>
          <div className="glass-elevated space-y-4 rounded-xl border border-glass-border p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan" aria-hidden="true" />
                  <span className="text-body text-text-primary">Push notifications</span>
                </div>
                <SystemMetadata>notifications.push.fcm</SystemMetadata>
                {pushError ? (
                  <p className="text-meta max-w-xs text-error">{pushError}</p>
                ) : pushEnabled ? (
                  <p className="text-meta text-mint">
                    Enabled — alerts for new messages in this browser.
                  </p>
                ) : (
                  <p className="text-meta text-text-muted">
                    Enable via the bell in the header. Requires FCM when the app is closed.
                  </p>
                )}
              </div>
              <Switch
                checked={pushEnabled}
                disabled={pushRegistering}
                onCheckedChange={onPushEnabledChange}
                aria-label="Push notifications"
              />
            </div>

            {pushEnabled && onTestPush ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full glass border-glass-border"
                onClick={onTestPush}
              >
                Send test notification
              </Button>
            ) : null}
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="settings-reply-api">
          <h3 id="settings-reply-api" className="text-body text-text-primary">
            Reply API
          </h3>
          <div className="glass-elevated space-y-2 rounded-xl border border-glass-border p-5">
            <div className="flex items-center gap-2">
              <Mail
                className={`h-4 w-4 ${isPortfolioApiConfigured() ? "text-mint" : "text-error"}`}
                aria-hidden="true"
              />
              <span className="text-body text-text-primary">Portfolio backend</span>
            </div>
            <SystemMetadata>engineering-profile /api/inbox/reply</SystemMetadata>
            <p
              className={`text-body-sm ${isPortfolioApiConfigured() ? "text-mint" : "text-error"}`}
            >
              {isPortfolioApiConfigured()
                ? `Connected — ${getPortfolioApiLabel()}`
                : "Not configured — set VITE_PORTFOLIO_API_URL"}
            </p>
            <p className="text-meta text-text-muted">
              Replies are sent by email from the portfolio server (SMTP + Firebase Admin).
            </p>
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="settings-status">
          <h3 id="settings-status" className="text-body text-text-primary">
            System status
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
              <SystemMetadata>firestore.connection</SystemMetadata>
              <p className={`text-body-sm ${isOnline ? "text-mint" : "text-error"}`}>
                {isOnline ? "Connected" : "Disconnected"}
              </p>
            </div>

            <Separator className="bg-glass-border" />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan" aria-hidden="true" />
                <span className="text-body text-text-primary">Realtime sync</span>
              </div>
              <SystemMetadata>sync.realtime</SystemMetadata>
              <p className="text-body-sm text-cyan">Active</p>
            </div>

            <Separator className="bg-glass-border" />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-mint" aria-hidden="true" />
                <span className="text-body text-text-primary">PWA</span>
              </div>
              <SystemMetadata>pwa.installed</SystemMetadata>
              <p className="text-body-sm text-mint">Installed</p>
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
              onClick={onLogout}
              variant="outline"
              className="w-full glass border-error/30 text-error hover:bg-error/10"
            >
              <LogOut className="me-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
