import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface patient{
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

export interface ServiceType {
  id: string;
  name: string;
  isQueueingEnable: boolean;
  doctorInvolvement: boolean;
  description: string;
}

export interface Service {
  id: string;
  serviceTypeId: string;
  serviceName: string;
  basePrice: number;
}
// --- MOCK DATA ---
const MOCK_PATIENTS: patient[] = [
  { mrNo: "MR-1001", fname: "Ahmed", lname: "Khan", phone: "03001234567", cnic: "42101-1234567-1", dob: "1990-01-01", gender: "Male", bloodGroup: "O+", address: "Karachi" },
];

const SERVICE_TYPES: ServiceType[] = [
  { id: "st1", name: "Consultation", isQueueingEnable: true, doctorInvolvement: true, description: "Doctor checkup" },
  { id: "st2", name: "Laboratory", isQueueingEnable: false, doctorInvolvement: false, description: "Pathology tests" },
];

const SERVICES: Service[] = [
  { id: "s1", serviceTypeId: "st1", serviceName: "General Physician", basePrice: 1500 },
  { id: "s2", serviceTypeId: "st1", serviceName: "Cardiologist", basePrice: 3000 },
  { id: "s3", serviceTypeId: "st2", serviceName: "CBC Blood Test", basePrice: 800 },
];

export default function PatientRegistry() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<patient[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "update" | "assign">("add"); // "add" | "update" | "assign"
  const [activePatient, setActivePatient] = useState<patient | null>(null);

  // Service Assignment State
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // --- DEBOUNCE SEARCH LOGIC ---
  useEffect(() => {
    // 1. If search is empty, clear results and stop
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    // 2. Set a timer to wait 500ms after the user stops typing
    const delayDebounceFn = setTimeout(() => {
      setHasSearched(true);
      // Replace this mock filter with your actual API call: fetch(`/api/patients?q=${searchTerm}`)
      const results = MOCK_PATIENTS.filter(p =>
        p.phone.includes(searchTerm) ||
        p.cnic.includes(searchTerm) ||
        p.mrNo.includes(searchTerm)
      );
      setSearchResults(results);
    }, 500);

    // 3. Cleanup function resets the timer if they type again before 500ms
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- HANDLERS ---
  const openForm = (mode: "add" | "update" | "assign", patient = null) => {
    setDrawerMode(mode);
    setActivePatient(patient);
    setIsDrawerOpen(true);

    // Reset service dropdowns when opening assign mode
    if (mode === "assign") {
      setSelectedTypeId("");
      setSelectedServiceId("");
    }
  };

  // Find the selected service to display its price
  const activeService = SERVICES.find(s => s.id === selectedServiceId);
  const availableServices = SERVICES.filter(s => s.serviceTypeId === selectedTypeId);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-8">

      {/* SEARCH AREA */}
      <div className="space-y-2">
        <Label>Search Patient (MR, Phone, CNIC)</Label>
        <Input
          placeholder="Start typing to search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* RESULTS AREA */}
      {hasSearched && (
        <div className="border p-4 rounded-md space-y-4">
          <h2 className="font-bold">Results:</h2>

          {searchResults.length === 0 ? (
            <div className="space-y-4">
              <p>No patient found.</p>
              <Button onClick={() => openForm("add")}>Add New Patient</Button>
            </div>
          ) : (
            searchResults.map(patient => (
              <div key={patient.mrNo} className="border p-4 flex justify-between items-center bg-slate-50">
                <div>
                  <p className="font-bold">{patient.fname} {patient.lname}</p>
                  <p className="text-sm">MR: {patient.mrNo} | Phone: {patient.phone}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openForm("update", patient)}>Update</Button>
                  <Button onClick={() => openForm("assign", patient)}>Assign Service</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RIGHT DRAWER FOR EVERYTHING */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md p-5">
          <SheetHeader>
            <SheetTitle className="uppercase mb-4">
              {drawerMode === "add" && "Add Patient"}
              {drawerMode === "update" && "Update Patient"}
              {drawerMode === "assign" && "Assign Service"}
            </SheetTitle>
          </SheetHeader>

          {/* ADD / UPDATE PATIENT FORM */}
          {(drawerMode === "add" || drawerMode === "update") && (
            <div className="space-y-4">
              {drawerMode === "update" && (
                <div className="space-y-1"><Label>MR No</Label><Input disabled value={activePatient?.mrNo || ""} /></div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>First Name</Label><Input defaultValue={activePatient?.fname || ""} /></div>
                <div className="space-y-1"><Label>Last Name</Label><Input defaultValue={activePatient?.lname || ""} /></div>
              </div>
              <div className="space-y-1"><Label>Phone No</Label><Input defaultValue={activePatient?.phone || ""} /></div>
              <div className="space-y-1"><Label>CNIC</Label><Input defaultValue={activePatient?.cnic || ""} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>DOB</Label><Input type="date" defaultValue={activePatient?.dob || ""} /></div>
                <div className="space-y-1"><Label>Gender</Label><Input defaultValue={activePatient?.gender || ""} /></div>
              </div>
              <div className="space-y-1"><Label>Blood Group</Label><Input defaultValue={activePatient?.bloodGroup || ""} /></div>
              <div className="space-y-1"><Label>Address</Label><Input defaultValue={activePatient?.address || ""} /></div>

              <Button className="w-full mt-4">Save Patient</Button>
            </div>
          )}

          {/* ASSIGN SERVICE FORM */}
          {drawerMode === "assign" && (
            <div className="space-y-6">
              <div className="bg-slate-100 p-3 text-sm rounded">
                Assigning to: <strong>{activePatient?.fname} {activePatient?.lname}</strong> ({activePatient?.mrNo})
              </div>

              {/* 1. Select Service Type */}
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={selectedTypeId} onValueChange={(val) => { setSelectedTypeId(val); setSelectedServiceId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select Type..." /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Select Actual Service (Disabled until Type is selected) */}
              <div className="space-y-2">
                <Label>Service</Label>
                <Select disabled={!selectedTypeId} value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                  <SelectContent>
                    {availableServices.map(service => (
                      <SelectItem key={service.id} value={service.id}>{service.serviceName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Display Price */}
              <div className="space-y-2">
                <Label>Base Price (Rs.)</Label>
                <Input readOnly value={activeService ? activeService.basePrice : "0"} className="bg-muted font-bold text-lg" />
              </div>

              <Button disabled={!selectedServiceId} className="w-full">Generate Invoice</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}