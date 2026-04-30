import { AppSidebar } from "@/components/side-bar/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import Unauthorized from "@/pages/unauthorized";
import { Outlet } from "react-router";

export default function AdminLayout() {
  const { isAuthenticated, user: loggedUser } = useAuth();

  // just null work cuz useAuth handle navigation internal
  if (!isAuthenticated) {
    return null;
  }

  const user = loggedUser.data;
  if (user.role != "ADMIN") {
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
            Administrative Portal
          </h2>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
