import { Bell, CheckCircle2, Database, Wifi, Shield, Lock, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { SystemMetadata } from "./SystemMetadata";
import { Separator } from "./ui/separator";

interface SettingsViewProps {
  isOnline: boolean;
  onLogout: () => void;
}

export function SettingsView({ isOnline, onLogout }: SettingsViewProps) {
  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl text-text-primary">Settings</h1>
        <SystemMetadata>system.config.v1</SystemMetadata>
      </div>

      <Separator className="bg-glass-border" />

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-text-primary">Notifications</h3>
          <div className="glass-elevated rounded-xl p-5 border border-glass-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan" />
                  <span className="text-text-primary">Push Notifications</span>
                </div>
                <SystemMetadata>notifications.push</SystemMetadata>
              </div>
              <Switch />
            </div>

            <Separator className="bg-glass-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-text-primary">Email Alerts</span>
                <SystemMetadata>notifications.email</SystemMetadata>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-glass-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-text-primary">Desktop Notifications</span>
                <SystemMetadata>notifications.desktop</SystemMetadata>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-text-primary">System Status</h3>
          <div className="glass-elevated rounded-xl p-5 border border-glass-border space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wifi className={`h-4 w-4 ${isOnline ? "text-mint" : "text-error"}`} />
                <span className="text-text-primary">Connection Status</span>
              </div>
              <SystemMetadata>firestore.connection</SystemMetadata>
              <p className={`text-sm ${isOnline ? "text-mint" : "text-error"}`}>
                {isOnline ? "Connected" : "Disconnected"}
              </p>
            </div>

            <Separator className="bg-glass-border" />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan" />
                <span className="text-text-primary">Sync Status</span>
              </div>
              <SystemMetadata>sync.realtime</SystemMetadata>
              <p className="text-sm text-cyan">Active</p>
            </div>

            <Separator className="bg-glass-border" />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-mint" />
                <span className="text-text-primary">PWA Status</span>
              </div>
              <SystemMetadata>pwa.installed</SystemMetadata>
              <p className="text-sm text-mint">Installed</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-text-primary">Security</h3>
          <div className="glass-elevated rounded-xl p-5 border border-glass-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-mint" />
                  <span className="text-text-primary">Two-Factor Authentication</span>
                </div>
                <SystemMetadata>security.2fa</SystemMetadata>
              </div>
              <Switch />
            </div>

            <Separator className="bg-glass-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan" />
                  <span className="text-text-primary">Biometric Login</span>
                </div>
                <SystemMetadata>security.biometric</SystemMetadata>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-text-primary">Application Info</h3>
          <div className="glass-elevated rounded-xl p-5 border border-glass-border space-y-3">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Version</span>
                <SystemMetadata>v1.0.0</SystemMetadata>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Environment</span>
                <SystemMetadata>production</SystemMetadata>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Cache Status</span>
                <SystemMetadata className="text-mint">active</SystemMetadata>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Last Sync</span>
                <SystemMetadata>2 minutes ago</SystemMetadata>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-text-primary">Account</h3>
          <div className="glass-elevated rounded-xl p-5 border border-glass-border space-y-4">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full glass border-error/30 text-error hover:bg-error/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
