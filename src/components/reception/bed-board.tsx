import { IconDoorExit, IconCopy, IconCheck } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import type { Room, RoomStatus } from "@/store/room-store";
import { RoomDischargingSheet } from "./room-dicharging-sheet";

interface LiveBedBoardProps {
  rooms: Room[];
  searchTerm: string;
  onSuccessRevalidate: () => void;
}

const getStatusBadge = (status: RoomStatus) => {
  switch (status) {
    case "AVAILABLE": return <Badge variant="outline" className="text-primary border-primary/50 bg-primary/5">Available</Badge>;
    case "OCCUPIED": return <Badge className="bg-primary text-primary-foreground">Occupied</Badge>;
    case "CLEANING": return <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 border-amber-500/30 border">Cleaning</Badge>;
    case "UNDER_MAINTENANCE": return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 border">Maintenance</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export function LiveBedBoard({ rooms, searchTerm, onSuccessRevalidate }: LiveBedBoardProps) {
  const [manageRoom, setManageRoom] = useState<Room | null>(null);
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRooms = useMemo(() => {
    if (!searchTerm) return rooms;
    const lower = searchTerm.toLowerCase();
    return rooms.filter(r =>
      r.roomNumber.toLowerCase().includes(lower) ||
      r.roomType.toLowerCase().includes(lower) ||
      r.currentPatientName?.toLowerCase().includes(lower)
    );
  }, [rooms, searchTerm]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${room.status === "UNDER_MAINTENANCE" || room.status === "CLEANING" ? "opacity-70 bg-muted/30 border-dashed" : ""}`}>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl font-heading font-bold">{room.roomNumber}</CardTitle>
                <div className="text-sm text-muted-foreground font-medium mt-1">{room.roomType.toUpperCase()}</div>
              </div>
              {getStatusBadge(room.status)}
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <div className="grid grid-cols-1 gap-4 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase">Rate</span>
                  <span className="font-mono font-medium">Rs {Number(room.price).toLocaleString()}/Day</span>
                </div>
                {room.status === "OCCUPIED" && (
                  <div className="border-t pt-3 mt-1 flex justify-between items-center">
                    <div className="flex flex-col"><span className="font-semibold">{room.currentPatientName}</span><span className="text-xs text-muted-foreground">{room.currentPatientMrNo}</span></div>
                    {room.currentInvoiceId && (
                      <div className="flex items-center gap-2 bg-background border px-2 py-1 rounded cursor-pointer hover:bg-muted transition-colors" onClick={() => { navigator.clipboard.writeText(room.currentInvoiceId!); setCopiedId(room.currentInvoiceId!); toast.success("Invoice ID copied"); setTimeout(() => setCopiedId(null), 2000); }}>
                        <span className="text-xs font-mono">{room.currentInvoiceId}</span>
                        {copiedId === room.currentInvoiceId ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} className="text-muted-foreground" />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t bg-card/50 px-6 py-3">
              <div className="w-full flex items-center justify-end">
                {room.status === "OCCUPIED" ? (
                  <Button variant="outline" size="sm" className="h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setManageRoom(room); setIsManageSheetOpen(true); }}>
                    <IconDoorExit size={16} /> Discharge Options
                  </Button>
                ) : room.status === "AVAILABLE" ? <div className="text-sm text-primary font-medium">Ready for Admission</div> : <span className="text-xs text-muted-foreground italic">Unavailable</span>}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <RoomDischargingSheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen} manageRoom={manageRoom} onSuccessRevalidate={onSuccessRevalidate} />
    </div>
  );
}