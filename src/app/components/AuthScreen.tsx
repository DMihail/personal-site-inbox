import { type ComponentProps } from "react";
import { Shield, ArrowRight } from "lucide-react";
import { cn } from "./ui/utils";
import { APP_NAME } from "@/utils/app-info";
import { AppVersion } from "./AppVersion";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { FormPendingFieldset, FormSubmitButton } from "./form";
import { LoginFormFields } from "./auth/LoginFormFields";

interface AuthScreenProps {
  /** From `useActionState` — must be passed directly to `<form action>`. */
  formAction: NonNullable<ComponentProps<"form">["action"]>;
  errorMessage?: string | null;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export function AuthScreen({
  formAction,
  errorMessage,
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: AuthScreenProps) {
  return (
    <main className="relative flex h-dvh w-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-elevated border border-glass-border">
            <Shield className="h-10 w-10 text-cyan" />
          </div>
          <div className="space-y-2">
            <h1 className="text-display text-text-primary">{APP_NAME}</h1>
            <p className="text-body text-text-secondary">
              Sign in with your inbox email and password
            </p>
          </div>
        </div>

        <PwaInstallPrompt />

        <div className="glass-elevated motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 rounded-2xl border border-glass-border space-y-6 p-8">
          <form action={formAction} className="space-y-5" autoComplete="on">
            <FormPendingFieldset className="space-y-5">
              <LoginFormFields
                email={email}
                password={password}
                onEmailChange={onEmailChange}
                onPasswordChange={onPasswordChange}
              />
            </FormPendingFieldset>

            {errorMessage ? (
              <p className="text-body-sm text-error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <FormSubmitButton
              pendingLabel="Signing in…"
              className={cn(
                "btn-auth-submit ui-hover-cyan h-11 w-full border-0 bg-cyan text-background",
                "focus-visible:ring-cyan/40",
              )}
            >
              Sign In
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </FormSubmitButton>
          </form>
        </div>

        <section
          className="glass space-y-3 rounded-xl border border-glass-border p-5"
          aria-labelledby="auth-security-heading"
        >
          <h2
            id="auth-security-heading"
            className="flex items-center gap-2 text-body-sm font-medium text-text-primary"
          >
            <Shield className="h-4 w-4 text-mint" aria-hidden="true" />
            Security
          </h2>
          <ul className="list-disc space-y-1.5 ps-5 text-body-sm text-text-secondary">
            <li>Sign in with email and password</li>
            <li>Messages load only after you sign in</li>
            <li>Not intended for public indexing</li>
          </ul>
        </section>

        <AppVersion />
      </div>
    </main>
  );
}
