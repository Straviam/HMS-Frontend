import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { IconDeviceFloppy } from "@tabler/icons-react";

interface AddRoomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRoomSheet({ open, onOpenChange }: AddRoomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Add New Room</SheetTitle>
          <SheetDescription>
            Register a new physical asset into the hospital system. Status will default to Available.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6 px-5">
          <div className="grid gap-2">
            <Label htmlFor="room-number">Room Number (e.g., VIP-205)</Label>
            <Input id="room-number" placeholder="Enter unique ID" className="bg-muted/30 uppercase" />
          </div>

          <div className="grid gap-2">
            <Label>Room Type</Label>
            <Select>
              <SelectTrigger className="bg-muted/30">
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Ward</SelectItem>
                <SelectItem value="private">Private Suite</SelectItem>
                <SelectItem value="icu">Intensive Care Unit (ICU)</SelectItem>
                <SelectItem value="emergency">Emergency Bay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Base Rate (Rs / Hour)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rs</span>
              <Input id="price" type="number" placeholder="0.00" className="pl-9 bg-muted/30" />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full gap-2 shadow-md">
            <IconDeviceFloppy size={18} />
            Commit to Database
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
