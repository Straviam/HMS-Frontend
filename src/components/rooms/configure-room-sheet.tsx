import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRevalidator } from "react-router";

// Assuming Room type from previous code block
export function ConfigureRoomSheet({ room, open, onOpenChange }: any) {
  if (!room) return null;

  const revalidator = useRevalidator();
  const [isLoading, setIsLoading] = useState(false);

  const [roomStatus, setRoomStatus] = useState(room.status);
  const [price, setPrice] = useState(room.pricePerDay);

  const handleUpadte = async () => {
    if (!roomStatus || !price) {
      toast.error("Please provide all the details.");
      return;
    }

    setIsLoading(true);

    try {

      const response = await fetch(`http://localhost:4040/api/v1/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          status: roomStatus,
          price,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate();
      toast.success(result.message || `Room Updated Sucessfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecommission = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4040/api/v1/rooms/${room.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate();
      toast.success(result.message || `Room Updated Sucessfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }

  }



  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Configure Node: {room.roomNumber}</SheetTitle>
          <SheetDescription>Update pricing or force a state override.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6 px-5">
          <div className="grid gap-2">
            <Label>Force Status Override</Label>
            <Select value={roomStatus} onValueChange={setRoomStatus}>
              <SelectTrigger className="bg-muted/30 border-amber-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* NOTE: these are based on Enum of DB */}
                <SelectItem value="AVAILABLE">Available (Force Clear)</SelectItem>
                <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                <SelectItem value="CLEANING">Needs Cleaning</SelectItem>
                <SelectItem value="OCCUPIED" disabled>Occupied (System Managed)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mt-1">
              <IconAlertTriangle size={12} className="text-amber-500" />
              Overrides bypass receptionist protocols.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Custom Rate (Rs / Day)</Label>
            <Input type="number" value={price} onChange={(e) => { setPrice((e.target.value)) }} className="bg-muted/30" />
          </div>
        </div>

        <SheetFooter className="flex flex-col gap-3 sm:flex-col">
          <Button
            onClick={handleUpadte}
            className="w-full"
            disabled={isLoading}>
            Save Configuration
          </Button>
          <Button
            variant="destructive"
            className="w-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none"
            disabled={isLoading}
            onClick={handleDecommission}>
            Decommission Room
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
