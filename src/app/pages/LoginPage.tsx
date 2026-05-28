import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthScreen } from "../components/AuthScreen";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    if (!isHydrating && user) {
      navigate("/inbox", { replace: true });
    }
  }, [user, isHydrating, navigate]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);
        toast.success("Authentication successful", { description: "Welcome back!" });
        navigate("/inbox", { replace: true });
      } catch {
        const message = useAuthStore.getState().authError;
        toast.error("Authentication failed", {
          description: message ?? "Check email, password, and Firebase Auth settings",
        });
      }
    },
    [login, navigate],
  );

  return <AuthScreen onLogin={handleLogin} />;
}

