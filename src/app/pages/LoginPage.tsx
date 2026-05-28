import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthScreen } from "../components/AuthScreen";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);
        toast.success("Authentication successful", { description: "Welcome back!" });
        navigate("/inbox", { replace: true });
      } catch {
        toast.error("Authentication failed");
      }
    },
    [login, navigate],
  );

  return <AuthScreen onLogin={handleLogin} />;
}

