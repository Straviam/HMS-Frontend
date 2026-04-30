import { useLoaderData } from "react-router";
import {
  IconStethoscope,
  IconClockHour4,
  IconUsers,
  IconUserPlus,
  IconCalendarEvent
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ManageTimingsSheet } from "@/components/doctor/doctor-timing-sheet";
import { OnboardDoctorSheet } from "@/components/doctor/doctor-onboarding-sheet";

// 1. Mapped Types
interface DoctorTiming {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  avgConsultationTime: number;
  maxTokens: number;
  consultationFee: number
  isActive: boolean;
}

interface Doctor {
  id: string;
  name: string; // Joined from users table
  specialization: string;
  isAvailable: boolean;
  timings: DoctorTiming[];
}

interface LoaderData {
  doctors: Doctor[];
  stats: {
    total: number;
    availableNow: number;
    totalTokensToday: number;
  };
}

export async function AdminDoctorLoader(): Promise<LoaderData> {
  // Mocking the JOIN between users, doctors, and doctor_timings
  const mockedDoctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Ayesha Khan",
      specialization: "Cardiology",
      isAvailable: true,
      timings: [{ id: "t1", day: "MONDAY", startTime: "09:00", endTime: "14:00", avgConsultationTime: 15, maxTokens: 20, isActive: true, consultationFee: 3000 }, { id: "t2", day: "TUESDAY", startTime: "10:00", endTime: "16:00", avgConsultationTime: 20, maxTokens: 15, isActive: true, consultationFee: 3000 }, { id: "t3", day: "WEDNESDAY", startTime: "15:00", endTime: "20:00", avgConsultationTime: 10, maxTokens: 30, isActive: true, consultationFee: 3000 }, { id: "t4", day: "MONDAY", startTime: "09:00", endTime: "14:00", avgConsultationTime: 15, maxTokens: 20, isActive: true, consultationFee: 3000 }, { id: "t5", day: "TUESDAY", startTime: "10:00", endTime: "16:00", avgConsultationTime: 20, maxTokens: 15, isActive: true, consultationFee: 3000 }, { id: "t6", day: "WEDNESDAY", startTime: "15:00", endTime: "20:00", avgConsultationTime: 10, maxTokens: 30, isActive: true, consultationFee: 3000 }]
    },
    {
      id: "2",
      name: "Dr. Salman Ali",
      specialization: "Orthopedics",
      isAvailable: false,
      timings: [{ id: "t2", day: "TUESDAY", startTime: "10:00", endTime: "16:00", avgConsultationTime: 20, maxTokens: 15, isActive: true, consultationFee: 3000 }]
    },
    {
      id: "3",
      name: "Dr. Fatima Syed",
      specialization: "Pediatrics",
      isAvailable: true,
      timings: [{ id: "t3", day: "WEDNESDAY", startTime: "15:00", endTime: "20:00", avgConsultationTime: 10, maxTokens: 30, isActive: true, consultationFee: 3000 }]
    },
  ];

  return {
    doctors: mockedDoctors,
    stats: { total: 3, availableNow: 2, totalTokensToday: 65 }
  };
}

export default function AdminDoctorsPage() {
  const { doctors, stats } = useLoaderData() as LoaderData;
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Doctors Registry</h1>
          <p className="text-muted-foreground text-sm">Manage medical staff capacity, specializations, and timings.</p>
        </div>
        <Button className="gap-2 shadow-md shadow-primary/20"
          onClick={() => setIsAddOpen(true)}>
          <IconUserPlus size={18} />
          Onboard Doctor
        </Button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Active Roster</span>
              <IconStethoscope size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">{stats.total}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Available Right Now</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
              </div>
            </div>
            <span className="text-3xl font-heading font-bold text-primary">{stats.availableNow}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Max Capacity (Today)</span>
              <IconUsers size={20} className="text-muted-foreground/50" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold">{stats.totalTokensToday}</span>
              <span className="text-xs text-muted-foreground">Tokens</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid of Doctors */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
        {doctors.map((doc) => (
          <Card key={doc.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold border border-primary/20">
                  {doc.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <CardTitle className="text-lg font-heading font-bold tracking-tight">
                    {doc.name}
                  </CardTitle>
                  <div className="text-sm text-primary font-medium mt-0.5">
                    {doc.specialization}
                  </div>
                </div>
              </div>
              {doc.isAvailable ? (
                <Badge variant="outline" className="text-primary border-primary/50 bg-primary/5 shadow-sm">Available</Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground border">Off Duty</Badge>
              )}
            </CardHeader>

            <CardContent className="flex-1 pb-4">
              <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <IconCalendarEvent size={14} /> Schedule Snapshot
                </div>

                {/* Updated timeline view featuring the Consultation Fee */}
                <div className="space-y-2">
                  {doc.timings.map(t => (
                    <div key={t.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-2 text-sm">
                      {/* Day */}
                      <span className="font-bold text-foreground text-xs">{t.day.substring(0, 3)}</span>

                      {/* Time & Tokens */}
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">{t.startTime} - {t.endTime}</span>
                        <span className="text-[10px] text-muted-foreground/70 uppercase">Max: {t.maxTokens}</span>
                      </div>

                      {/* Fee Tag */}
                      <span className="font-mono text-xs font-medium text-primary bg-primary/5 border border-primary/20 px-2 py-1 rounded shadow-sm">
                        Rs {3000}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <IconClockHour4 size={14} />
                <span>Avg Consult: <strong className="text-foreground">{doc.timings[0]?.avgConsultationTime || 0} min</strong></span>
              </div>
            </CardContent>

            <CardFooter className="pt-0 border-t bg-card/50 px-6 py-3">
              <div className="w-full flex items-center justify-between">
                <Button variant="link" size="sm" className="px-0 text-muted-foreground hover:text-foreground">
                  View transactions
                </Button>
                <Button variant="outline" size="sm" className="h-8 shadow-sm"
                  onClick={() => setSelectedDoctor(doc)}>
                  Edit Timings
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Sheets */}
      <OnboardDoctorSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

      <ManageTimingsSheet
        doctor={selectedDoctor}
        open={!!selectedDoctor}
        onOpenChange={(open) => !open && setSelectedDoctor(null)}
      />
    </div>
  );
}

// TODO: there should view doctor tansactions all transaction instead of view docotor Load
