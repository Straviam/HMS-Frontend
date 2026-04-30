import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/login-page";
import AdminLayout from "./layouts/admin-layout";
import AdminDashboard from "./pages/admin-dashboard";
import NotFound from "./pages/not-found";
import { ReceptionLayout } from "./layouts/reception-layout";
import ReceptionDashboard from "./pages/reception-dashboard";
import { RoleRedirector } from "./components/auth/role-redirector";
import Unauthorized from "./pages/unauthorized";
import AdminBedsPage, { AdminBedLoader } from "./pages/admin/admin-bed-page";
import AdminDoctorsPage, { AdminDoctorLoader } from "./pages/admin/admin-doctor-page";
import AdminPatientsPage, { adminPatientLoader } from "./pages/admin/admin-patient-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
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
            element: <AdminPatientsPage />,
            loader: adminPatientLoader
          },
          {
            path: "doctors",
            element: <AdminDoctorsPage />,
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
