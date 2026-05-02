import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IconPrinter, IconReceipt } from "@tabler/icons-react";

// In reality, you would fetch this full object from your DB using the transaction.invoiceId
const mockInvoiceData = {
  invoiceNo: "INV-2026-9041",
  status: "DONE", // or "PENDING"
  date: "2026-05-01 10:30 AM",
  patient: {
    name: "Ali Ahmed",
    mrNumber: "MR-2026-0001",
    phone: "0300-1234567"
  },
  // The line items (Transactions attached to this invoice)
  transactions: [
    { id: "txn-1", type: "SERVICE", detail: "Chest X-Ray", amount: 1500 },
    { id: "txn-2", type: "DOCTOR", detail: "Dr. Salman (Consult)", amount: 2000 },
  ],
  // Financial Summary
  subtotal: 3500,
  discount: 500,
  payable: 3000,
  // Payments made against this invoice
  payments: [
    { method: "CASH", amount: 3000, date: "2026-05-01 10:35 AM" }
  ]
};

interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null; // You pass the ID from the Ledger to fetch the invoice
}

export function InvoiceDetailSheet({ open, onOpenChange, transactionId }: InvoiceDetailSheetProps) {
  // TODO: Use transactionId to fetch the real invoice data from your API here
  const invoice = mockInvoiceData;

  if (!transactionId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col h-full bg-background border-l border-border/50">

        {/* Header Actions */}
        <SheetHeader className="border-b border-border/50 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="font-heading text-2xl flex items-center gap-2">
                <IconReceipt className="text-muted-foreground" />
                Invoice {invoice.invoiceNo}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Generated on {invoice.date}
              </SheetDescription>
            </div>
            <Badge
              variant="outline"
              className={`text-xs uppercase tracking-widest ${invoice.status === "DONE"
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                }`}
            >
              {invoice.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 px-5 space-y-8 pr-2">

          {/* Bill To Section */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Bill To</h3>
            <div className="bg-muted/10 border border-border/50 p-4 rounded-md">
              <div className="font-medium text-foreground">{invoice.patient.name}</div>
              <div className="text-sm font-mono text-muted-foreground mt-1">{invoice.patient.mrNumber}</div>
              <div className="text-sm font-mono text-muted-foreground">{invoice.patient.phone}</div>
            </div>
          </section>

          {/* Line Items (The Transactions) */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Line Items</h3>
            <div className="border border-border/50 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left font-medium text-muted-foreground p-3 text-xs uppercase tracking-wider">Description</th>
                    <th className="text-right font-medium text-muted-foreground p-3 text-xs uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {invoice.transactions.map((txn) => (
                    <tr key={txn.id} className="bg-background">
                      <td className="p-3">
                        <div className="font-medium">{txn.detail}</div>
                        <div className="text-xs text-muted-foreground uppercase mt-0.5">{txn.type}</div>
                      </td>
                      <td className="p-3 text-right font-mono text-foreground">
                        {txn.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Financial Summary */}
          <section className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>Subtotal</span>
              <span className="font-mono">{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>Discount</span>
              <span className="font-mono text-destructive">-{invoice.discount.toLocaleString()}</span>
            </div>
            <Separator className="my-2 bg-border/50" />
            <div className="flex justify-between items-center px-1">
              <span className="font-medium uppercase text-xs tracking-wider">Net Payable</span>
              <span className="font-mono text-lg font-bold text-foreground">
                Rs {invoice.payable.toLocaleString()}
              </span>
            </div>
          </section>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Payment Record</h3>
              <div className="space-y-2">
                {invoice.payments.map((payment, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-muted/10 border border-border/50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] uppercase bg-background border-border/50">
                        {payment.method}
                      </Badge>
                      <span className="text-muted-foreground text-xs">{payment.date}</span>
                    </div>
                    <span className="font-mono font-medium text-green-600">
                      +{payment.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <SheetFooter className="flex flex-col gap-3 sm:flex-col">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            <IconPrinter size={18} className="" />
            Print Official Receipt
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
