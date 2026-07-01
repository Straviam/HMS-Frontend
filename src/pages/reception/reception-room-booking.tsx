import { useState, useEffect, useMemo } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { IconSearch, IconPlus, IconLoader2, IconStethoscope, IconCheck, IconCopy } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveBedBoard } from "@/components/reception/bed-board";
import { useRoomStore, type Room, type Patient } from "@/store/room-store";
import { getApiOptions } from "@/lib/utils";
import { AssignServiceSheet } from "@/components/reception/assign-service-to-admitted-patient-sheet";
import { RoomBookingSheet } from "@/components/reception/room-booking-sheet";
import { toast } from "sonner";

// --- LOADER (Merging your two new endpoints) ---
export async function ReceptionBedLoader() {
  try {
    const [statsRes, roomsRes, bookingsRes] = await Promise.all([
      fetch("http://localhost:4040/api/v1/rooms/stats", getApiOptions),
      fetch("http://localhost:4040/api/v1/rooms/active", getApiOptions), // NEW ENDPOINT 1
      fetch("http://localhost:4040/api/v1/roomBooking/active", getApiOptions), // NEW ENDPOINT 2
    ]);

    const statsData = await statsRes.json();
    const roomsData = await roomsRes.json();
    const bookingsData = await bookingsRes.json();

    // Merge the active bookings into the physical rooms array
    const mergedRooms = roomsData.data.map((room: Room) => {
      const activeStay = bookingsData.data.find((b: any) => b.room.id === room.id);
      if (activeStay) {
        return {
          ...room,
          status: "OCCUPIED",
          currentPatientName: `${activeStay.patient.firstName} ${activeStay.patient.lastName}`,
          currentPatientMrNo: activeStay.patient.mrNumber,
          currentInvoiceId: activeStay.booking.invoiceId,
        };
      }
      return room;
    });

    return { stats: statsData.data, rooms: mergedRooms };
  } catch (error) {
    throw new Error("Failed to load Reception data from server.");
  }
}

export default function ReceptionRoomBooking() {
  const { rooms: loaderRooms, stats } = useLoaderData() as any;
  const { revalidate } = useRevalidator();
  const { rooms, setRooms } = useRoomStore();

  useEffect(() => {
    setRooms(loaderRooms);
  }, [loaderRooms, setRooms]);

  // Tab 1 States: Admissions (Global Search)
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [admissionResults, setAdmissionResults] = useState<Patient[]>([]);
  const [isSearchingAdmissions, setIsSearchingAdmissions] = useState(false);
  const [hasSearchedAdmissions, setHasSearchedAdmissions] = useState(false);
  const [isAdmitSheetOpen, setIsAdmitSheetOpen] = useState(false);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Tab 2 States: Services (Local Search)
  const [serviceSearch, setServiceSearch] = useState("");
  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [selectedServiceRoom, setSelectedServiceRoom] = useState<Room | null>(null);

  // Tab 3 States: Bed Board (Local Search)
  const [bedBoardSearch, setBedBoardSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- TAB 1 SEARCH LOGIC (API) ---
  useEffect(() => {
    if (!admissionSearch.trim()) {
      setAdmissionResults([]);
      setHasSearchedAdmissions(false);
      setIsSearchingAdmissions(false);
      return;
    }
    const delayFn = setTimeout(async () => {
      setHasSearchedAdmissions(true);
      setIsSearchingAdmissions(true);
      try {
        const res = await fetch(`http://localhost:4040/api/v1/patients?search=${encodeURIComponent(admissionSearch)}`, getApiOptions);
        if (res.ok) {
          const data = await res.json();
          setAdmissionResults(data.data.patients || []);
        }
      } finally {
        setIsSearchingAdmissions(false);
      }
    }, 500);
    return () => clearTimeout(delayFn);
  }, [admissionSearch]);

  // --- TAB 2 SEARCH LOGIC (LOCAL ZUSTAND) ---
  const filteredInRoomPatients = useMemo(() => {
    const occupied = rooms.filter(r => r.status === "OCCUPIED");
    if (!serviceSearch) return occupied;
    const lower = serviceSearch.toLowerCase();
    return occupied.filter(r =>
      r.currentPatientName?.toLowerCase().includes(lower) ||
      r.currentPatientMrNo?.toLowerCase().includes(lower) ||
      r.roomNumber.toLowerCase().includes(lower)
    );
  }, [rooms, serviceSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Reception & Operations</h1>
        <p className="text-muted-foreground text-sm">Manage admissions, bedside services, and room availability.</p>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm"><CardContent className="p-6"><div className="text-sm text-muted-foreground">Available</div> <span className="text-3xl font-bold text-primary">{stats.available}</span><span className="text-lg text-muted-foreground">/ {stats.total}</span></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-6"><div className="text-sm text-muted-foreground">Occupied</div><div className="text-3xl font-bold">{stats.occupied}</div></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-6"><div className="text-sm text-muted-foreground">Cleaning</div><div className="text-3xl font-bold">{stats.cleaning}</div></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-6"><div className="text-sm text-muted-foreground">Maintenance</div><div className="text-3xl font-bold">{stats.maintenance}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="admissions" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
          <TabsTrigger value="admissions">New Admission</TabsTrigger>
          <TabsTrigger value="services">In-Room Services</TabsTrigger>
          <TabsTrigger value="bedboard">Live Bed Board</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: ADMISSIONS --- */}
        <TabsContent value="admissions" className="space-y-6">
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <Label className="text-lg font-heading font-semibold">Patient Database Search</Label>
              <div className="relative mt-2 max-w-2xl">
                <IconSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Scan or type MR No, Phone, or Name..." value={admissionSearch} onChange={(e) => setAdmissionSearch(e.target.value)} className="pl-10 h-12" />
                {isSearchingAdmissions && <IconLoader2 className="absolute right-3 top-3 h-5 w-5 text-primary animate-spin" />}
              </div>
            </CardContent>
          </Card>

          {hasSearchedAdmissions && (
            <div className="border p-4 rounded-md space-y-4">
              <h2 className="font-bold">Results:</h2>
              {admissionResults.length === 0 && !isSearchingAdmissions ? (
                <div className="space-y-4">
                  <p>No patient found.</p>
                  <Button asChild className="gap-2"><Link to="/receptionist/patients/new" /><IconPlus size={18} /> Add New Patient</Button>
                </div>
              ) : (
                admissionResults.map((patient) => (
                  <div key={patient.mrNumber} className="border p-4 flex justify-between items-center bg-slate-50 rounded">
                    <div>
                      <p className="font-bold">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-muted-foreground">MR: {patient.mrNumber} | Phone: {patient.phone}</p>
                    </div>
                    <Button onClick={() => { setActivePatient(patient); setIsAdmitSheetOpen(true); }}>Assign Room</Button>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* --- TAB 2: IN-ROOM SERVICES --- */}
        <TabsContent value="services" className="space-y-6">
           <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <Label className="text-lg font-heading font-semibold">Search Admitted Patients</Label>
              <div className="relative mt-2 max-w-2xl">
                <IconSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search by Room No, Name, or MR No..." value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)} className="pl-10 h-12" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInRoomPatients.length === 0 ? (
               <p className="text-muted-foreground p-4">No admitted patients match your search.</p>
            ) : (
              filteredInRoomPatients.map(room => (
                <Card key={room.id} className="shadow-sm">
                  <CardContent className="p-5 flex justify-between items-center">
                     <div>
                       <h3 className="font-bold font-heading ml-1">{room.currentPatientName}</h3>
                       <p className="text-sm text-muted-foreground ml-1">Room {room.roomNumber} ({room.roomType.toUpperCase()})</p>
                       {room.currentInvoiceId && (
                        <div
                          className="flex flex-col bg-background border p-2 rounded cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => {navigator.clipboard.writeText(room.currentInvoiceId!); setCopiedId(room.currentInvoiceId!); toast.success("Invoice ID copied"); setTimeout(() => setCopiedId(null), 2000); }} >
                          <span className="text-sm">Copy Current Invoice ID</span>
                          <div className="flex flex-row gap-4"><span className="text-xs font-mono">{room.currentInvoiceId}</span>{copiedId === room.currentInvoiceId ? (<IconCheck size={14} className="text-emerald-500" />) : (<IconCopy size={14} className="text-muted-foreground" />)}</div>
                        </div>
                      )}
                     </div>
                     <Button variant="secondary" className="gap-2" onClick={() => { setSelectedServiceRoom(room); setIsServiceSheetOpen(true); }}>
                       <IconStethoscope size={16} /> Add Services
                     </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

        </TabsContent>

        {/* --- TAB 3: BED BOARD --- */}
        <TabsContent value="bedboard" className="space-y-4">
          <div className="relative max-w-md mb-4">
            <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter beds..." value={bedBoardSearch} onChange={(e) => setBedBoardSearch(e.target.value)} className="pl-9 h-10" />
          </div>
          <LiveBedBoard rooms={rooms} searchTerm={bedBoardSearch} onSuccessRevalidate={revalidate} />
        </TabsContent>
      </Tabs>

      {/* --- SHEETS --- */}
      <RoomBookingSheet open={isAdmitSheetOpen} onOpenChange={setIsAdmitSheetOpen} activePatient={activePatient} onSuccessRevalidate={revalidate} />
      <AssignServiceSheet open={isServiceSheetOpen} onOpenChange={setIsServiceSheetOpen} room={selectedServiceRoom} />
    </div>
  );
}