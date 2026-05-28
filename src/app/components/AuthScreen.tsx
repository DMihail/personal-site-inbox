import { useState } from "react";
import { Mail, Lock, Shield, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SystemMetadata } from "./SystemMetadata";

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onLogin(email, password);
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground dark p-6 relative overflow-hidden">
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
            <h1 className="text-4xl text-text-primary">Communication Hub</h1>
            <p className="text-text-secondary">
              Secure access to your developer inbox
            </p>
            <SystemMetadata>auth.v1</SystemMetadata>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-elevated rounded-2xl p-8 border border-glass-border space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 glass border-glass-border focus:border-cyan transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 glass border-glass-border focus:border-cyan transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan hover:bg-cyan/90 text-background transition-all duration-200 hover:shadow-lg hover:shadow-cyan/20"
              disabled={isLoading}
            >
              {isLoading ? (
                "Authenticating..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Security Features */}
        <div className="glass rounded-xl p-5 border border-glass-border space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-mint" />
            <SystemMetadata>security.features</SystemMetadata>
          </div>
          <ul className="text-sm text-text-secondary space-y-1.5 ml-6">
            <li>• End-to-end encrypted communication</li>
            <li>• Biometric authentication ready</li>
            <li>• Optional 2FA available in settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
