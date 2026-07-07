import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  IconUser,
  IconReceipt2,
  IconStethoscope,
  IconBed,
  IconActivityHeartbeat
} from "@tabler/icons-react";

interface Patient {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  cnic: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | string;
  phone: string;
  createdAt?: string;
}

interface PatientLedgerSheetProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientLedgerSheet({ patient, open, onOpenChange }: PatientLedgerSheetProps) {
  if (!patient) return null;

  // In production, you would fetch these logs dynamically based on patient.id
  // Running a query like: SELECT * FROM transactions WHERE patient_id = ? ORDER BY created_at DESC
  const mockLTV = 45500;

  const timelineEvents = [
    { id: 1, date: "April 28, 2026 - 10:30 AM", type: "INVOICE_PAID", title: "Invoice #INV-9021 Paid", amount: "Rs 15,500", icon: IconReceipt2, color: "text-green-600 bg-green-600/10 border-green-600/20" },
    { id: 2, date: "April 26, 2026 - 08:00 AM", type: "ROOM_DISCHARGE", title: "Discharged from GEN-101", detail: "Stayed for 2 Days", icon: IconBed, color: "text-blue-600 bg-blue-600/10 border-blue-600/20" },
    { id: 3, date: "April 24, 2026 - 09:00 PM", type: "ROOM_ADMIT", title: "Admitted to GEN-101", detail: "Emergency Admission", icon: IconBed, color: "text-blue-600 bg-blue-600/10 border-blue-600/20" },
    { id: 4, date: "March 15, 2026 - 11:15 AM", type: "DOCTOR_VISIT", title: "Consultation: Dr. Ayesha Khan", amount: "Rs 2,000", icon: IconStethoscope, color: "text-primary bg-primary/10 border-primary/20" },
    { id: 5, date: "January 15, 2026 - 08:00 AM", type: "SERVICE", title: "Lab: Complete Blood Count", amount: "Rs 800", icon: IconActivityHeartbeat, color: "text-purple-600 bg-purple-600/10 border-purple-600/20" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="font-heading text-2xl flex items-center gap-2">
                {patient.firstName} {patient.lastName}
              </SheetTitle>
              <SheetDescription className="font-mono mt-1 text-primary">
                {patient.mrNumber}
              </SheetDescription>
            </div>
            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
              {patient.gender}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 -mx-1 mt-4 space-y-6">

          {/* Top Level Financials */}
          <div className="bg-muted/20 border border-border/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Lifetime Value
              </span>
              <span className="text-2xl font-heading font-bold text-foreground">
                Rs {mockLTV.toLocaleString()}
              </span>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IconReceipt2 size={24} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-background border rounded-lg p-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="font-mono">{patient.phone}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">CNIC</span>
              <span className="font-mono">{patient.cnic || "N/A"}</span>
            </div>
          </div>

          {/* Chronological Audit Trail */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconUser size={16} className="text-muted-foreground" /> Interaction History
            </h3>

            <div className="relative pl-6 py-2 space-y-6 before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative flex flex-col gap-1">
                  {/* Timeline Node Icon */}
                  <div className={`absolute -left-[1.8rem] h-6 w-6 rounded-full border-2 flex items-center justify-center bg-background shadow-sm ${event.color}`}>
                    <event.icon size={12} stroke={2.5} />
                  </div>

                  {/* Event Details */}
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-foreground">{event.title}</span>
                    {event.amount && (
                      <span className="font-mono text-xs font-bold">{event.amount}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-end">
                    {event.detail ? (
                      <span className="text-xs text-muted-foreground">{event.detail}</span>
                    ) : (
                      <span></span> // Spacer if no detail
                    )}
                    <span className="text-[10px] font-mono text-muted-foreground/70">{event.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
