import { useFormStatus } from "react-dom";
import { Mail, Lock } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

const inputClassName = cn("auth-input h-11 w-full pl-10 shadow-none focus-visible:ring-0");

interface LoginFormFieldsProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export function LoginFormFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: LoginFormFieldsProps) {
  const { pending } = useFormStatus();

  return (
    <>
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
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={pending}
            className={inputClassName}
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
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={pending}
            className={inputClassName}
            required
          />
        </div>
      </div>
    </>
  );
}
