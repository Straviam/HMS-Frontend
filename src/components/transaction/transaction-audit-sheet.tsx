import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconFileDescription,
  IconUser,
  IconClock,
  IconLink,
  IconActivity,
  IconStethoscope,
  IconBed,
  IconAlertTriangle,
  IconLoader2
} from "@tabler/icons-react";
import { getApiOptions, API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

interface AuditTransaction {
  id: string;
  txnNo: string;
  type: "SERVICE" | "DOCTOR" | "ROOM";
  amount: number;
  createdAt: string;
  operatorName: string;
  patientName: string;
  mrNumber: string;
  invoiceNo: string;
  resolvedDetail: string;
  resolvedEntityId: string;
}

interface TransactionAuditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export function TransactionAuditSheet({ open, onOpenChange, transactionId }: TransactionAuditSheetProps) {
  const [audit, setAudit] = useState<AuditTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (open && transactionId) {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/transactions/audit/${transactionId}`, getApiOptions)
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch audit data");
            return data;
          })
          .then((data) => {
            setAudit(data.data);
          })
          .catch((err) => {
            toast.error(err.message);
            onOpenChange(false); // Close the sheet if it fails
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Clear data when closed so it doesn't flash old data on next open
        setAudit(null);
      }
    }, 0);
  }, [open, transactionId, onOpenChange]);

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "SERVICE": return <IconActivity size={16} className="text-muted-foreground" />;
      case "DOCTOR": return <IconStethoscope size={16} className="text-muted-foreground" />;
      case "ROOM": return <IconBed size={16} className="text-muted-foreground" />;
      default: return <IconFileDescription size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-background border-l border-border/50">

        {/* Loading State */}
        {isLoading || !audit ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
            <IconLoader2 className="animate-spin" size={32} />
            <p>Retrieving secure audit log...</p>
          </div>
        ) : (
          <>
            {/* Header - Audit Focus */}
            <SheetHeader className="border-b border-border/50 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="font-heading text-xl flex items-center gap-2 text-foreground">
                    <IconFileDescription className="text-muted-foreground" size={24} />
                    Audit Record
                  </SheetTitle>
                  <SheetDescription className="mt-1 font-mono text-xs">
                    {audit.txnNo}
                  </SheetDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-widest bg-transparent border-border/50 text-foreground"
                >
                  {audit.type}
                </Badge>
              </div>
            </SheetHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2 px-5">

              {/* Core Financial Event */}
              <section className="bg-muted/10 border border-border/50 p-4 rounded-md space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                  <div className="bg-background border border-border/50 p-2 rounded-md">
                    {getTypeIcon(audit.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{audit.resolvedDetail}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Entity ID: {audit.resolvedEntityId}</p>
                  </div>
                </div>
                <div className="flex justify-between items-end pt-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exact Charge</span>
                  <span className="font-mono text-xl font-bold text-foreground">
                    Rs {audit.amount.toLocaleString()}
                  </span>
                </div>
              </section>

              {/* Contextual Resolution (The Joins) */}
              <section className="space-y-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Context & Relations</h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Patient Link */}
                  <div className="border border-border/50 p-3 rounded-md bg-background">
                    <p className="text-[10px] uppercase text-muted-foreground mb-1">Attached Patient</p>
                    <p className="text-sm font-medium text-foreground">{audit.patientName}</p>
                    <p className="text-xs font-mono text-muted-foreground">{audit.mrNumber}</p>
                  </div>

                  {/* Invoice Link */}
                  <div className="border border-border/50 p-3 rounded-md bg-background flex flex-col justify-between">
                    <p className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                      <IconLink size={10} /> Parent Invoice
                    </p>
                    <p className="text-sm font-mono font-medium text-primary mt-1 truncate" title={audit.invoiceNo}>{audit.invoiceNo}</p>
                    <Button variant="link" className="h-auto p-0 text-[10px] text-muted-foreground justify-start">
                      Jump to Invoice →
                    </Button>
                  </div>
                </div>
              </section>

              {/* System Metadata */}
              <section className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Metadata</h3>
                <div className="border border-border/50 rounded-md overflow-hidden text-sm bg-background">

                  <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconClock size={16} />
                      <span>Timestamp</span>
                    </div>
                    <span className="font-mono text-xs text-foreground">{new Date(audit.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconUser size={16} />
                      <span>Operator</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">{audit.operatorName}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconFileDescription size={16} />
                      <span>System ID</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{audit.id}</span>
                  </div>

                </div>
              </section>

            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-border/50 mt-auto flex gap-3">
              <Button variant="outline" className="w-full gap-2 shadow-none border-border/50 bg-background text-red-500 hover:text-red-600 hover:bg-red-500/10">
                <IconAlertTriangle size={16} />
                Flag Discrepancy
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

