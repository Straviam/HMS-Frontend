import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { IconCircleCheck, IconUserPlus, IconTool, IconBrandLoom } from "@tabler/icons-react";

export function RoomLogsDialog({ room, open, onOpenChange }: any) {
  if (!room) return null;

  // Mocked audit trail data
  const logs = [
    { id: 1, time: "Today, 08:30 AM", action: "Status: AVAILABLE", user: "System", icon: IconCircleCheck, color: "text-primary" },
    { id: 2, time: "Today, 08:00 AM", action: "Finished Cleaning", user: "Staff: Janitor Ali", icon: IconBrandLoom, color: "text-amber-500" },
    { id: 3, time: "Yesterday, 11:45 PM", action: "Patient Discharged", user: "Dr. Smith", icon: IconUserPlus, color: "text-muted-foreground" },
    { id: 4, time: "Yesterday, 10:00 AM", action: "AC Repaired", user: "Admin Ukasha", icon: IconTool, color: "text-destructive" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Audit Trail: {room.roomNumber}</DialogTitle>
          <DialogDescription>Immutable log of state changes and maintenance.</DialogDescription>
        </DialogHeader>

        <div className="relative pl-6 py-4 space-y-6 before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-center gap-4">
              <div className={`absolute -left-6 bg-background border-2 border-background rounded-full p-1 shadow-sm ${log.color}`}>
                <log.icon size={16} stroke={2.5} />
              </div>
              <div className="flex-1 bg-muted/20 border border-border/50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-foreground">{log.action}</span>
                  <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                </div>
                <div className="text-xs text-muted-foreground">Authorized by: {log.user}</div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
