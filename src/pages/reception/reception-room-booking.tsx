import { useState, useEffect } from "react";
import { Link, useLoaderData } from "react-router";
import {
  IconBed,
  IconActivity,
  IconSearch,
  IconPlus,
  IconTool,
} from "@tabler/icons-react";
import { Card, CardContent,  } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiOptions } from "@/lib/utils";
import { RoomBookingSheet } from "@/components/reception/room-booking-sheet";
import { RoomDischargingSheet } from "@/components/reception/room-dicharging-sheet";
import { LiveBedBoard } from "@/components/reception/bed-board";

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

export default function ReceptionRoomBooking() {
  const { rooms, stats, patients } = useLoaderData() as LoaderData;

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Sheet State
  const [isAdmitSheetOpen, setIsAdmitSheetOpen] = useState<boolean>(false);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [isManageSheetOpen, setIsManageSheetOpen] = useState<boolean>(false);


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
    setIsAdmitSheetOpen(true);
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

      {/* KPI Dashboard  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
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

        <LiveBedBoard rooms={rooms} />
      </Tabs>

      {/* --- SHEET: ADMISSION --- */}
      <RoomBookingSheet
        open={isAdmitSheetOpen}
        onOpenChange={setIsAdmitSheetOpen}
        activePatient={activePatient}
      />

      {/* --- SHEET: DISCHARGE --- */}
      <RoomDischargingSheet
        open={isManageSheetOpen}
        onOpenChange={setIsManageSheetOpen}
      />
    </div>
  );
}
