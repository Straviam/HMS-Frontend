import { AppSidebar } from "@/components/side-bar/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import Unauthorized from "@/pages/unauthorized";
import { Outlet } from "react-router";

export default function ReceptionLayout() {
  const { isAuthenticated, user: loggedUser } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const user = loggedUser.data;


  if (user.role !== "RECEPTIONIST") {
    return <Unauthorized />
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole={user.role} />

      <SidebarInset>
        <header className="flex h-16 items-center px-4 border-b bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger />
          <div className="ml-4 h-4 w-[1px] bg-border" />
          <h2 className="ml-4 font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Reception Desk
          </h2>
        </header>

        {/* Main content area where Reception pages will load */}
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}