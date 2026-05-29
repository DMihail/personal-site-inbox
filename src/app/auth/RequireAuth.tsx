import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RouteLoadingScreen } from "../components/RouteLoadingScreen";
import { useAuthStore } from "../store/authStore";

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const location = useLocation();

  if (isHydrating) {
    return <RouteLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
