import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "../ui/sheet";
import { IconEmergencyBed } from "@tabler/icons-react";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../ui/select";
import { useLoaderData } from "react-router";
import { getApiOptions } from "@/lib/utils";
import { toast } from "sonner";

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

export interface Patient {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  cnic: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  bloodGroup: string;
  address: string;
  createdAt: string;
}

interface LoaderData {
  rooms: Room[];
}
interface RoomBookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePatient: Patient | null;
}
export async function RoomBookingHandler(): Promise<LoaderData> {
  try {
    const [roomRes] = await Promise.all([
      fetch("http://localhost:4040/api/v1/rooms", getApiOptions),
    ]);

    if (!roomRes.ok) throw new Error("Failed to fetch rooms list.");

    const roomData = await roomRes.json();

    return {
      rooms: roomData.data,
    };
  } catch (error) {
    console.error(
      "Loader Exception:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw new Response("Failed to load Reception data from server.", {
      status: 500,
      statusText:
        error instanceof Error ? error.message : "Internal Server Error",
    });
  }
}

// TODO: will change this any
export function RoomBookingSheet({ open, onOpenChange, activePatient }: RoomBookingSheetProps) {
  const { rooms } = useLoaderData() as LoaderData;
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleConfirmAdmission = async () => {
    if (!activePatient || !selectedRoom) return;
    // TODO: POST /api/v1/admissions
    toast(
      `Success! Admitted ${activePatient.firstName}  ${activePatient.lastName} to ${selectedRoom.roomNumber}.`,
    );
    onOpenChange(false)
    setSelectedType("")
    setSelectedRoom(null)
  };

  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === "AVAILABLE"),
    [rooms],
  );

  const roomTypes = useMemo(() => {
    const types = new Set(rooms.map((r) => r.roomType));
    return Array.from(types);
  }, [rooms]);

  const roomsToShowForAdmission = useMemo(
    () => availableRooms.filter((r) => r.roomType === selectedType),
    [availableRooms, selectedType],
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto p-5">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <IconEmergencyBed className="text-primary" />
            Admit Patient
          </SheetTitle>
          <SheetDescription>
            Select ward and bed for the incoming patient.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg border flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Patient
              </p>
              <p className="font-bold">
                {activePatient?.firstName} {activePatient?.lastName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                MR No
              </p>
              <p className="font-mono font-medium">{activePatient?.mrNumber}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Level of Care (Ward Type)</Label>
            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val);
                setSelectedRoom(null);
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Category..." />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="space-y-3 border-t pt-4">
              <Label>Available {selectedType.toUpperCase()} Beds</Label>
              {roomsToShowForAdmission.length === 0 ? (
                <p className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded border border-destructive/20">
                  No available beds in this category.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {roomsToShowForAdmission.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${
                        selectedRoom?.id === room.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-bold font-heading text-lg">
                        {room.roomNumber}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Rs {Number(room.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button
            className="w-full gap-2 shadow-md"
            disabled={!selectedRoom}
            onClick={handleConfirmAdmission}
          >
            {selectedRoom
              ? `Confirm Admission to ${selectedRoom.roomNumber}`
              : "Select a bed to continue"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
