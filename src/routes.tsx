import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/login-page";
import AdminLayout from "./layouts/admin-layout";
import AdminDashboard from "./pages/admin-dashboard";
import NotFound from "./pages/not-found";
import { ReceptionLayout } from "./layouts/reception-layout";
import ReceptionDashboard from "./pages/reception-dashboard";
import { AuthGuard } from "./components/auth/auth-guard";
import { RoleRedirector } from "./components/auth/role-redirector";
import Unauthorized from "./pages/unauthorized";
import AdminBedsPage, { AdminBedLoader } from "./pages/admin/admin-bed-page";
import { AdminPatientRegistry } from "./pages/admin/admin-patient-registry";
import AdminDoctorsRegistryPage, { AdminDoctorLoader } from "./pages/admin/admin-doctor-registry";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <AuthGuard />, // for all children auth must be check
    children: [
      {
        index: true, element: <RoleRedirector /> // if someone access / we need mehanism to redirect user based on type
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          {
            path: "rooms",
            element: <AdminBedsPage />,
            loader: AdminBedLoader,
          },
          {
            path: "patients",
            element: <AdminPatientRegistry />
          },
          {
            path: "doctors",
            element: <AdminDoctorsRegistryPage />,
            loader: AdminDoctorLoader
          }
        ]
      },
      {
        path: "reception",
        element: <ReceptionLayout />,
        children: [
          { index: true, element: <ReceptionDashboard /> },
        ]
      }
    ]
  },

  {
    path: "*",
    element: <NotFound />
  },
  // just for testing 
  {
    path: "/unauthorized",
    element: <Unauthorized />
  }
]);

// TODO: Refactor import and export
