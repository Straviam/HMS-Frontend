import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconHome, IconStethoscope } from "@tabler/icons-react";

const traceId = Math.random().toString(36).substring(2, 11).toUpperCase();

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      {/* Visual Indicator */}
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 blur-3xl opacity-20 bg-primary rounded-full" />
        <div className="relative bg-card border-2 border-dashed border-primary/30 p-8 rounded-full">
          <IconStethoscope className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
          CODE: 404
        </div>
      </div>

      {/* Messaging */}
      <h1 className="text-4xl font-heading font-bold tracking-tighter sm:text-5xl mb-2">
        Not Found
      </h1>
      <p className="max-w-[450px] text-muted-foreground text-lg mb-8 leading-relaxed">
        The record or department you are looking for has been moved,
        discharged, or never existed in our database.
      </p>

      {/* Action Grid */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2 border-primary/20 hover:bg-primary/5"
        >
          <IconArrowLeft className="h-4 w-4" />
          Go Back
        </Button>

        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
          <Link to="/">
            <IconHome className="h-4 w-4" />
            Return to Reception
          </Link>
        </Button>
      </div>

      {/* System Footer Info */}
      <div className="mt-16 pt-8 border-t border-border w-full max-w-xs">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <search className="h-3 w-3" /> Trace ID: {traceId}
          </span>
        </div>
      </div>
    </div>
  );
}
