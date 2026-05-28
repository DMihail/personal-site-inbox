import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthScreen } from "../components/AuthScreen";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = useCallback(
    (email: string, password: string) => {
      login(email, password);
      toast.success("Authentication successful", { description: "Welcome back!" });
      navigate("/inbox", { replace: true });
    },
    [login, navigate],
  );

  return <AuthScreen onLogin={handleLogin} />;
}

