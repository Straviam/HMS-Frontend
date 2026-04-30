import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconCalculator } from "@tabler/icons-react";

export function BulkPricingDialog({ rooms, open, onOpenChange }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <IconCalculator className="text-primary" /> Global Pricing Matrix
          </DialogTitle>
          <DialogDescription>
            Rapidly adjust hourly rates across the facility. Changes apply to future bookings only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4 border-b">
          <span className="text-sm font-medium">Apply Global Multiplier:</span>
          <Input type="number" placeholder="e.g., 1.10 for +10%" className="w-40 bg-muted/30" />
          <Button variant="secondary" size="sm">Apply to All</Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead>Node ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Current Rate (Rs)</TableHead>
                <TableHead>New Rate (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: any) => (
                <TableRow key={room.id}>
                  <TableCell className="font-mono font-medium">{room.roomNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{room.roomType}</TableCell>
                  <TableCell>Rs {room.pricePerHour}</TableCell>
                  <TableCell>
                    <Input type="number" defaultValue={room.pricePerHour} className="w-32 h-8 text-sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="shadow-md">Execute Batch Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
