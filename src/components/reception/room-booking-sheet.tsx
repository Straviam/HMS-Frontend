import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetDescription, SheetFooter, SheetTitle } from "../ui/sheet";
import { IconEmergencyBed, IconLoader2 } from "@tabler/icons-react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "../ui/select";
import { toast } from "sonner";
import { getApiOptions, API_BASE_URL } from "@/lib/utils";
import { useRoomStore, type Room, type Patient } from "@/store/room-store";

interface RoomBookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePatient: Patient | null;
  onSuccessRevalidate: () => void;
}

export function RoomBookingSheet({ open, onOpenChange, activePatient, onSuccessRevalidate }: RoomBookingSheetProps) {
  const { rooms, admitPatientLocally } = useRoomStore();
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmAdmission = async () => {
    if (!activePatient || !selectedRoom) return;
    if (rooms.some(r => r.currentPatientMrNo === activePatient.mrNumber && r.status === "OCCUPIED")) {
      toast.error(`${activePatient.firstName} is already admitted to a room.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roomBooking/generate`, {
        ...getApiOptions,
        method: "POST",
        body: JSON.stringify({ patientId: activePatient.id, roomId: selectedRoom.id })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to admit patient");

      admitPatientLocally(
        selectedRoom.id,
        `${activePatient.firstName} ${activePatient.lastName}`,
        activePatient.mrNumber,
        result.data.invoice.id
      );

      toast.success(`Admitted ${activePatient.firstName} to ${selectedRoom.roomNumber}.`);
      onSuccessRevalidate();
      onOpenChange(false);
      setSelectedType("");
      setSelectedRoom(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRooms = useMemo(() => rooms.filter((r) => r.status === "AVAILABLE"), [rooms]);
  const roomTypes = useMemo(() => Array.from(new Set(rooms.map((r) => r.roomType))), [rooms]);
  const roomsToShowForAdmission = useMemo(() => availableRooms.filter((r) => r.roomType === selectedType), [availableRooms, selectedType]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto p-5">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl flex items-center gap-2"><IconEmergencyBed className="text-primary" /> Admit Patient</SheetTitle>
          <SheetDescription>Select ward and bed for the incoming patient.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="bg-muted p-4 rounded-lg border flex justify-between items-center">
            <div><p className="text-xs text-muted-foreground uppercase">Patient</p><p className="font-bold">{activePatient?.firstName} {activePatient?.lastName}</p></div>
            <div className="text-right"><p className="text-xs text-muted-foreground uppercase">MR No</p><p className="font-mono font-medium">{activePatient?.mrNumber}</p></div>
          </div>

          <div className="space-y-3">
            <Label>Ward Type</Label>
            <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setSelectedRoom(null); }}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select Category..." /></SelectTrigger>
              <SelectContent>{roomTypes.map((type) => <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="space-y-3 border-t pt-4">
              <Label>Available Beds</Label>
              {roomsToShowForAdmission.length === 0 ? (
                <p className="text-sm text-destructive p-3 bg-destructive/10 rounded border border-destructive/20">No beds available.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {roomsToShowForAdmission.map((room) => (
                    <div key={room.id} onClick={() => setSelectedRoom(room)} className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${selectedRoom?.id === room.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card border-border hover:border-primary/50"}`}>
                      <p className="font-bold font-heading text-lg">{room.roomNumber}</p>
                      <p className="text-sm text-muted-foreground mt-1">Rs {Number(room.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button className="w-full gap-2" disabled={!selectedRoom || isSubmitting} onClick={handleConfirmAdmission}>
            {isSubmitting && <IconLoader2 className="animate-spin" size={18} />}
            {selectedRoom ? `Confirm Admission` : "Select a bed"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}