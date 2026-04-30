import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { IconStethoscope, IconDeviceFloppy } from "@tabler/icons-react";

export function OnboardDoctorSheet({ open, onOpenChange }: any) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <IconStethoscope className="text-primary" /> Onboard Doctor
          </SheetTitle>
          <SheetDescription>
            Register a new medical professional as a hospital resource.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 -mx-1 grid gap-6 content-start mt-4">

          <div className="grid gap-2">
            <Label htmlFor="doctor-name">Full Name</Label>
            <Input
              id="doctor-name"
              placeholder="e.g., Dr. Salman Ali"
              className="bg-muted/30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="specialization">Primary Specialization</Label>
            <Input
              id="specialization"
              placeholder="e.g., Orthopedics, General Physician"
              className="bg-muted/30"
            />
          </div>

          <div className="grid gap-2">
            <Label>Initial Duty Status</Label>
            <Select defaultValue="true">
              <SelectTrigger className="bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Available (Active in System)</SelectItem>
                <SelectItem value="false">Off Duty (Hidden from Reception)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button onClick={() => onOpenChange(false)} className="w-full gap-2 shadow-md">
            <IconDeviceFloppy size={18} />
            Commit to Database
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
