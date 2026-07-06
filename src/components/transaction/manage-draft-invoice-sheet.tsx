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
import { IconEdit, IconPlus, IconTrash, IconLock, IconReceipt } from "@tabler/icons-react";

//  MOCK DATA FOR THE DROPDOWNS 
const SERVICE_TYPES = [
  { id: "st1", name: "Consultation" },
  { id: "st2", name: "Laboratory" },
];

const SERVICES = [
  { id: "s1", serviceTypeId: "st1", serviceName: "General Physician", basePrice: 1500 },
  { id: "s2", serviceTypeId: "st1", serviceName: "Cardiologist", basePrice: 3000 },
  { id: "s3", serviceTypeId: "st2", serviceName: "CBC Blood Test", basePrice: 800 },
];

interface DraftInvoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  mrNumber: string;
  payableAmount: number;
  status: string;
  // Mocking the line items that are currently attached to the draft
  transactions?: { id: string; detail: string; amount: number }[];
}

interface ManageDraftSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: DraftInvoice | null;
}

export function ManageDraftSheet({ open, onOpenChange, invoice }: ManageDraftSheetProps) {
  const revalidator = useRevalidator();
  const [isLoading, setIsLoading] = useState(false);

  // UI Toggle State
  const [isAddingService, setIsAddingService] = useState(false);

  // Service Assignment State
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  if (!invoice) return null;

  // Mocking current transactions if they don't exist in the prop for UI purposes
  const currentTransactions = invoice.transactions || [
    { id: "txn-1", detail: "Room Charges (1 Day)", amount: 5000 }
  ];

  // Find active service for price display
  const activeService = SERVICES.find(s => s.id === selectedServiceId);
  const availableServices = SERVICES.filter(s => s.serviceTypeId === selectedTypeId);

  const handleAddService = async () => {
    if (!selectedServiceId) return;

    // TODO: POST request to add transaction to this invoice
    toast.success(`${activeService?.serviceName} added to the running tab.`);

    // Reset the add form
    setIsAddingService(false);
    setSelectedTypeId("");
    setSelectedServiceId("");
  };

  const handleIssueInvoice = async () => {
    setIsLoading(true);
    try {
      // TODO: PUT request to update invoice status to 'ISSUED'
      /*
      await fetch(`/api/v1/invoices/${invoice.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "ISSUED" })
      });
      */

      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Invoice locked and ISSUED. Ready for payment.");
      onOpenChange(false);
      revalidator.revalidate();
    } catch (error) {
      toast.error("Failed to issue invoice");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-background border-l border-border/50">

        {/* Header */}
        <SheetHeader className="border-b border-border/50 pb-4">
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <IconEdit className="text-muted-foreground" /> Manage Draft
          </SheetTitle>
          <SheetDescription>
            Modify the running tab for {invoice.invoiceNo}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto mt-6 mx-5 space-y-6 px-1">

          {/* Patient Summary */}
          <div className="bg-muted/10 border border-border/50 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</p>
              <p className="font-medium text-foreground mt-0.5">{invoice.patientName}</p>
              <p className="font-mono text-xs text-muted-foreground">{invoice.mrNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Total</p>
              <p className="font-mono text-xl font-bold text-foreground mt-0.5">
                Rs {invoice.payableAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Current Line Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Line Items</h3>
            <div className="border border-border/50 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/50">
                  {currentTransactions.map((txn) => (
                    <tr key={txn.id} className="bg-background group">
                      <td className="p-3">
                        <div className="font-medium">{txn.detail}</div>
                      </td>
                      <td className="p-3 text-right font-mono text-foreground">
                        {txn.amount.toLocaleString()}
                      </td>
                      <td className="p-3 w-10 text-right">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconTrash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Add Service Section */}
          {!isAddingService ? (
            <Button
              variant="outline"
              className="w-full border-dashed border-2 bg-muted/5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors gap-2"
              onClick={() => setIsAddingService(true)}
            >
              <IconPlus size={16} /> Add New Service to Tab
            </Button>
          ) : (
            <div className="bg-muted/10 border border-border/50 rounded-lg p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Assign New Service</h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground" onClick={() => setIsAddingService(false)}>Cancel</Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Service Category</Label>
                <Select value={selectedTypeId} onValueChange={(val) => { setSelectedTypeId(val); setSelectedServiceId(""); }}>
                  <SelectTrigger className="bg-background h-8 text-sm"><SelectValue placeholder="Select Category..." /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Specific Service</Label>
                <Select disabled={!selectedTypeId} value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger className="bg-background h-8 text-sm"><SelectValue placeholder="Select Service..." /></SelectTrigger>
                  <SelectContent>
                    {availableServices.map(service => (
                      <SelectItem key={service.id} value={service.id}>{service.serviceName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-between pt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Base Price</Label>
                  <div className="font-mono font-medium">Rs {activeService?.basePrice || "0"}</div>
                </div>
                <Button size="sm" disabled={!selectedServiceId} onClick={handleAddService} className="h-8">
                  Add to Invoice
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <SheetFooter className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleIssueInvoice}
            disabled={isLoading}
            className="w-full gap-2 shadow-sm"
          >
            <IconLock size={16} />
            {isLoading ? "Locking..." : "Lock & Issue Invoice"}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            Once issued, you cannot add or remove items from this invoice.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
