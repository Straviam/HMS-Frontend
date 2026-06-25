import React, { useState, useEffect, useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import {
  IconBed,
  IconActivity,
  IconSearch,
  IconUserPlus,
  IconDoorExit,
  IconPlus,
  IconTool,
  IconEmergencyBed,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getApiOptions } from "@/lib/utils";
import { toast } from "sonner";

// --- TYPES (Exactly matching your API payload) ---
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
  stats: {
    total: number;
    occupied: number;
    maintenance: number;
    cleaning: number;
    available: number;
  };
  patients: Patient[];
}

// --- LOADER ---
export async function ReceptionBedLoader(): Promise<LoaderData> {
  try {
    const [roomRes, statsRes, patientRes] = await Promise.all([
      fetch("http://localhost:4040/api/v1/rooms", getApiOptions),
      fetch("http://localhost:4040/api/v1/rooms/stats", getApiOptions),
      fetch("http://localhost:4040/api/v1/patients", getApiOptions),
    ]);

    if (!roomRes.ok) throw new Error("Failed to fetch rooms list.");
    if (!statsRes.ok) throw new Error("Failed to fetch hospital stats.");
    if (!patientRes.ok) throw new Error("Failed to fetch patients list.");

    const roomData = await roomRes.json();
    const statsData = await statsRes.json();
    const patientData = await patientRes.json();

    return {
      rooms: roomData.data,
      stats: statsData.data,
      patients: patientData.data.patients, // Extracting the array directly
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

// Helper for Status Styling
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
export default function ReceptionRoomBooking() {
  const { rooms, stats, patients } = useLoaderData() as LoaderData;
  console.log(stats);

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Sheet State
  const [isAdmitSheetOpen, setIsAdmitSheetOpen] = useState<boolean>(false);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [isManageSheetOpen, setIsManageSheetOpen] = useState<boolean>(false);
  const [manageRoom, setManageRoom] = useState<Room | null>(null);

  // --- DATA DERIVATION ---
  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === "AVAILABLE"),
    [rooms],
  );

  // Dynamic Room Types for the select dropdown
  const roomTypes = useMemo(() => {
    const types = new Set(rooms.map((r) => r.roomType));
    return Array.from(types);
  }, [rooms]);

  const roomsToShowForAdmission = useMemo(
    () => availableRooms.filter((r) => r.roomType === selectedType),
    [availableRooms, selectedType],
  );

  // --- SEARCH LOGIC ---
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setHasSearched(true);
      const normalizedTerm = searchTerm.toLowerCase();

      const results = patients.filter(
        (p) =>
          p.phone.includes(searchTerm) ||
          p.cnic.includes(searchTerm) ||
          p.mrNumber.toLowerCase().includes(normalizedTerm),
      );
      setSearchResults(results);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, patients]);

  // --- HANDLERS ---
  const openAdmissionSheet = (patient: Patient) => {
    setActivePatient(patient);
    setSelectedType("");
    setSelectedRoom(null);
    setIsAdmitSheetOpen(true);
  };

  const handleConfirmAdmission = async () => {
    if (!activePatient || !selectedRoom) return;
    // TODO: POST /api/v1/admissions
    toast(
      `Success! Admitted ${activePatient.firstName} to ${selectedRoom.roomNumber}.`,
    );
    setIsAdmitSheetOpen(false);
    setActivePatient(null);
    setSearchTerm("");
  };

  const openManageSheet = (room: Room) => {
    setManageRoom(room);
    setIsManageSheetOpen(true);
  };

  const handleDischargePatient = async () => {
    if (!manageRoom) return;
    // TODO: POST /api/v1/admissions/discharge
    toast(`Discharged patient from ${manageRoom.roomNumber}.`);
    setIsManageSheetOpen(false);
    setManageRoom(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Reception & Admissions
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage patient admissions, search records, and assign beds.
          </p>
        </div>
      </div>

      {/* KPI Dashboard (Matching Admin Cleanliness) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Available Beds
              </span>
              <IconBed size={20} className="text-primary/70" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-heading font-bold text-primary">
                {stats.available}
              </span>
              <span className="text-xs text-muted-foreground">
                / {stats.total} Total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Occupied Beds
              </span>
              <IconActivity size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">
              {stats.occupied}
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Needs Cleaning
              </span>
              <IconActivity size={20} className="text-amber-500/70" />
            </div>
            <span className="text-3xl font-heading font-bold">
              {stats.cleaning}
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Maintenance
              </span>
              <IconTool size={20} className="text-destructive/70" />
            </div>
            <span className="text-3xl font-heading font-bold">
              {stats.maintenance}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="admissions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="admissions">New Admission</TabsTrigger>
          <TabsTrigger value="bedboard">Live Bed Board</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: ADMISSIONS --- */}
        <TabsContent value="admissions" className="space-y-6">
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="space-y-3 max-w-2xl">
                <Label className="text-lg font-heading font-semibold">
                  Patient Search
                </Label>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Scan or type MR No, Phone, or CNIC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base bg-background shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RESULTS AREA */}
          {hasSearched && (
            <div className="border p-4 rounded-md space-y-4">
              <h2 className="font-bold">Results:</h2>

              {searchResults.length === 0 ? (
                <div className="space-y-4">
                  <p>No patient found.</p>
                  <Button asChild className="gap-2">
                    <Link to="/receptionist" />
                    <IconPlus size={18} />
                    Add New Patient
                  </Button>
                </div>
              ) : (
                searchResults.map((patient) => (
                  <div
                    key={patient.mrNumber}
                    className="border p-4 flex justify-between items-center bg-slate-50"
                  >
                    <div>
                      <p className="font-bold">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm">
                        MR: {patient.mrNumber} | Phone: {patient.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => openAdmissionSheet(patient)}>
                        Assign Room
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* --- TAB 2: BED BOARD (Mirrored from Admin Panel) --- */}
        <TabsContent
          value="bedboard"
          className="animate-in fade-in duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${
                  room.status === "UNDER_MAINTENANCE" ||
                  room.status === "CLEANING"
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
                        onClick={() => openManageSheet(room)}
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
      </Tabs>

      {/* --- SHEET: ADMISSION --- */}
      <Sheet open={isAdmitSheetOpen} onOpenChange={setIsAdmitSheetOpen}>
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
                <p className="font-mono font-medium">
                  {activePatient?.mrNumber}
                </p>
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

      {/* --- SHEET: DISCHARGE --- */}
      <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-heading text-2xl flex items-center gap-2">
              Manage Occupancy
            </SheetTitle>
            <SheetDescription>
              Room {manageRoom?.roomNumber} -{" "}
              {manageRoom?.roomType.toUpperCase()}
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
    </div>
  );
}
