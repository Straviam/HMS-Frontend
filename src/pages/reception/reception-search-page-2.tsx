import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import { getApiOptions, API_BASE_URL } from "@/lib/utils";
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

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setCurrentPage(1);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setHasSearched(true);
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/patients?search=${encodeURIComponent(searchTerm)}&page=${currentPage}`,
          getApiOptions,
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
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Patient Registry & Services
          </h1>
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
            <Label className="text-lg font-heading font-semibold">
              Patient Search
            </Label>
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
          {isLoading ? (
            "Searching..."
          ) : (
            <div>
              <h2 className="font-bold">Results:</h2>
              {searchResults.length === 0 ? (
                <div className="space-y-4">
                  <p>No patient found.</p>
                  <Button onClick={() => openFormSheet("add")}>
                    Register New Patient
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-bold">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          MR: {patient.mrNumber} | Phone: {patient.phone}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => openFormSheet("update", patient)}
                        >
                          Update
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          onClick={() => openAssignSheet(patient)}
                        >
                          Assign Service
                        </Button>
                      </div>
                    </div>
                  ))}
                  {currentPage < totalPages && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Load More Results
                    </Button>
                  )}
                </div>
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
