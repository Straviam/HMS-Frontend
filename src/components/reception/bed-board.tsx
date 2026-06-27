import { IconDoorExit } from "@tabler/icons-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { useState } from "react";
import { Badge } from "../ui/badge";

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

interface LiveBedBoardProps{
  rooms: Room[]
}

const getStatusBadge = (status: RoomStatus) => {
  switch (status) {
    case "AVAILABLE":
      return (
        <Badge
          variant="outline"
          className="text-primary border-primary/50 bg-primary/5"
        >
          Available
        </Badge>
      );
    case "OCCUPIED":
      return (
        <Badge className="bg-primary text-primary-foreground">Occupied</Badge>
      );
    case "CLEANING":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/20 text-amber-700 border-amber-500/30 border"
        >
          Cleaning
        </Badge>
      );
    case "UNDER_MAINTENANCE":
      return (
        <Badge
          variant="destructive"
          className="bg-destructive/10 text-destructive border-destructive/20 border"
        >
          Maintenance
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function LiveBedBoard({rooms}: LiveBedBoardProps) {
  const [manageRoom, setManageRoom] = useState<Room[] | null>(null);
  const [isManageSheetOpen, setIsManageSheetOpen] = useState<boolean>(false);
  const openManageSheet = (room: Room[]) => {
    setManageRoom(room);
    setIsManageSheetOpen(true);
  };
  return (
    <TabsContent value="bedboard" className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${
              room.status === "UNDER_MAINTENANCE" || room.status === "CLEANING"
                ? "opacity-70 bg-muted/30 border-dashed"
                : ""
            }`}
          >
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl font-heading font-bold tracking-tight">
                  {room.roomNumber}
                </CardTitle>
                <div className="text-sm text-muted-foreground font-medium mt-1">
                  {room.roomType.toUpperCase()}
                </div>
              </div>
              {getStatusBadge(room.status)}
            </CardHeader>

            <CardContent className="flex-1 pb-4">
              <div className="grid grid-cols-1 gap-4 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    Rate
                  </span>
                  <span className="font-mono font-medium">
                    Rs {Number(room.price).toLocaleString()}/Day
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 border-t bg-card/50 px-6 py-3">
              <div className="w-full flex items-center justify-end">
                {room.status === "OCCUPIED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => openManageSheet(rooms)}
                  >
                    <IconDoorExit size={16} />
                    Discharge Options
                  </Button>
                ) : room.status === "AVAILABLE" ? (
                  <div>Ready for Admission</div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Unavailable
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}
