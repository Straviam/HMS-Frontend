import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router";

export function RoleRedirector() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.data.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user.data.role === "RECEPTIONIST") {
    return <Navigate to="/receptionist" replace />;
  }

  return <Navigate to="/login" replace />;
}
