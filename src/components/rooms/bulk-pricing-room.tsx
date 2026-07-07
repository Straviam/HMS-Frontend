import { API_BASE_URL } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconCalculator } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRevalidator } from "react-router";

interface roomUpdates {
  id: string;
  roomNumber: string;
  price: number;
  roomType: string;
  newPrice?: number;
}

interface BulkPricingRoom {
  id: string;
  roomNumber: string;
  price: number;
  roomType: string;
}

interface BulkPricingDialogProps {
  rooms: BulkPricingRoom[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// TODO: Remove Any from every where
export function BulkPricingDialog({ rooms, open, onOpenChange }: BulkPricingDialogProps) {
  const revalidator = useRevalidator();
  const [isLoading, setIsLoading] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [updates, setUpdates] = useState<roomUpdates[]>(rooms);

  const updateNewPrice = (roomId: string, newPrice: number) => {
    setUpdates((prevUpdates) =>
      prevUpdates.map((room) =>
        room.id === roomId
          ? { ...room, newPrice }
          : room
      )
    )
  }

  const handleBulkPriceUpdates = async () => {
    if (!updates) {
      toast.error("Please provide all the details.");
      return;
    }

    setIsLoading(true);
    console.log(updates)

    try {

      const response = await fetch(`${API_BASE_URL}/rooms/pricing/bulk-override`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          updates
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate();
      toast.success(result.message || `Bulk Pricing Updated  Sucessfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handelApplyGlobalMultiplier = async () => {
    if (!multiplier) {
      toast.error("Please Enter a Multiplier.");
      return;
    }

    setIsLoading(true);

    try {

      const response = await fetch(`${API_BASE_URL}/rooms/pricing/bulk-multiplier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          multiplier
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate();
      toast.success(result.message || `Pricing Sucessfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <IconCalculator className="text-primary" /> Global Pricing Matrix
          </DialogTitle>
          <DialogDescription>
            Rapidly adjust hourly rates across the facility. Changes apply to future bookings only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4 border-b">
          <span className="text-sm font-medium">Apply Global Multiplier:</span>
          <Input
            type="number"
            placeholder="e.g., 1.10 for +10%"
            className="w-40 bg-muted/30"
            value={multiplier}
            onChange={(e) => { setMultiplier(parseFloat(e.target.value)) }}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handelApplyGlobalMultiplier}
            disabled={isLoading}
          >Apply to All</Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead>Node ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Current Rate (Rs)</TableHead>
                <TableHead>New Rate (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: BulkPricingRoom) => (
                <TableRow key={room.id}>
                  <TableCell className="font-mono font-medium">{room.roomNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{room.roomType}</TableCell>
                  <TableCell>Rs {room.price}</TableCell>
                  <TableCell>
                    <Input type="number"
                      defaultValue={room.price}
                      onChange={(e) => updateNewPrice(room.id, parseFloat(e.target.value))}
                      className="w-32 h-8 text-sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="shadow-md"
            onClick={handleBulkPriceUpdates}
            disabled={isLoading}>
            Execute Batch Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
