import { useState } from "react";
import { useRevalidator } from "react-router";
import { toast } from "sonner";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { IconCash, IconCreditCard, IconBuildingBank, IconCheck } from "@tabler/icons-react";

interface PendingInvoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  mrNumber: string;
  payableAmount: number;
}

interface PaymentCollectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: PendingInvoice | null;
}

export function PaymentCollectionSheet({ open, onOpenChange, invoice }: PaymentCollectionSheetProps) {
  const [method, setMethod] = useState<string>("CASH");
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const revalidator = useRevalidator();

  if (!invoice) return null;

  const handleCollectPayment = async () => {
    setIsLoading(true);
    try {
      // 1. POST to your payments endpoint
      // This endpoint should:
      // - INSERT INTO payments (...)
      // - UPDATE invoices SET status = 'DONE' WHERE id = invoice.id
      /*
      const response = await fetch(`http://localhost:4040/api/v1/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amountPaid: invoice.payableAmount, // Assuming full payment
          paymentMethod: method,
          referenceNo: referenceNo || null
        }),
      });

      if (!response.ok) throw new Error("Payment processing failed");
      */

      // Simulating network delay for realistic UI feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success("Payment collected and invoice marked as DONE.");

      // Reset form
      setMethod("CASH");
      setReferenceNo("");
      onOpenChange(false);

      // Refresh the background data!
      revalidator.revalidate();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <IconCash className="text-primary" /> Collect Payment
          </SheetTitle>
          <SheetDescription>
            Process payment for {invoice.invoiceNo}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6 mx-5 space-y-6 px-1">

          {/* Summary Box */}
          <div className="bg-muted/10 border border-border/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</p>
                <p className="font-medium text-foreground mt-0.5">{invoice.patientName}</p>
                <p className="font-mono text-xs text-muted-foreground">{invoice.mrNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount Due</p>
                <p className="font-mono text-xl font-bold text-foreground mt-0.5">
                  Rs {invoice.payableAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">
                    <div className="flex items-center gap-2">
                      <IconCash size={16} className="text-muted-foreground" /> Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="CARD">
                    <div className="flex items-center gap-2">
                      <IconCreditCard size={16} className="text-muted-foreground" /> Credit / Debit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="BANK_TRANSFER">
                    <div className="flex items-center gap-2">
                      <IconBuildingBank size={16} className="text-muted-foreground" /> Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditionally show Reference Number input if not cash */}
            {method !== "CASH" && (
              <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="ref-no">Reference / Transaction Number</Label>
                <Input
                  id="ref-no"
                  placeholder={method === "CARD" ? "e.g., Auth Code 123456" : "e.g., IBFT Ref 0987654321"}
                  className="bg-background"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label>Amount Tendered</Label>
              {/* Keeping it read-only/disabled for now assuming strict full-payments */}
              <Input
                className="bg-muted/30 font-mono font-medium text-foreground"
                value={`Rs ${invoice.payableAmount.toLocaleString()}`}
                disabled
              />
              <p className="text-[10px] text-muted-foreground">
                Partial payments are currently disabled.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button
            onClick={handleCollectPayment}
            className="w-full gap-2 shadow-sm"
            disabled={isLoading}
          >
            <IconCheck size={18} />
            {isLoading ? "Processing..." : "Confirm & Print Receipt"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
