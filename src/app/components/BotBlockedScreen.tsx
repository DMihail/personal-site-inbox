import { ShieldOff } from "lucide-react";
import { SystemMetadata } from "./SystemMetadata";

export function BotBlockedScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background p-6">
      <div className="glass-elevated max-w-md rounded-xl border border-glass-border p-8 text-center space-y-4">
        <ShieldOff className="h-10 w-10 text-cyan mx-auto" aria-hidden />
        <h1 className="text-xl text-text-primary">Access restricted</h1>
        <p className="text-sm text-text-muted">
          Automated clients and crawlers are not allowed on this application. If you are a human,
          open this site in a standard browser.
        </p>
        <SystemMetadata>security.bot-blocked</SystemMetadata>
      </div>
    </div>
  );
}
