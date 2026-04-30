import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { IconAlertTriangle } from "@tabler/icons-react";

// Assuming Room type from previous code block
export function ConfigureRoomSheet({ room, open, onOpenChange }: any) {
  if (!room) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Configure Node: {room.roomNumber}</SheetTitle>
          <SheetDescription>Update pricing or force a state override.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6 px-5">
          <div className="grid gap-2">
            <Label>Force Status Override</Label>
            <Select defaultValue={room.status}>
              <SelectTrigger className="bg-muted/30 border-amber-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available (Force Clear)</SelectItem>
                <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                <SelectItem value="CLEANING">Needs Cleaning</SelectItem>
                <SelectItem value="OCCUPIED" disabled>Occupied (System Managed)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mt-1">
              <IconAlertTriangle size={12} className="text-amber-500" />
              Overrides bypass receptionist protocols.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Custom Rate (Rs / Hour)</Label>
            <Input type="number" defaultValue={room.pricePerHour} className="bg-muted/30" />
          </div>
        </div>

        <SheetFooter className="flex flex-col gap-3 sm:flex-col">
          <Button onClick={() => onOpenChange(false)} className="w-full">Save Configuration</Button>
          <Button variant="destructive" className="w-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none">
            Decommission Room
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
