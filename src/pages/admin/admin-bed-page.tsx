import { useLoaderData } from "react-router";

import {
  IconBed,
  IconTool,
  IconActivity,
  IconPlus,
  IconAdjustmentsHorizontal,
  IconBrandLoom
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AddRoomSheet } from "@/components/rooms/add-room-sheet";
import { BulkPricingDialog } from "@/components/rooms/bulk-pricing-room";
import { ConfigureRoomSheet } from "@/components/rooms/configure-room-sheet";
import { RoomLogsDialog } from "@/components/rooms/room-logs-dialog";
import { getApiOptions, API_BASE_URL } from "@/lib/utils";

type RoomStatus = "AVAILABLE" | "OCCUPIED" | "UNDER_MAINTENANCE" | "CLEANING";

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  price: number;
  status: RoomStatus;
  lastCleanedAt: string | null;
}

interface LoaderData {
  rooms: Room[];
  stats: {
    total: number;
    occupied: number;
    maintenance: number;
    cleaning: number;
  };
}

export async function AdminBedLoader(): Promise<LoaderData> {

  try {
    const [roomRes, statsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/rooms`, getApiOptions),
      fetch(`${API_BASE_URL}/rooms/stats`, getApiOptions)
    ]);

    if (!roomRes.ok) {
      const err = await roomRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch rooms list.");
    }

    if (!statsRes.ok) {
      const err = await statsRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch hospital stats.");
    }
    const roomData = await roomRes.json();
    const statsData = await statsRes.json();

    return {
      rooms: roomData.data,
      stats: statsData.data,
    };
  }
  catch (error) {
    console.error("Loader Exception:", error instanceof Error ? error.message : "Unknown error");
    // what is this Response it is native web api we are handeling the error in the react router error boundry componenet 
    throw new Response("Failed to load Rooms data from server.", {
      status: 500,
      statusText: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
}

// Helper for Status Styling
const getStatusBadge = (status: RoomStatus) => {
  switch (status) {
    case "AVAILABLE":
      return <Badge variant="outline" className="text-primary border-primary/50 bg-primary/5">Available</Badge>;
    case "OCCUPIED":
      return <Badge className="bg-primary text-primary-foreground">Occupied</Badge>;
    case "CLEANING":
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 border-amber-500/30 border">Cleaning</Badge>;
    case "UNDER_MAINTENANCE":
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 border">Maintenance</Badge>;
  }
};

export default function AdminBedsPage() {
  const { rooms, stats } = useLoaderData() as LoaderData;

  const occupancyRate = Math.round((stats.occupied / stats.total) * 100) || 0;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const [selectedConfRoom, setSelectedConfRoom] = useState<Room | null>(null);
  const [selectedLogRoom, setSelectedLogRoom] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Facility Setup & Beds</h1>
          <p className="text-muted-foreground text-sm">Manage hospital rooms, pricing, and operational status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"
            className="gap-2"
            onClick={() => setIsBulkOpen(true)}>
            <IconAdjustmentsHorizontal size={18} />
            Bulk Pricing
          </Button>
          <Button className="gap-2 shadow-md shadow-primary/20"
            onClick={() => setIsAddOpen(true)}>
            <IconPlus size={18} />
            Add Room
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Capacity</span>
              <IconBed size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">{stats.total}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Occupancy Rate</span>
              <IconActivity size={20} className="text-primary/70" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold">{occupancyRate}%</span>
              <span className="text-xs text-muted-foreground">{stats.occupied} occupied</span>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="shadow-sm"> */}
        {/*   <CardContent className="p-6 flex flex-col gap-1"> */}
        {/*     <div className="flex items-center justify-between"> */}
        {/*       <span className="text-sm font-medium text-muted-foreground">Needs Cleaning</span> */}
        {/*       <IconBrandLoom size={20} className="text-amber-500/70" /> */}
        {/*     </div> */}
        {/*     <span className="text-3xl font-heading font-bold">{stats.cleaning}</span> */}
        {/*   </CardContent> */}
        {/* </Card> */}

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Under Maintenance</span>
              <IconTool size={20} className="text-destructive/70" />
            </div>
            <span className="text-3xl font-heading font-bold">{stats.maintenance}</span>
          </CardContent>
        </Card>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${room.status === "UNDER_MAINTENANCE" ? "opacity-70 bg-muted/30 border-dashed" : ""
              }`}
          >
            {/* Top color indicator bar */}
            {/* <div className={`h-1 w-full ${room.status === "AVAILABLE" ? "bg-primary/50" : */}
            {/*   room.status === "OCCUPIED" ? "bg-primary" : */}
            {/*     room.status === "CLEANING" ? "bg-amber-500" : "bg-destructive" */}
            {/*   }`} /> */}

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
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Rate</span>
                  <span className="font-mono font-medium">Rs {room.price.toLocaleString()}/Day</span>
                </div>
                {/* No Need of Last Cleaned At  */}
                {/* <div className="flex flex-col gap-1"> */}
                {/*   <span className="text-muted-foreground text-xs uppercase tracking-wider">Last Cleaned</span> */}
                {/*   <span className="font-medium truncate"> */}
                {/*     {room.lastCleanedAt */}
                {/*       ? new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' }).format(new Date(room.lastCleanedAt)) */}
                {/*       : "Unknown"} */}
                {/*   </span> */}
                {/* </div> */}
              </div>
            </CardContent>

            <CardFooter className="pt-0 border-t bg-card/50 px-6 py-3">
              <div className="w-full flex items-center justify-between">
                {/* NOTE: This will be needed only when in backend we have logs table for room activity. Another thing that we can do there or may in the sheet to show all the detail history or room booking there   */}
                {/*
                 <Button variant="link" size="sm" className="px-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedLogRoom(room)}>
                  View Logs
                </Button>
                */}
                <Button variant="outline" size="sm" className="h-8"
                  onClick={() => setSelectedConfRoom(room)}>
                  Configure
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Sheets */}
      <AddRoomSheet open={isAddOpen} onOpenChange={setIsAddOpen} />

      <BulkPricingDialog rooms={rooms} open={isBulkOpen} onOpenChange={setIsBulkOpen} />

      <ConfigureRoomSheet
        room={selectedConfRoom}
        open={!!selectedConfRoom} // remember one ! is inveting the truthy or falsy value and other is for inverting again to balance this
        onOpenChange={(open: boolean) => !open && setSelectedConfRoom(null)}
      />


      {/*   open={!!selectedLogRoom} */}
      {/*   onOpenChange={(open) => !open && setSelectedLogRoom(null)} */}
      {/* /> */}
    </div>
  );
}
