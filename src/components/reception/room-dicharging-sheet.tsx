import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetHeader, SheetDescription, SheetFooter } from "../ui/sheet";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { IconDoorExit, IconLoader2, IconReceipt, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { getApiOptions, API_BASE_URL } from "@/lib/utils";
import { useRoomStore, type Room } from "@/store/room-store";

interface RoomDischargingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manageRoom: Room | null;
  onSuccessRevalidate: () => void;
}

export function RoomDischargingSheet({ open, onOpenChange, manageRoom, onSuccessRevalidate }: RoomDischargingSheetProps) {
  const dischargePatientLocally = useRoomStore((state) => state.dischargePatientLocally);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalReceiptData, setFinalReceiptData] = useState<any>(null); // State for the receipt

  // Reset receipt state when sheet opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setFinalReceiptData(null);
    onOpenChange(isOpen);
  };

  const handleDischargePatient = async () => {
    if (!manageRoom) return;
    if (!manageRoom.currentInvoiceId) {
      toast.error("System Error: No active invoice linked to this room.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roomBooking/${manageRoom.currentInvoiceId}/finalize`, {
        ...getApiOptions,
        method: "PATCH"
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to discharge patient");

      dischargePatientLocally(manageRoom.id);
      onSuccessRevalidate(); // Refetch stats

      // Store the receipt data returned by the backend to show the UI
      setFinalReceiptData(result.data);
      toast.success(`Discharged patient. Final bill generated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Discharge failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto p-5">
        {!finalReceiptData ? (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="font-heading text-2xl flex items-center gap-2">
                <IconDoorExit className="text-primary"/>Manage Occupancy</SheetTitle>
              <SheetDescription>Room {manageRoom?.roomNumber} - {manageRoom?.roomType?.toUpperCase()}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 ">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-1">
                <Label className="text-primary">Current Occupant</Label>
                <p className="font-bold font-heading text-xl">{manageRoom?.currentPatientName || "Unknown"}</p>
                <p className="text-sm font-mono text-muted-foreground">{manageRoom?.currentPatientMrNo || "No MR found"}</p>
                <div className="mt-2 text-xs font-mono bg-background px-2 py-1 rounded inline-block border">
                  Inv: {manageRoom?.currentInvoiceId}
                </div>
              </div>


              <SheetFooter className="pt-6 border-t mt-full">

                <Button variant="destructive" className="w-full gap-2" disabled={isSubmitting} onClick={handleDischargePatient}>
                  {isSubmitting ? <IconLoader2 className="animate-spin" size={18} /> : <IconDoorExit size={18} />}
                  Discharge Patient & Finalize Bill
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  This will finalize current billing cycles, calculate room costs, and mark the room for cleaning.
                </p>

              </SheetFooter>
            </div>
          </>
        ) : (
          // --- RECEIPT VIEW UI ---
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="font-heading text-2xl flex items-center gap-2 text-emerald-600">
                <IconCheck size={28} /> Discharge Complete
              </SheetTitle>
              <SheetDescription>Invoice {finalReceiptData.invoice.invoiceNo} has been issued.</SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-slate-50 space-y-3">
                <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                  <IconReceipt size={18} /> Final Summary
                </h3>

                {finalReceiptData.receipts.map((group: any) => (
                  <div key={group.serviceTypeName} className="space-y-1">
                    <p className="font-semibold text-sm">{group.serviceTypeName}</p>
                    {group.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm text-muted-foreground ml-2">
                        <span>- {item.itemName}</span>
                        <span>Rs {item.price}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total Payable:</span>
                  <span className="text-primary">Rs {Number(finalReceiptData.invoice.payableAmount).toLocaleString()}</span>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button className="w-full" onClick={() => handleOpenChange(false)}>
                  Close & Return to Dashboard
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}