import { Link, useLocation, useNavigate } from "react-router";
import { navigationConfig } from "@/lib/nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IconLogout, IconActivity, IconChevronRight } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth-store";

export function AppSidebar({ userRole }: { userRole: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const filteredNav = navigationConfig.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4040/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      }).catch((err) => {
        console.warn("Backend logout request failed:", err);
      });
    } catch (error) {
      console.warn("Error during backend logout:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0 shadow-xl">
      <TooltipProvider delayDuration={0}>
        <SidebarHeader className="h-20 flex items-center justify-center">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            {/* High-contrast logo like login page */}
            <div className="bg-white text-primary p-2 rounded-xl shadow-inner">
              <IconActivity size={24} stroke={2.5} />
            </div>
            <span className="font-heading font-bold text-xl tracking-tighter text-white group-data-[collapsible=icon]:hidden">
              STRAVIAM<span className="opacity-60 font-light text-white">HMS</span>
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarMenu className="gap-1.5">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`
                      h-12 px-4 rounded-xl transition-all duration-200
                      ${isActive
                        ? "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                        : "text-white/60 hover:bg-white/10 hover:text-white"}
                    `}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon size={22} stroke={isActive ? 2 : 1.5} />
                      <span className="font-medium tracking-wide">{item.title}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white group-data-[collapsible=icon]:hidden" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-white/10">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="h-11 px-4 rounded-xl text-white/50 hover:bg-destructive hover:text-white transition-all"
              >
                <IconLogout size={20} stroke={1.5} />
                <span className="font-bold text-[10px] uppercase tracking-[0.2em] group-data-[collapsible=icon]:hidden">
                  Terminate Session
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </TooltipProvider>
    </Sidebar>
  );
}

// TODO: There are some problem related to the style of sidebar like icon size icon color and menu text color and size
