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
import { IconStethoscope, IconDeviceFloppy } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRevalidator } from "react-router";

interface OnboardDoctorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardDoctorSheet({ open, onOpenChange }: OnboardDoctorSheetProps) {

  const revalidator = useRevalidator()
  const [doctorName, setDoctorName] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<string>("true");
  const [isloading, setIsLoading] = useState(false);

  const addDoctorHandler = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          doctorName: doctorName,
          specialization: specialization,
          isAvailable: isAvailable === "true"  // actually shadcn select doesnot handle so it is string you what this check do  
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid credentials");
      }

      const result = await response.json();
      revalidator.revalidate()
      onOpenChange(false);
      toast.success(result.message || "sucesss")

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong"
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="specialization">Primary Specialization</Label>
            <Input
              id="specialization"
              placeholder="e.g., Orthopedics, General Physician"
              className="bg-muted/30"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Initial Duty Status</Label>
            <Select value={isAvailable} onValueChange={(value) => setIsAvailable(value)}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Available (Active in System)</SelectItem>
                <SelectItem value="false">Off Duty (Hidden from Reception)</SelectItem> {/* off duty will be hidden from Reception*/}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button onClick={addDoctorHandler} className="w-full gap-2 shadow-md"
            disabled={isloading}>
            <IconDeviceFloppy size={18} />
            Commit to Database
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
