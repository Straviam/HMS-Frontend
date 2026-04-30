import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  IconUsers,
  IconTrendingUp,
  IconChartPie,
  IconSearch,
  IconFileExport,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { PatientLedgerSheet } from "@/components/patients/admin-patient-ledger";

interface Patient {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  cnic: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  createdAt: string;
}

interface LoaderData {
  patients: Patient[];
  stats: {
    totalPatients: number;
    newThisWeek: number;
    demographics: { male: number; female: number; other: number };
  };
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
}

// Data Loader (Simulating a paginated database query)
export async function adminPatientLoader(): Promise<LoaderData> {
  const mockedPatients: Patient[] = [
    { id: "1", mrNumber: "MR-2026-0001", firstName: "Ali", lastName: "Ahmed", cnic: "42101-1234567-1", gender: "MALE", phone: "0300-1234567", createdAt: "2026-01-15T08:00:00Z" },
    { id: "2", mrNumber: "MR-2026-0002", firstName: "Sana", lastName: "Khan", cnic: "42101-7654321-2", gender: "FEMALE", phone: "0333-9876543", createdAt: "2026-02-20T10:00:00Z" },
    { id: "3", mrNumber: "MR-2026-0003", firstName: "Usman", lastName: "Tariq", cnic: null, gender: "MALE", phone: "0345-1122334", createdAt: "2026-04-28T09:30:00Z" },
    { id: "4", mrNumber: "MR-2026-0004", firstName: "Fatima", lastName: "Zahra", cnic: "42201-5556667-8", gender: "FEMALE", phone: "0311-9988776", createdAt: "2026-04-29T14:15:00Z" },
    { id: "5", mrNumber: "MR-2026-0005", firstName: "Zain", lastName: "Malik", cnic: "42101-9998887-3", gender: "MALE", phone: "0300-5554443", createdAt: "2026-04-30T11:00:00Z" },
  ];

  return {
    patients: mockedPatients,
    stats: { totalPatients: 1542, newThisWeek: 38, demographics: { male: 55, female: 44, other: 1 } },
    pagination: { page: 1, totalPages: 12, totalCount: 1542 }
  };
}

// Main Component
export default function AdminPatientsPage() {
  const { patients, stats, pagination } = useLoaderData() as LoaderData;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Patient Registry</h1>
          <p className="text-muted-foreground text-sm">Master ledger of all registered demographics and interactions.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <IconFileExport size={18} /> Export CSV
        </Button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Registered</span>
              <IconUsers size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">{stats.totalPatients.toLocaleString()}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Registration Velocity</span>
              <IconTrendingUp size={20} className="text-primary/70" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-primary">+{stats.newThisWeek}</span>
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Demographics (M/F)</span>
              <IconChartPie size={20} className="text-muted-foreground/50" />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-full bg-muted rounded-full h-2.5 flex overflow-hidden">
                <div className="bg-blue-500/80 h-2.5" style={{ width: `${stats.demographics.male}%` }}></div>
                <div className="bg-pink-500/80 h-2.5" style={{ width: `${stats.demographics.female}%` }}></div>
              </div>
              <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
                {stats.demographics.male}% / {stats.demographics.female}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High-Density Data Table Section */}
      <Card className="shadow-sm border-border/50">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by MR Number, CNIC, or Phone..."
              className="pl-10 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[150px]">MR Number</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>CNIC</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-mono font-medium text-primary">
                  {patient.mrNumber}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {patient.firstName} {patient.lastName}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-sm">
                  {patient.cnic || <span className="text-muted-foreground/50 italic">Not Provided</span>}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-sm">
                  {patient.phone}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wider bg-background">
                    {patient.gender}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    Inspect Ledger
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Showing <strong className="text-foreground">{(pagination.page - 1) * 50 + 1}</strong> to <strong className="text-foreground">{Math.min(pagination.page * 50, pagination.totalCount)}</strong> of <strong className="text-foreground">{pagination.totalCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page === 1} className="h-8 w-8 p-0">
              <IconChevronLeft size={16} />
            </Button>
            <div className="font-medium px-2">Page {pagination.page} of {pagination.totalPages}</div>
            <Button variant="outline" size="sm" disabled={pagination.page === pagination.totalPages} className="h-8 w-8 p-0">
              <IconChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Patient Ledger Sheet: details of patient what they have done */}
      <PatientLedgerSheet
        patient={selectedPatient}
        open={!!selectedPatient}
        onOpenChange={(open) => !open && setSelectedPatient(null)}
      />
    </div>
  );
}
