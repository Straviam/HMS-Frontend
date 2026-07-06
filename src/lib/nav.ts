import {
  IconLayoutDashboard,
  IconUsers,
  IconUserPlus,
  IconStethoscope,
  IconBed,
  IconClipboardList,
  IconReceipt2,
  IconReportMoney,
  IconSettings,
  IconActivityHeartbeat,
  IconBuildingHospital,
  IconNewSection,
  IconReservedLine,
  IconUsersGroup
} from "@tabler/icons-react";


export interface NavItem {
  title: string;
  href: string;
  roles: string[];
  icon: React.ComponentType<any>;
}

export const navigationConfig: readonly NavItem[] = [
  // -----------------------------------------
  // 1. DASHBOARDS (Everyone gets one, but the layout will differ)
  // -----------------------------------------
  {
    title: "Dashboard",
    href: "/admin",
    icon: IconLayoutDashboard,
    roles: ["ADMIN", "DOCTOR", "OPD_OPERATOR", "MANAGMENT", "ACCOUNTANT"],
  },
  // -----------------------------------------
  // RECEPTIONIST
  // ------------------------------------------
  {
    title: "Reception Desk",
    href: "/receptionist",
    icon: IconNewSection,
    roles: ["RECEPTIONIST"],
  },
  {
    title: "Booking Desk",
    href: "/receptionist/bookings",
    icon: IconReservedLine,
    roles: ["RECEPTIONIST"],
  },

  // -----------------------------------------
  // 2. FRONT DESK / RECEPTIONIST OPS
  // Matches: patients, roomBooking, doctorTimings
  // -----------------------------------------
  {
    title: "Patient Registry",
    href: "/admin/patients",
    icon: IconUsers,
    roles: ["ADMIN", "MANAGMENT"],
  },
  {
    title: "Admissions & Beds",
    href: "/admin/rooms", // Manages roomStatusEnum ("AVAILABLE", "OCCUPIED")
    icon: IconBed,
    roles: ["ADMIN", "MANAGMENT"],
  },
  // {
  //   title: "Point of Sale", // Where they create transactions for Services/Doctors
  //   href: "/pos",
  //   icon: IconReceipt2,
  //   roles: ["ADMIN", "RECEPTIONIST"],
  // },

  // -----------------------------------------
  // 3. DOCTOR OPS
  // Matches: doctors, doctorTimings, patients
  // -----------------------------------------
  {
    title: "My Consultations",
    href: "/consultations", // Queue based on doctor_transactions & max_tokens
    icon: IconStethoscope,
    roles: ["DOCTOR"],
  },
  {
    title: "Doctors Registry",
    href: "/admin/doctors",
    icon: IconStethoscope,
    roles: ["ADMIN"],
  },

  // -----------------------------------------
  // 4. OPD / LAB OPS
  // Matches: serviceTypes (where isQueuingEnabled = true)
  // -----------------------------------------
  // {
  //   title: "Service Queue",
  //   href: "/opd/queue", // For Lab Techs / X-Ray operators to clear the queue
  //   icon: IconActivityHeartbeat,
  //   roles: ["ADMIN", "OPD_OPERATOR", "MANAGMENT"],
  // },

  // -----------------------------------------
  // 5. FINANCE & ACCOUNTING
  // Matches: invoices, payments, transactions
  // -----------------------------------------
  {
    title: "Transaction History",
    href: "/admin/transactions",
    icon: IconReportMoney,
    roles: ["ADMIN", "ACCOUNTANT", "MANAGMENT"],
  },


  {
    title: "Billing & Invoices",
    href: "/admin/invoices",
    icon: IconClipboardList,
    roles: ["ADMIN", "ACCOUNTANT", "MANAGMENT"],
  },

  // -----------------------------------------
  // 6. SYSTEM ADMINISTRATION
  // Matches: users, service_types, services, rooms
  // -----------------------------------------
  // {
  //   title: "Staff Management",
  //   href: "/admin/staff", // Manages users table
  //   icon: IconUsersGroup,
  //   roles: ["ADMIN"],
  // },
  {
    title: "Facility Setup",
    href: "/admin/facility", // manage and create services
    icon: IconBuildingHospital,
    roles: ["ADMIN"],
  },
  // {
  //   title: "System Configuration",
  //   href: "/admin/settings", // Manages service_types, prices, system defaults
  //   icon: IconSettings,
  //   roles: ["ADMIN"],
  // },

] as const;

// TODO: Set all seprate object for seperate role as url  or href is different
