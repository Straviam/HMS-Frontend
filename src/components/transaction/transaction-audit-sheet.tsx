import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  IconFileDescription,
  IconUser,
  IconClock,
  IconLink,
  IconActivity,
  IconStethoscope,
  IconBed,
  IconAlertTriangle
} from "@tabler/icons-react";

// This interface perfectly maps to the Drizzle LEFT JOIN query we discussed earlier.
interface AuditTransaction {
  id: string;             // transactions.id
  txnNo: string;          // transactions.txnNo
  type: "SERVICE" | "DOCTOR" | "ROOM"; // transactions.type
  amount: number;         // transactions.amount
  createdAt: string;      // transactions.createdAt

  // -- The Joined Data --
  operatorName: string;   // users.name (The receptionist)
  patientName: string;    // patients.firstName + patients.lastName
  mrNumber: string;       // patients.mrNumber
  invoiceNo: string;      // invoices.invoiceNo

  // -- The Dynamically Resolved Data --
  resolvedDetail: string; // The dynamically built string (e.g., "Chest X-Ray")
  resolvedEntityId: string; // The raw doctorId, serviceId, or roomId for deep auditing
}

// Mocking the result of fetching a single transaction's exact details
const mockAuditData: AuditTransaction = {
  id: "txn-17145001-uuid",
  txnNo: "TXN-260501-001",
  type: "SERVICE",
  amount: 1500,
  createdAt: "2026-05-01 10:30:45 AM",
  operatorName: "Bilal (Front Desk)",
  patientName: "Ali Ahmed",
  mrNumber: "MR-2026-0001",
  invoiceNo: "INV-260501-001",
  resolvedDetail: "Digital Chest X-Ray",
  resolvedEntityId: "service-xray-uuid-999"
};

interface TransactionAuditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export function TransactionAuditSheet({ open, onOpenChange, transactionId }: TransactionAuditSheetProps) {
  // TODO: Use transactionId to fetch this exact object from your API
  const audit = mockAuditData;

  if (!transactionId) return null;

  const getTypeIcon = () => {
    switch (audit.type) {
      case "SERVICE": return <IconActivity size={16} className="text-muted-foreground" />;
      case "DOCTOR": return <IconStethoscope size={16} className="text-muted-foreground" />;
      case "ROOM": return <IconBed size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-background border-l border-border/50">

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
                {getTypeIcon()}
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
              <div className="border border-border/50 p-3 rounded-md bg-background">
                <p className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                  <IconLink size={10} /> Parent Invoice
                </p>
                <p className="text-sm font-mono font-medium text-primary mt-1">{audit.invoiceNo}</p>
                <Button variant="link" className="h-auto p-0 text-[10px] text-muted-foreground">
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
                <span className="font-mono text-xs text-foreground">{audit.createdAt}</span>
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
      </SheetContent>
    </Sheet>
  );
}
