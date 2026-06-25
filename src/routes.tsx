import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/login-page";
import AdminLayout, { AdminErrorBoundary } from "./layouts/admin-layout";
import AdminDashboard, { adminDashboardLoader } from "./pages/admin-dashboard";
import NotFound from "./pages/not-found";
import  ReceptionLayout  from "./layouts/reception-layout";
import ReceptionDashboard from "./pages/reception-dashboard";
import { RoleRedirector } from "./components/auth/role-redirector";
import Unauthorized from "./pages/unauthorized";
import AdminBedsPage, { AdminBedLoader } from "./pages/admin/admin-bed-page";
import AdminDoctorsPage, { AdminDoctorLoader } from "./pages/admin/admin-doctor-page";
import AdminPatientsPage, { adminPatientLoader } from "./pages/admin/admin-patient-page";
import AdminTransactionsPage, { adminTransactionLoader } from "./pages/admin/admin-transaction-page";
import AdminInvoicesPage, { adminInvoiceLoader } from "./pages/admin/admin-billing-page";
import AdminFacilityPage, { adminFacilityLoader } from "./pages/admin/admin-facility-page";
import PatientRegistry from "./pages/reception/reception-search-page";
import RoomBooking from "./pages/reception/reception-room-booking";

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
        errorElement: <AdminErrorBoundary />,
        children: [
          {
            index: true, element: <AdminDashboard />,
            loader: adminDashboardLoader
          },
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
          },
          {
            path: "transactions",
            element: <AdminTransactionsPage />,
            loader: adminTransactionLoader
          },
          {
            path: "invoices",
            element: <AdminInvoicesPage />,
            loader: adminInvoiceLoader
          },
          {
            path: "facility",
            element: <AdminFacilityPage />,
            loader: adminFacilityLoader
          }
        ]
      },
      {
        path: "receptionist",
        element: <ReceptionLayout />,
        children: [
          { index: true, element: <PatientRegistry /> },
          {
            path: "bookings",
            element: <RoomBooking />,
            loader: AdminBedLoader,
          },
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
