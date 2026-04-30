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

export function ManageTimingsSheet({ doctor, open, onOpenChange }: any) {
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
                <Select>
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
                <Input type="time" className="bg-background" />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input type="time" className="bg-background" />
              </div>

              <div className="grid gap-2">
                <Label>Avg Consult (mins)</Label>
                <Input type="number" defaultValue={15} className="bg-background" />
              </div>
              <div className="grid gap-2">
                <Label>Max Tokens</Label>
                <Input type="number" defaultValue={20} className="bg-background" />
              </div>

              <div className="grid gap-2 col-span-2">
                <Label className="text-primary flex items-center gap-1.5">
                  <IconReceipt2 size={14} /> Consultation Fee (Rs)
                </Label>
                <Input type="number" placeholder="e.g., 2000" className="bg-background border-primary/30" />
              </div>
            </div>

            <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-wider">
              Issue Block to Schedule
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

              {doctor.timings?.map((timing: any) => (
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
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button onClick={() => onOpenChange(false)} className="w-full shadow-md">
            Done Inspecting
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
