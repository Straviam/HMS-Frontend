import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IconEdit, IconTrash, IconLock, IconLoader2 } from "@tabler/icons-react";
import { getApiOptions, API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

interface Transaction {
  id: string;
  detail: string;
  amount: number;
}

interface DraftInvoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  mrNumber: string;
  payableAmount: number;
  status: string;
  transactions?: Transaction[];
}

interface ManageDraftSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: DraftInvoice | null;
}

export function ManageDraftSheet({ open, onOpenChange, invoice }: ManageDraftSheetProps) {
  const [activeInvoice, setActiveInvoice] = useState<DraftInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (open && invoice?.id) {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/invoices/${invoice.id}`, getApiOptions)
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch draft invoice data");
            return data;
          })
          .then((data) => {
            setActiveInvoice(data.data);
          })
          .catch((err) => {
            toast.error(err.message);
            onOpenChange(false);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setActiveInvoice(null);
      }
    }, 0);
  }, [open, invoice?.id, onOpenChange]);

  if (!invoice?.id) return null;

  // Use fetched details if available, otherwise fall back to initial prop data safely
  const displayInvoice = activeInvoice || invoice;
  const currentTransactions = displayInvoice?.transactions || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-background border-l border-border/50">

        {isLoading || !displayInvoice ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
            <IconLoader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm">Retrieving draft details...</p>
          </div>
        ) : (
          <>
            {/* Header matches Invoice Sheet structure */}
            <SheetHeader className="border-b border-border/50 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="font-heading text-2xl flex items-center gap-2">
                    <IconEdit className="text-muted-foreground" />
                    Manage Draft
                  </SheetTitle>
                  <SheetDescription className="mt-1">
                    Modify the running tab for {displayInvoice.invoiceNo}
                  </SheetDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-600 border-orange-500/20"
                >
                  {displayInvoice.status || "DRAFT"}
                </Badge>
              </div>
            </SheetHeader>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto mt-6 mx-5 space-y-6 px-1">

              {/* Patient Summary Card */}
              <div className="bg-muted/10 border border-border/50 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</p>
                  <p className="font-medium text-foreground mt-0.5">{displayInvoice.patientName}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{displayInvoice.mrNumber}</p>
                </div>
                <div className="text-right self-start">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Total</p>
                  <p className="font-mono text-xl font-bold text-foreground mt-0.5">
                    Rs {(displayInvoice.payableAmount ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Current Line Items with Delete Actions enabled */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Line Items</h3>
                <div className="border border-border/50 rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border/50">
                      {currentTransactions.length === 0 ? (
                        <tr>
                          <td className="p-4 text-center text-xs text-muted-foreground">
                            No items added to this draft yet.
                          </td>
                        </tr>
                      ) : (
                        currentTransactions.map((txn) => (
                          <tr key={txn.id} className="bg-background group">
                            <td className="p-3">
                              <div className="font-medium">{txn.detail}</div>
                            </td>
                            <td className="p-3 text-right font-mono text-foreground vertical-align-middle">
                              {(txn.amount ?? 0).toLocaleString()}
                            </td>
                            <td className="p-3 w-10 text-right vertical-align-middle">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  // Hook up item removal logic here later
                                  toast.info(`Remove requested for: ${txn.detail}`);
                                }}
                              >
                                <IconTrash size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator className="bg-border/50" />
            </div>

            {/* Sticky Sheet Footer Actions */}
            <SheetFooter className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2 sm:flex-col">
              <Button
                disabled
                className="w-full gap-2 shadow-sm"
              >
                <IconLock size={16} />
                Invoice is Not Locked
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                Once issued, you cannot add or remove items from this invoice lifecycle.
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// NOTE : why not a single sheet for draft and paid cuz in the future we will have to add some features in draft  
