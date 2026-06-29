// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetFooter,
// } from "@/components/ui/sheet";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import {
//   IconAdjustmentsHorizontal,
//   IconDatabaseEdit,
//   IconFileSignal,
//   IconSearch,
//   IconUserPlus,
// } from "@tabler/icons-react";
// import { getApiOptions } from "@/lib/utils";

// export interface patient {
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

// export interface ServiceType {
//   id: string;
//   name: string;
//   isQueueingEnable: boolean;
//   doctorInvolvement: boolean;
//   description: string;
// }

// export interface Service {
//   id: string;
//   serviceTypeId: string;
//   serviceName: string;
//   basePrice: number;
// }
// // --- MOCK DATA ---
// const MOCK_PATIENTS: patient[] = [
//   {
//     mrNo: "MR-1001",
//     fname: "Ahmed",
//     lname: "Khan",
//     phone: "03001234567",
//     cnic: "42101-1234567-1",
//     dob: "1990-01-01",
//     gender: "Male",
//     bloodGroup: "O+",
//     address: "Karachi",
//   },
// ];

// const SERVICE_TYPES: ServiceType[] = [
//   {
//     id: "st1",
//     name: "Consultation",
//     isQueueingEnable: true,
//     doctorInvolvement: true,
//     description: "Doctor checkup",
//   },
//   {
//     id: "st2",
//     name: "Laboratory",
//     isQueueingEnable: false,
//     doctorInvolvement: false,
//     description: "Pathology tests",
//   },
// ];

// const SERVICES: Service[] = [
//   {
//     id: "s1",
//     serviceTypeId: "st1",
//     serviceName: "General Physician",
//     basePrice: 1500,
//   },
//   {
//     id: "s2",
//     serviceTypeId: "st1",
//     serviceName: "Cardiologist",
//     basePrice: 3000,
//   },
//   {
//     id: "s3",
//     serviceTypeId: "st2",
//     serviceName: "CBC Blood Test",
//     basePrice: 800,
//   },
// ];

// export default function PatientRegistry() {
//   // --- STATE ---
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [searchResults, setSearchResults] = useState<patient[]>([]);
//   const [hasSearched, setHasSearched] = useState<boolean>(false);

//   // Drawer State
//   const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
//   const [drawerMode, setDrawerMode] = useState<"add" | "update" | "assign">(
//     "add",
//   ); // "add" | "update" | "assign"
//   const [activePatient, setActivePatient] = useState<patient | null>(null);

//   // Service Assignment State
//   const [selectedTypeId, setSelectedTypeId] = useState<string>("");
//   const [selectedServiceId, setSelectedServiceId] = useState<string>("");

//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   // --- DEBOUNCE SEARCH LOGIC ---

//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       setSearchResults([]);
//       setHasSearched(false);
//       setCurrentPage(1); // Reset page on clear
//       return;
//     }

//     const delayDebounceFn = setTimeout(async () => {
//       setHasSearched(true);

//       try {
//         // Notice we are passing the currentPage state to the API
//         const response = await fetch(
//           `http://localhost:4040/api/v1/patients?search=${encodeURIComponent(searchTerm)}&page=${currentPage}`,
//           getApiOptions,
//         );

//         if (!response.ok) throw new Error("Failed to fetch search results");

//         const data = await response.json();

//         // If it's page 1, REPLACE the results. If it's page 2+, APPEND the results.
//         if (currentPage === 1) {
//           setSearchResults(data.data.patients || []);
//         } else {
//           setSearchResults((prev) => [...prev, ...(data.data.patients || [])]);
//         }

//         // Save the total pages from the API so we know when to hide the "Load More" button
//         setTotalPages(data.data.pagination.totalPages);
//       } catch (error) {
//         console.error("Search API Error:", error);
//         if (currentPage === 1) setSearchResults([]);
//       }
//     }, 500);

//     return () => clearTimeout(delayDebounceFn);
//   }, [searchTerm, currentPage]); // Add currentPage to the dependency array

//   // --- HANDLERS ---
//   const openForm = (mode: "add" | "update" | "assign", patient = null) => {
//     setDrawerMode(mode);
//     setActivePatient(patient);
//     setIsDrawerOpen(true);

//     // Reset service dropdowns when opening assign mode
//     if (mode === "assign") {
//       setSelectedTypeId("");
//       setSelectedServiceId("");
//     }
//   };

//   // Find the selected service to display its price
//   const activeService = SERVICES.find((s) => s.id === selectedServiceId);
//   const availableServices = SERVICES.filter(
//     (s) => s.serviceTypeId === selectedTypeId,
//   );

//   return (
//     <div className="p-4 max-w-3xl mx-auto space-y-8">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-heading font-bold tracking-tight">
//             Search For Patients Or Assign Service
//           </h1>
//           <p className="text-muted-foreground text-sm">
//             Search for patients who are alraedy in Database, update their info
//             or assign service to them
//           </p>
//         </div>
//         <div className="flex items-end justify-end gap-2">
//           <Button className="gap-2" onClick={() => setIsDrawerOpen(true)}>
//             <IconAdjustmentsHorizontal size={18} />
//             Add Patient
//           </Button>
//         </div>
//       </div>
//       {/* SEARCH AREA */}
//       <Card className="border-0 shadow-sm bg-muted/30">
//         <CardContent className="p-6">
//           <div className="space-y-3 max-w-2xl">
//             <Label className="text-lg font-heading font-semibold">
//               Patient Search
//             </Label>
//             <div className="relative">
//               <IconSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
//               <Input
//                 placeholder="Scan or type MR No, Phone, or CNIC..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1); // Reset to page 1 for a new search
//                 }}
//                 className="pl-10 h-12 text-base bg-background shadow-sm"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* RESULTS AREA */}
//       {hasSearched && (
//         <div className="border p-4 rounded-md space-y-4">
//           <h2 className="font-bold">Results:</h2>

//           {searchResults.length === 0 ? (
//             <div className="space-y-4">
//               <p>No patient found.</p>
//               <Button onClick={() => openForm("add")}>Add New Patient</Button>
//             </div>
//           ) : (
//             searchResults.map((patient) => (
//               <div
//                 key={patient.mrNo}
//                 className="border p-4 flex justify-between items-center bg-slate-50"
//               >
//                 <div>
//                   <p className="font-bold">
//                     {patient.fname} {patient.lname}
//                   </p>
//                   <p className="text-sm">
//                     MR: {patient.mrNo} | Phone: {patient.phone}
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => openForm("update", patient)}
//                   >
//                     Update
//                   </Button>
//                   <Button onClick={() => openForm("assign", patient)}>
//                     Assign Service
//                   </Button>
//                 </div>
//               </div>
//             ))
//           )}
//           {currentPage < totalPages && (
//             <Button
//               variant="outline"
//               className="w-full mt-4"
//               onClick={() => setCurrentPage((prev) => prev + 1)}
//             >
//               Load More Results
//             </Button>
//           )}
//         </div>
//       )}

//       {/* RIGHT DRAWER FOR EVERYTHING */}
//       <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
//         <SheetContent className="overflow-y-auto sm:max-w-md p-5">
//           <SheetHeader>
//             <SheetTitle className="font-heading text-2xl flex items-center gap-2">
//               {drawerMode === "add" && (
//                 <div>
//                   <div className="flex flex-row gap-3 Group">
//                     <IconUserPlus className="text-primary" />
//                     Add Patient
//                   </div>
//                   <p className="text-sm text-slate-400">
//                     Add new patient to the database
//                   </p>
//                 </div>
//               )}
//               {drawerMode === "update" && (
//                 <div>
//                   <div className="flex flex-row gap-3 Group">
//                     <IconDatabaseEdit className="text-primary" />
//                     Update Patient
//                   </div>
//                   <p className="text-sm text-slate-400">
//                     Update the information of existing patient
//                   </p>
//                 </div>
//               )}
//               {drawerMode === "assign" && (
//                 <div>
//                   <div className="flex flex-row gap-3 Group">
//                     <IconFileSignal className="text-primary" />
//                     Assign Service
//                   </div>
//                   <p className="text-sm text-slate-400 ">
//                     Assign Serivce to the patient
//                   </p>
//                 </div>
//               )}
//             </SheetTitle>
//           </SheetHeader>

//           {/* ADD / UPDATE PATIENT FORM */}
//           {(drawerMode === "add" || drawerMode === "update") && (
//             <div className="space-y-4">
//               {drawerMode === "update" && (
//                 <div className="space-y-1">
//                   <Label>MR No</Label>
//                   <Input disabled value={activePatient?.mrNo || ""} />
//                 </div>
//               )}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <Label>First Name</Label>
//                   <Input defaultValue={activePatient?.fname || ""} />
//                 </div>
//                 <div className="space-y-1">
//                   <Label>Last Name</Label>
//                   <Input defaultValue={activePatient?.lname || ""} />
//                 </div>
//               </div>
//               <div className="space-y-1">
//                 <Label>Phone No</Label>
//                 <Input defaultValue={activePatient?.phone || ""} />
//               </div>
//               <div className="space-y-1">
//                 <Label>CNIC</Label>
//                 <Input defaultValue={activePatient?.cnic || ""} />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <Label>DOB</Label>
//                   <Input type="date" defaultValue={activePatient?.dob || ""} />
//                 </div>
//                 <div className="space-y-1">
//                   <Label>Gender</Label>
//                   <Input defaultValue={activePatient?.gender || ""} />
//                 </div>
//               </div>
//               <div className="space-y-1">
//                 <Label>Blood Group</Label>
//                 <Input defaultValue={activePatient?.bloodGroup || ""} />
//               </div>
//               <div className="space-y-1">
//                 <Label>Address</Label>
//                 <Input defaultValue={activePatient?.address || ""} />
//               </div>

//               <Button className="w-full mt-4">Save Patient</Button>
//             </div>
//           )}

//           {/* ASSIGN SERVICE FORM */}
//           {drawerMode === "assign" && (
//             <div className="space-y-6">
//               <div className="bg-slate-100 p-3 text-sm rounded">
//                 Assigning to:{" "}
//                 <strong>
//                   {activePatient?.fname} {activePatient?.lname}
//                 </strong>{" "}
//                 ({activePatient?.mrNo})
//               </div>

//               {/* 1. Select Service Type */}
//               <div className="space-y-2">
//                 <Label>Service Type</Label>
//                 <Select
//                   value={selectedTypeId}
//                   onValueChange={(val) => {
//                     setSelectedTypeId(val);
//                     setSelectedServiceId("");
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Type..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {SERVICE_TYPES.map((type) => (
//                       <SelectItem key={type.id} value={type.id}>
//                         {type.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* 2. Select Actual Service (Disabled until Type is selected) */}
//               <div className="space-y-2">
//                 <Label>Service</Label>
//                 <Select
//                   disabled={!selectedTypeId}
//                   value={selectedServiceId}
//                   onValueChange={setSelectedServiceId}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Service..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {availableServices.map((service) => (
//                       <SelectItem key={service.id} value={service.id}>
//                         {service.serviceName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* 3. Display Price */}
//               <div className="space-y-2">
//                 <Label>Base Price (Rs.)</Label>
//                 <Input
//                   readOnly
//                   value={activeService ? activeService.basePrice : "0"}
//                   className="bg-muted font-bold text-lg"
//                 />
//               </div>
//             </div>
//           )}
//         </SheetContent>
//         <SheetFooter>
//           <Button disabled={!selectedServiceId} className="w-full">
//             Generate Invoice
//           </Button>
//         </SheetFooter>
//       </Sheet>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import { getApiOptions } from "@/lib/utils";
import type { Patient } from "../../types/types";
import { usePatientStore } from "../../store/patient-store";
import { PatientFormSheet } from "../../components/patients/patient-form-sheet";
import { AssignServiceSheet } from "../../components/patients/assign-service-sheet";

export default function PatientRegistry() {
  // Local Search State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Zustand Actions
  const openFormSheet = usePatientStore((state) => state.openFormSheet);
  const openAssignSheet = usePatientStore((state) => state.openAssignSheet);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setCurrentPage(1);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setHasSearched(true);
      try {
        const response = await fetch(
          `http://localhost:4040/api/v1/patients?search=${encodeURIComponent(searchTerm)}&page=${currentPage}`,
          getApiOptions
        );
        if (!response.ok) throw new Error("Failed to fetch search results");

        const data = await response.json();
        if (currentPage === 1) {
          setSearchResults(data.data.patients || []);
        } else {
          setSearchResults((prev) => [...prev, ...(data.data.patients || [])]);
        }
        setTotalPages(data.data.pagination.totalPages);
      } catch (error) {
        console.error("Search API Error:", error);
        if (currentPage === 1) setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Patient Registry & Services</h1>
          <p className="text-muted-foreground text-sm">
            Search database, register patients, and process service billing.
          </p>
        </div>
        <Button className="gap-2" onClick={() => openFormSheet("add")}>
          <IconAdjustmentsHorizontal size={18} />
          Add Patient
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-6">
          <div className="space-y-3 max-w-2xl">
            <Label className="text-lg font-heading font-semibold">Patient Search</Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Scan or type MR No, Phone, or CNIC..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-12 text-base bg-background shadow-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="border p-4 rounded-md space-y-4">
          <h2 className="font-bold">Results:</h2>
          {searchResults.length === 0 ? (
            <div className="space-y-4">
              <p>No patient found.</p>
              <Button onClick={() => openFormSheet("add")}>Register New Patient</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((patient) => (
                <div key={patient.id} className="border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-bold">{patient.firstName} {patient.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      MR: {patient.mrNumber} | Phone: {patient.phone}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => openFormSheet("update", patient)}>
                      Update
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={() => openAssignSheet(patient)}>
                      Assign Service
                    </Button>
                  </div>
                </div>
              ))}
              {currentPage < totalPages && (
                <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentPage((prev) => prev + 1)}>
                  Load More Results
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Render the sheets, they will manage their own state via Zustand! */}
      <PatientFormSheet />
      <AssignServiceSheet />
    </div>
  );
}