import { Navigate } from "react-router";

export function RoleRedirector() {
  // const user = JSON.parse(localStorage.getItem("user") || "{}");
  const user = { role: "ADMIN" }
  if (user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "RECEPTIONIST") {
    return <Navigate to="/reception" replace />;
  }

  return <Navigate to="/login" replace />;
}
