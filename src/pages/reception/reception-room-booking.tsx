// import React, { useState, useEffect, useMemo } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";

// // 1. STRICT TYPESCRIPT INTERFACES
// export interface Patient {
//   mrNo: string;
//   fname: string;
//   lname: string;
//   phone: string;
//   cnic: string;
//   dob: string;
//   gender: string;
//   bloodGroup: string;
//   address: string;
// }

// export interface Room {
//   id: string;
//   roomNO: string;
//   roomType: string;
//   pricePerDay: number;
//   status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
//   lastCleanedAt?: string;
//   createdAt?: string;
// }

// // --- MOCK DATA (To be replaced by APIs) ---
// const MOCK_PATIENTS: Patient[] = [
//   { mrNo: "MR-1001", fname: "Ahmed", lname: "Khan", phone: "03001234567", cnic: "42101-1234567-1", dob: "1990-01-01", gender: "Male", bloodGroup: "O+", address: "Karachi" },
//   { mrNo: "MR-1002", fname: "Fatima", lname: "Ali", phone: "03009876543", cnic: "42101-9876543-2", dob: "1985-05-15", gender: "Female", bloodGroup: "A+", address: "Lahore" }
// ];

// const MOCK_ALL_ROOMS: Room[] = [
//   { id: "1", roomNO: "ICU-01", roomType: "ICU", pricePerDay: 5000, status: "Occupied" },
//   { id: "2", roomNO: "ICU-02", roomType: "ICU", pricePerDay: 5000, status: "Available" },
//   { id: "3", roomNO: "GEN-101", roomType: "General Ward", pricePerDay: 1500, status: "Available" },
//   { id: "4", roomNO: "GEN-102", roomType: "General Ward", pricePerDay: 1500, status: "Available" },
//   { id: "5", roomNO: "VIP-204", roomType: "VIP Suite", pricePerDay: 12000, status: "Available" },
// ];

// export default function RoomAdmissionUI() {
//   // --- STATE ---
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [searchResults, setSearchResults] = useState<Patient[]>([]);
//   const [hasSearched, setHasSearched] = useState<boolean>(false);

//   // Sheet State
//   const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
//   const [activePatient, setActivePatient] = useState<Patient | null>(null);
//   const [selectedType, setSelectedType] = useState<string>("");
//   const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

//   // --- API DATA SIMULATION ---
//   // TODO: API ENDPOINT - GET /api/rooms
//   // Fetch your rooms data in a useEffect on mount and set it to a state instead of using this mock.
//   const allRoomsFromServer = MOCK_ALL_ROOMS;

//   // --- FRONTEND DATA DERIVATION ---
//   const availableRooms = useMemo<Room[]>(() =>
//     allRoomsFromServer.filter(r => r.status === "Available")
//   , [allRoomsFromServer]);

//   // Calculate dynamic stats for the top divs
//   const roomStats = useMemo(() => {
//     const counts: Record<string, number> = {};
//     availableRooms.forEach(room => {
//       counts[room.roomType] = (counts[room.roomType] || 0) + 1;
//     });
//     return counts;
//   }, [availableRooms]);

//   const availableRoomTypes = Object.keys(roomStats);

//   const roomsToShow = useMemo<Room[]>(() =>
//     availableRooms.filter(r => r.roomType === selectedType)
//   , [availableRooms, selectedType]);

//   // --- DEBOUNCED SEARCH LOGIC ---
//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       setSearchResults([]);
//       setHasSearched(false);
//       return;
//     }

//     const delayDebounceFn = setTimeout(() => {
//       setHasSearched(true);

//       // TODO: API ENDPOINT - GET /api/patients?search=${searchTerm}
//       // Replace this mock filter with your actual fetch call
//       const normalizedTerm = searchTerm.toLowerCase();
//       const results = MOCK_PATIENTS.filter(p =>
//         p.phone.includes(searchTerm) ||
//         p.cnic.includes(searchTerm) ||
//         p.mrNo.toLowerCase().includes(normalizedTerm)
//       );

//       setSearchResults(results);
//     }, 500);

//     return () => clearTimeout(delayDebounceFn);
//   }, [searchTerm]);

//   // --- HANDLERS ---
//   const openAdmissionSheet = (patient: Patient) => {
//     setActivePatient(patient);
//     setSelectedType("");
//     setSelectedRoom(null);
//     setIsSheetOpen(true);
//   };

//   const handleConfirmAdmission = async () => {
//     if (!activePatient || !selectedRoom) return;

//     // TODO: API ENDPOINT - POST /api/admissions
//     /* try {
//         await axios.post('/api/admissions', {
//           patientId: activePatient.mrNo,
//           roomId: selectedRoom.id
//         });
//         // On success: trigger a re-fetch of your rooms to update the stats
//       } catch(error) { ... }
//     */

//     alert(`Success! Admitted ${activePatient.fname} ${activePatient.lname} to ${selectedRoom.roomNO}.`);

//     setIsSheetOpen(false);
//     setActivePatient(null);
//     setSearchTerm("");
//   };

//   return (
//     <div className="p-4 max-w-5xl mx-auto space-y-6">

//       {/* 1. SEARCH AREA & ROOM STATS */}
//       <Card className="border-0 shadow-sm bg-primary/5">
//         <CardContent className="p-6 space-y-6">

//           <div className="space-y-3">
//             <Label className="text-lg font-heading font-semibold text-primary">Patient Admission Search</Label>
//             <Input
//               placeholder="Scan or type MR No, Phone, or CNIC..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="h-14 text-lg shadow-inner bg-white max-w-2xl"
//             />
//           </div>

//           {/* DYNAMIC ROOM AVAILABILITY DIVS */}
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-4 border-t border-primary/10">
//             {/* Total Available Block */}
//             <div className="bg-primary text-primary-foreground p-3 rounded-lg flex flex-col justify-center items-center shadow-sm">
//               <span className="text-2xl font-bold">{availableRooms.length}</span>
//               <span className="text-xs uppercase tracking-wider opacity-90">Total Available</span>
//             </div>

//             {/* Dynamic Type Blocks */}
//             {Object.entries(roomStats).map(([type, count]) => (
//               <div key={type} className="bg-white border border-primary/20 p-3 rounded-lg flex flex-col justify-center items-center shadow-sm">
//                 <span className="text-2xl font-bold text-slate-700">{count}</span>
//                 <span className="text-xs uppercase tracking-wider text-muted-foreground">{type}</span>
//               </div>
//             ))}
//           </div>

//         </CardContent>
//       </Card>

//       {/* 2. SEARCH RESULTS AREA */}
//       {hasSearched && (
//         <div className="space-y-4 animate-in fade-in duration-300">
//           <h2 className="font-bold text-xl">Search Results</h2>

//           {searchResults.length === 0 ? (
//              <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
//                <p className="text-muted-foreground">No patient found matching "{searchTerm}".</p>
//              </div>
//           ) : (
//             <div className="grid gap-3">
//               {searchResults.map(patient => (
//                 // EXACT Patient Card styling from previous component
//                 <Card key={patient.mrNo} className="overflow-hidden">
//                   <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-0">
//                     <div className="p-4 sm:px-6 w-full">
//                       <p className="font-bold text-lg">{patient.fname} {patient.lname}</p>
//                       <p className="text-sm text-muted-foreground mt-1">MR: {patient.mrNo} • Phone: {patient.phone}</p>
//                     </div>
//                     <div className="flex gap-2 sm:px-6 w-full sm:w-auto mt-4 sm:mt-0 sm:border-l sm:h-20 items-center bg-slate-50/50">
//                       <Button onClick={() => openAdmissionSheet(patient)}>Assign Room</Button>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* 3. THE ADMISSION SHEET (Drawer) */}
//       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//         <SheetContent className="sm:max-w-md overflow-y-auto p-6">
//           <SheetHeader className="mb-6">
//             <SheetTitle className="uppercase tracking-wider text-primary">Inpatient Admission</SheetTitle>
//             <SheetDescription>
//               Assigning a bed for <strong>{activePatient?.fname} {activePatient?.lname}</strong>
//             </SheetDescription>
//           </SheetHeader>

//           <div className="space-y-6">
//             {/* Patient Context Summary */}
//             <div className="bg-slate-100 p-4 text-sm rounded-lg flex items-center justify-between border border-slate-200">
//               <div>
//                 <p className="text-muted-foreground text-xs uppercase tracking-wider">Patient</p>
//                 <strong className="text-base">{activePatient?.fname} {activePatient?.lname}</strong>
//               </div>
//               <div className="text-right">
//                 <p className="text-muted-foreground text-xs uppercase tracking-wider">MR No</p>
//                 <strong>{activePatient?.mrNo}</strong>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label>Required Level of Care</Label>
//               <Select
//                 {...(selectedType ? { value: selectedType } : {})}
//                 onValueChange={(val: string) => {
//                   setSelectedType(val);
//                   setSelectedRoom(null);
//                 }}
//               >
//                 <SelectTrigger className="h-12 text-lg">
//                   <SelectValue placeholder="Select Category..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableRoomTypes.map(type => (
//                     <SelectItem key={type} value={type}>{type}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {selectedType && (
//               <div className="space-y-3 border-t pt-4">
//                 <Label>Available {selectedType} Beds</Label>

//                 {roomsToShow.length === 0 ? (
//                   <p className="text-sm text-destructive font-medium p-4 bg-destructive/10 rounded-md">
//                     No available beds for this category.
//                   </p>
//                 ) : (
//                   <div className="grid grid-cols-2 gap-3">
//                     {roomsToShow.map(room => (
//                       <div
//                         key={room.id}
//                         onClick={() => setSelectedRoom(room)}
//                         className={`
//                           cursor-pointer border-2 rounded-xl p-4 transition-all text-center
//                           ${selectedRoom?.id === room.id
//                             ? "bg-primary/10 border-primary ring-2 ring-primary/20 ring-offset-1"
//                             : "bg-white hover:border-primary/40 border-muted"}
//                         `}
//                       >
//                         <p className="font-bold text-lg">{room.roomNO}</p>
//                         <p className="text-sm text-muted-foreground font-medium mt-1">Rs {room.pricePerDay}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="pt-6 border-t mt-auto">
//               <Button
//                 className="w-full h-14 text-lg"
//                 disabled={!selectedRoom}
//                 onClick={handleConfirmAdmission}
//               >
//                 {selectedRoom
//                   ? `Confirm Booking (${selectedRoom.roomNO})`
//                   : "Please select a room"}
//               </Button>
//             </div>
//           </div>
//         </SheetContent>
//       </Sheet>
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 1. STRICT TYPESCRIPT INTERFACES
export interface Patient {
  mrNo: string;
  fname: string;
  lname: string;
  phone: string;
  cnic: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  address: string;
}

export interface Room {
  id: string;
  roomNO: string;
  roomType: string;
  pricePerDay: number;
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
  lastCleanedAt?: string;
  createdAt?: string;
  // Included for the frontend to show who is currently in the room
  currentPatientName?: string;
  currentPatientMrNo?: string;
}

// --- MOCK DATA (To be replaced by APIs) ---
const MOCK_PATIENTS: Patient[] = [
  { mrNo: "MR-1001", fname: "Ahmed", lname: "Khan", phone: "03001234567", cnic: "42101-1234567-1", dob: "1990-01-01", gender: "Male", bloodGroup: "O+", address: "Karachi" },
  { mrNo: "MR-1002", fname: "Fatima", lname: "Ali", phone: "03009876543", cnic: "42101-9876543-2", dob: "1985-05-15", gender: "Female", bloodGroup: "A+", address: "Lahore" }
];

const MOCK_ALL_ROOMS: Room[] = [
  { id: "1", roomNO: "ICU-01", roomType: "ICU", pricePerDay: 5000, status: "Occupied", currentPatientName: "Fatima Ali", currentPatientMrNo: "MR-1002" },
  { id: "2", roomNO: "ICU-02", roomType: "ICU", pricePerDay: 5000, status: "Available" },
  { id: "3", roomNO: "GEN-101", roomType: "General Ward", pricePerDay: 1500, status: "Available" },
  { id: "4", roomNO: "GEN-102", roomType: "General Ward", pricePerDay: 1500, status: "Cleaning" },
  { id: "5", roomNO: "VIP-204", roomType: "VIP Suite", pricePerDay: 12000, status: "Occupied", currentPatientName: "John Doe", currentPatientMrNo: "MR-9999" },
];

export default function RoomAdmissionUI() {
  // --- STATE: ADMISSIONS ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Sheet State: Admission
  const [isAdmitSheetOpen, setIsAdmitSheetOpen] = useState<boolean>(false);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Sheet State: Bed Management / Discharge
  const [isManageSheetOpen, setIsManageSheetOpen] = useState<boolean>(false);
  const [manageRoom, setManageRoom] = useState<Room | null>(null);

  // --- API DATA SIMULATION ---
  const allRoomsFromServer = MOCK_ALL_ROOMS;

  // --- FRONTEND DATA DERIVATION ---
  const availableRooms = useMemo<Room[]>(() =>
    allRoomsFromServer.filter(r => r.status === "Available")
  , [allRoomsFromServer]);

  const roomStats = useMemo(() => {
    const counts: Record<string, number> = {};
    availableRooms.forEach(room => {
      counts[room.roomType] = (counts[room.roomType] || 0) + 1;
    });
    return counts;
  }, [availableRooms]);

  const availableRoomTypes = Object.keys(roomStats);

  const roomsToShowForAdmission = useMemo<Room[]>(() =>
    availableRooms.filter(r => r.roomType === selectedType)
  , [availableRooms, selectedType]);

  // --- DEBOUNCED SEARCH LOGIC ---
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setHasSearched(true);
      // TODO: API ENDPOINT - GET /api/patients?search=${searchTerm}
      const normalizedTerm = searchTerm.toLowerCase();
      const results = MOCK_PATIENTS.filter(p =>
        p.phone.includes(searchTerm) ||
        p.cnic.includes(searchTerm) ||
        p.mrNo.toLowerCase().includes(normalizedTerm)
      );
      setSearchResults(results);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- HANDLERS: ADMISSION ---
  const openAdmissionSheet = (patient: Patient) => {
    setActivePatient(patient);
    setSelectedType("");
    setSelectedRoom(null);
    setIsAdmitSheetOpen(true);
  };

  const handleConfirmAdmission = async () => {
    if (!activePatient || !selectedRoom) return;
    // TODO: API ENDPOINT - POST /api/admissions (Create booking, set room to Occupied)
    alert(`Success! Admitted ${activePatient.fname} to ${selectedRoom.roomNO}.`);
    setIsAdmitSheetOpen(false);
    setActivePatient(null);
    setSearchTerm("");
  };

  // --- HANDLERS: DISCHARGE ---
  const openManageSheet = (room: Room) => {
    setManageRoom(room);
    setIsManageSheetOpen(true);
  };

  const handleDischargePatient = async () => {
    if (!manageRoom) return;
    // TODO: API ENDPOINT - POST /api/discharge (End booking, set room to Cleaning)
    alert(`Discharged patient from ${manageRoom.roomNO}. Room status changed to 'Cleaning'.`);
    setIsManageSheetOpen(false);
    setManageRoom(null);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">

      {/* GLOBAL ROOM STATS */}
      <Card className="border-0 shadow-sm bg-primary/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg flex flex-col justify-center items-center shadow-sm">
              <span className="text-2xl font-bold">{availableRooms.length}</span>
              <span className="text-xs uppercase tracking-wider opacity-90">Total Available</span>
            </div>
            {Object.entries(roomStats).map(([type, count]) => (
              <div key={type} className="bg-white border border-primary/20 p-3 rounded-lg flex flex-col justify-center items-center shadow-sm">
                <span className="text-2xl font-bold text-slate-700">{count}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TABS: ADMISSIONS vs BED BOARD */}
      <Tabs defaultValue="admissions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="admissions">New Admission</TabsTrigger>
          <TabsTrigger value="bedboard">Bed Board (All Rooms)</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: ADMISSIONS --- */}
        <TabsContent value="admissions" className="space-y-6">
          <div className="space-y-3">
            <Label className="text-lg font-heading font-semibold text-primary">Patient Admission Search</Label>
            <Input
              placeholder="Scan or type MR No, Phone, or CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 text-lg shadow-inner bg-white max-w-2xl"
            />
          </div>

          {hasSearched && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="font-bold text-xl">Search Results</h2>
              {searchResults.length === 0 ? (
                 <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
                   <p className="text-muted-foreground">No patient found matching "{searchTerm}".</p>
                 </div>
              ) : (
                <div className="grid gap-3">
                  {searchResults.map(patient => (
                    <Card key={patient.mrNo} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-0">
                        <div className="p-4 sm:px-6 w-full">
                          <p className="font-bold text-lg">{patient.fname} {patient.lname}</p>
                          <p className="text-sm text-muted-foreground mt-1">MR: {patient.mrNo} • Phone: {patient.phone}</p>
                        </div>
                        <div className="flex gap-2 sm:px-6 w-full sm:w-auto mt-4 sm:mt-0 sm:border-l sm:h-20 items-center bg-slate-50/50">
                          <Button onClick={() => openAdmissionSheet(patient)}>Assign Room</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* --- TAB 2: BED BOARD --- */}
        <TabsContent value="bedboard" className="space-y-6 animate-in fade-in duration-300">
          <h2 className="font-bold text-xl mb-4">Current Ward Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allRoomsFromServer.map(room => (
              <Card
                key={room.id}
                className={`overflow-hidden border-l-4 transition-all ${
                  room.status === 'Available' ? 'border-l-emerald-500' :
                  room.status === 'Occupied' ? 'border-l-red-500 cursor-pointer hover:shadow-md' :
                  room.status === 'Cleaning' ? 'border-l-yellow-500' : 'border-l-slate-500'
                }`}
                onClick={() => room.status === 'Occupied' && openManageSheet(room)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{room.roomNO}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      room.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                      room.status === 'Occupied' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{room.roomType}</p>

                  {room.status === 'Occupied' && (
                    <div className="mt-3 pt-3 border-t text-sm bg-red-50/50 -mx-4 -mb-4 p-4">
                      <p className="font-semibold text-slate-800">{room.currentPatientName}</p>
                      <p className="text-muted-foreground text-xs">{room.currentPatientMrNo}</p>
                      <p className="text-xs text-red-600 font-medium mt-2">Click to Manage / Discharge</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- SHEET 1: ADMISSION (Unchanged logic) --- */}
      <Sheet open={isAdmitSheetOpen} onOpenChange={setIsAdmitSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="uppercase tracking-wider text-primary">Inpatient Admission</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            {/* Abbreviated for space, exact same content as previous component */}
            <div className="bg-slate-100 p-4 text-sm rounded-lg flex justify-between border">
              <div><p className="text-xs uppercase">Patient</p><strong>{activePatient?.fname} {activePatient?.lname}</strong></div>
              <div className="text-right"><p className="text-xs uppercase">MR No</p><strong>{activePatient?.mrNo}</strong></div>
            </div>
            <div className="space-y-2">
              <Label>Required Level of Care</Label>
              <Select {...(selectedType ? { value: selectedType } : {})} onValueChange={(val) => { setSelectedType(val); setSelectedRoom(null); }}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select Category..." /></SelectTrigger>
                <SelectContent>{availableRoomTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {selectedType && (
              <div className="space-y-3 border-t pt-4">
                <Label>Available {selectedType} Beds</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roomsToShowForAdmission.map(room => (
                    <div key={room.id} onClick={() => setSelectedRoom(room)} className={`cursor-pointer border-2 rounded-xl p-4 text-center ${selectedRoom?.id === room.id ? "border-primary ring-2 ring-primary/20" : "bg-white border-muted"}`}>
                      <p className="font-bold text-lg">{room.roomNO}</p>
                      <p className="text-sm text-muted-foreground mt-1">Rs {room.pricePerDay}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button className="w-full h-14 mt-auto" disabled={!selectedRoom} onClick={handleConfirmAdmission}>
              {selectedRoom ? `Confirm Booking (${selectedRoom.roomNO})` : "Select a room"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- SHEET 2: DISCHARGE / MANAGE --- */}
      <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
        <SheetContent className="sm:max-w-md p-6 border-l-red-500 border-l-4">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-red-600">Manage Occupied Room</SheetTitle>
            <SheetDescription>Room <strong>{manageRoom?.roomNO}</strong></SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg space-y-2">
              <Label className="text-red-800">Current Occupant</Label>
              <p className="font-bold text-lg text-slate-900">{manageRoom?.currentPatientName}</p>
              <p className="text-sm text-slate-600">MR: {manageRoom?.currentPatientMrNo}</p>
            </div>

            <div className="space-y-4 pt-6 border-t mt-auto">
              <Button
                variant="destructive"
                className="w-full h-14 text-lg"
                onClick={handleDischargePatient}
              >
                Discharge Patient & Free Room
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                This will finalize the billing and mark the room as "Needs Cleaning".
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}