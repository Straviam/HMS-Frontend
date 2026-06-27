import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetDescription,
} from "../ui/sheet";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { IconDoorExit } from "@tabler/icons-react";
import { toast } from "sonner";
import { useState } from "react";

export type RoomStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "CLEANING"
  | "UNDER_MAINTENANCE";

export interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  price: string;
  status: RoomStatus;
  lastCleanedAt: string | null;
  isActive: boolean;
  createdAt: string;
  // Note: If backend adds current occupant details later, add them here
  currentPatientName?: string;
  currentPatientMrNo?: string;
}

interface RoomDischargingSheetProps {
  open: boolean,
  onOpenChange: (open: boolean) => void;
}

// TODO: remove this any
export function RoomDischargingSheet({ open, onOpenChange, }: RoomDischargingSheetProps) {
  const [manageRoom, setManageRoom] = useState<Room | null>(null);

  const handleDischargePatient = async () => {
    if (!manageRoom) return;
    // TODO: POST /api/v1/admissions/discharge
    toast(`Discharged patient from ${manageRoom.roomNumber}.`);
   onOpenChange(false)
   setManageRoom(null)
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            Manage Occupancy
          </SheetTitle>
          <SheetDescription>
            Room {manageRoom?.roomNumber} - {manageRoom?.roomType.toUpperCase()}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-1">
            <Label className="text-primary">Current Occupant</Label>
            <p className="font-bold font-heading text-xl">
              {manageRoom?.currentPatientName || "Unknown"}
            </p>
            <p className="text-sm font-mono text-muted-foreground">
              {manageRoom?.currentPatientMrNo || "No MR found"}
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t mt-auto">
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleDischargePatient}
            >
              <IconDoorExit size={18} />
              Discharge Patient & Clear Bed
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              This will finalize current billing cycles and mark the room for
              cleaning.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
