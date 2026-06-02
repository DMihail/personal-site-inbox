import { useActionState, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthScreen } from "../components/AuthScreen";
import { consumeTelegramStartPath, isTelegramMiniApp } from "@/telegram";
import { RouteLoadingScreen } from "../components/RouteLoadingScreen";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import { getFirebaseAuthErrorMessage } from "@/utils/firebaseAuthErrors";
import { isFirebaseConfigured } from "@/utils/firebaseConfig";

type LoginFormState = { error?: string } | null;

export function LoginPage() {
  useDocumentTitle("Sign in");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formState, formAction] = useActionState(
    async (_previous: LoginFormState, formData: FormData): Promise<LoginFormState> => {
      const nextEmail = String(formData.get("email") ?? "").trim();
      const nextPassword = String(formData.get("password") ?? "");

      setEmail(nextEmail);
      setPassword(nextPassword);

      if (!isFirebaseConfigured()) {
        return {
          error: "Firebase is not configured. Add VITE_FIREBASE_* variables to .env and restart the dev server.",
        };
      }

      if (!nextEmail || !nextPassword) {
        return { error: "Enter your email and password." };
      }

      try {
        await login(nextEmail, nextPassword);
        toast.success("Authentication successful", { description: "Welcome back!" });
        return null;
      } catch (error) {
        const message = getFirebaseAuthErrorMessage(error);
        toast.error("Authentication failed", { description: message });
        return { error: message };
      }
    },
    null,
  );

  useEffect(() => {
    if (!isHydrating && user) {
      const startPath = isTelegramMiniApp() ? consumeTelegramStartPath() : null;
      navigate(startPath ?? "/inbox", { replace: true });
    }
  }, [user, isHydrating, navigate]);

  if (isHydrating) {
    return <RouteLoadingScreen />;
  }

  return (
    <AuthScreen
      formAction={formAction}
      errorMessage={formState?.error}
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
    />
  );
}
