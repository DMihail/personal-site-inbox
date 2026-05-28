import { useRef, useState } from "react";
import { Mail, Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { isHoneypotTripped } from "../security/automatedClient";
import { cn } from "./ui/utils";
import { AppVersion } from "./AppVersion";

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHoneypotTripped(honeypotRef.current?.value)) {
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex h-dvh w-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground dark">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-elevated border border-glass-border">
            <Shield className="h-10 w-10 text-cyan" />
          </div>
          <div className="space-y-2">
            <h1 className="text-display text-text-primary">Communication Hub</h1>
            <p className="text-body text-text-secondary">
              Secure access to your developer inbox
            </p>
            <p className="text-meta text-text-muted">Secure sign-in</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-elevated motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 rounded-2xl border border-glass-border space-y-6 p-8">
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <input
              ref={honeypotRef}
              type="text"
              name="_gotcha"
              tabIndex={-1}
              defaultValue=""
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              className="absolute left-[-9999px] w-px h-px opacity-0 pointer-events-none"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input pl-10 shadow-none focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input pl-10 shadow-none focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className={cn(
                "btn-auth-submit h-11 w-full border-0 bg-cyan text-background",
                "hover:bg-cyan/90 hover:shadow-lg hover:shadow-cyan/20",
                "focus-visible:ring-cyan/40",
              )}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Security Features */}
        <div className="glass rounded-xl p-5 border border-glass-border space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-mint" aria-hidden="true" />
            <span className="text-body-sm font-medium text-text-primary">Security</span>
          </div>
          <ul className="text-body-sm text-text-secondary space-y-1.5 ms-6">
            <li>• Sign in with email and password</li>
            <li>• Messages load only after you sign in</li>
            <li>• Private — not listed in search engines</li>
          </ul>
        </div>

        <AppVersion />
      </div>
    </main>
  );
}
