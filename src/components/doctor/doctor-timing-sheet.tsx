import { API_BASE_URL } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { IconClockHour4, IconPlus, IconTrash, IconReceipt2 } from "@tabler/icons-react";
import { useState } from "react";
import { useRevalidator } from "react-router";
import { toast } from "sonner";

interface Timing {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  avgConsultationTime: number;
  maxTokens: number;
  consultationFee: number;
}

interface Doctor {
  id: string;
  doctorName: string;
  specialization: string;
  isAvailable: boolean;
  timings?: Timing[];
}

interface ManageTimingsSheetProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTimingsSheet({ doctor, open, onOpenChange }: ManageTimingsSheetProps) {
  // TODO: instead of multiple state maybe one state will be better contaning all these attributes
  const [day, setDay] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [avgConsultationTime, setAvgConsultationTime] = useState<number>(15);
  const [maxTokens, setMaxTokens] = useState<number>(20);
  const [consultationFee, setConsultationFee] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const revalidator = useRevalidator();

  const addTimingHandler = async (doctorId: string) => {
    // TODO: validate the input before calling 
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/timing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          day: day,
          startTime: startTime,
          endTime: endTime,
          avgConsultationTime: avgConsultationTime,
          maxTokens: maxTokens,
          consultationFee: consultationFee,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate()
      toast.success(result.message || "sucesss")

    } catch (error) {
      console.error("Failed to add timing:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong"
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const deleteTiming = async (timingId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/timing/${timingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate()
      toast.success(result.message || "sucesss")

    } catch (error) {
      console.error("Failed to delete timing:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong"
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (!doctor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Manage Schedule</SheetTitle>
          <SheetDescription>
            Configure consultation blocks and pricing for <strong className="text-foreground">{doctor.doctorName}</strong>.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 -mx-1 mt-4">

          {/* TOP SECTION: Add New Timing Slot (The "Insert") */}
          <div className="bg-muted/20 border border-border/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconPlus size={16} className="text-primary" /> Issue New Schedule Block
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="grid gap-2 col-span-2">
                <Label>Day of Week</Label>
                <Select value={day} onValueChange={(value) => setDay(value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input type="time" className="bg-background"
                  value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input type="time" className="bg-background"
                  value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Avg Consult (mins)</Label>
                <Input type="number" defaultValue={15} className="bg-background"
                  value={avgConsultationTime}
                  onChange={(e) => setAvgConsultationTime(parseInt(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label>Max Tokens</Label>
                <Input type="number" defaultValue={20} className="bg-background"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>

              <div className="grid gap-2 col-span-2">
                <Label className="text-primary flex items-center gap-1.5">
                  <IconReceipt2 size={14} /> Consultation Fee (Rs)
                </Label>
                <Input type="number" placeholder="e.g., 2000" className="bg-background border-primary/30"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(parseInt(e.target.value))}
                />
              </div>
            </div>

            <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-wider"
              onClick={() => addTimingHandler(doctor.id)}
              disabled={isLoading}>
              {isLoading ? "Issuing Block..." : "Issue Block to Schedule"}
            </Button>
          </div>

          {/* BOTTOM SECTION: Existing Timings List (The "Revoke" View) */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <IconClockHour4 size={16} className="text-muted-foreground" /> Active Timings
            </h3>

            <div className="space-y-2">
              {doctor.timings?.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No active schedules configured.</p>
              )}

              {doctor.timings?.map((timing: Timing) => (
                <div key={timing.id} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm">
                        {timing.day}
                      </span>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        Rs {timing.consultationFee}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono mt-1">
                      {timing.startTime} - {timing.endTime} | {timing.maxTokens} tkns
                    </span>
                  </div>

                  {/* Revoke / Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Revoke Schedule Block"
                    onClick={() => deleteTiming((timing.id))}
                    disabled={isLoading}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button onClick={() => onOpenChange(false)} className="w-full shadow-md" disabled={isLoading}>
            Done Inspecting
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
