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
  if (!loggedUser) {
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



// This is he react boundry component i have decided to make it layout wise this actually handle the response which we are throughing in loader 
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { IconServerOff, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Set default values
  let errorTitle = "Admin System Error";
  let errorMessage = "An unexpected error occurred.";

  // This catches the exact `throw new Response()` from your loader!
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data;

    if (error.status === 500) {
      errorTitle = "Server Connection Lost";
    } else if (error.status === 404) {
      errorTitle = "Registry Not Found";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="h-[80vh] w-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-destructive/20 shadow-lg">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto bg-destructive/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <IconServerOff size={32} className="text-destructive" />
          </div>
          <CardTitle className="font-heading text-2xl text-foreground">
            {errorTitle}
          </CardTitle>
          <CardDescription className="text-sm font-mono text-muted-foreground">
            {errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="bg-muted/30 p-3 rounded-md text-xs text-muted-foreground border border-border/50 text-center">
            The hospital local server (localhost:4040) might be offline or restarting. Please ensure the backend API is running.
          </div>

          <div className="flex gap-3 mt-4 flex-col,">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)} // Go back to the previous page safely
            >
              Go Back
            </Button>
            <Button
              className="w-full gap-2"
              onClick={() => window.location.reload()} // Hard reload to re-fire the loader
            >
              <IconRefresh size={16} /> Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
