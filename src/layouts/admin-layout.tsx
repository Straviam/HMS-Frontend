import { useState } from "react";
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



// This is the react boundary component handled layout-wise to capture errors thrown in loaders
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { IconServerOff, IconRefresh, IconAlertTriangle, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // Set default values
  let errorTitle = "Admin System Error";
  let errorMessage = "An unexpected error occurred.";
  let statusText = "Application Exception";
  let isNetworkError = false;

  // This catches the exact `throw new Response()` from your loader!
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data || error.statusText || "No additional details provided.";
    statusText = `Response Status: ${error.status} ${error.statusText || ""}`;

    if (error.status === 500) {
      errorTitle = "Server Connection Lost";
      isNetworkError = true;
    } else if (error.status === 404) {
      errorTitle = "Registry Not Found";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    statusText = "Local Runtime Exception";
  }

  return (
    <div className="h-[80vh] w-full flex items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="max-w-md w-full border-border/80 shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden">
        <div className="h-1.5 w-full bg-destructive" />

        <CardHeader className="text-center space-y-2 pb-4 pt-6">
          <div className="mx-auto bg-destructive/10 w-16 h-16 flex items-center justify-center rounded-2xl mb-2 transition-transform hover:scale-105 duration-200">
            {isNetworkError ? (
              <IconServerOff size={32} className="text-destructive animate-pulse" />
            ) : (
              <IconAlertTriangle size={32} className="text-destructive" />
            )}
          </div>
          <CardTitle className="font-heading text-2xl text-foreground font-bold tracking-tight">
            {errorTitle}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground font-medium px-4">
            {isNetworkError
              ? "The hospital local server (localhost:4040) might be offline or restarting. Please ensure the backend API is running."
              : "We ran into an issue loading this section. If this persists, please check your connection or contact support."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Details Accordion */}
          <div className="border border-border/60 rounded-xl bg-muted/20 overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              <span>{statusText}</span>
              <span className="flex items-center gap-1">
                {showDetails ? "Hide details" : "Show details"}
                {showDetails ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              </span>
            </button>

            {showDetails && (
              <div className="px-4 pb-4 pt-1 border-t border-border/40">
                <pre className="text-[11px] font-mono text-destructive/90 overflow-x-auto whitespace-pre-wrap max-h-32 bg-muted/50 p-2.5 rounded-lg border border-border/30">
                  {errorMessage}
                </pre>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              variant="outline"
              className="w-full sm:w-1/2 rounded-xl h-11 font-medium transition-all"
              onClick={() => navigate(-1)} // Go back to the previous page safely
            >
              Go Back
            </Button>
            <Button
              className="w-full sm:w-1/2 gap-2 rounded-xl h-11 font-medium shadow-md transition-all"
              onClick={() => window.location.reload()} // Hard reload to re-fire the loader
            >
              <IconRefresh size={18} /> Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
