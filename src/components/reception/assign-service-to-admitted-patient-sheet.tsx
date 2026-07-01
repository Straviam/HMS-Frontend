import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IconStethoscope, IconPlus, IconCheck, IconLoader2, IconTrash, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";
import { getApiOptions, postApiOptions } from "@/lib/utils";
import type { Room } from "@/store/room-store";

// Type definitions for this component
interface ServiceType { id: string; name: string; doctorInvolvement: string; }
interface Service { id: string; serviceName: string; serviceTypeId: string; basePrice: string; }
interface Doctor { id: string; doctorName: string; specialization: string; }
interface CartItem { serviceId: string; serviceName: string; typeId: string; typeName: string; doctorId?: string; doctorName?: string; price: number; }

interface AssignServiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

export function AssignServiceSheet({ open, onOpenChange, room }: AssignServiceSheetProps) {
  // Master Data State
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);

  // Form Selection State
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Workflow State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Master Data when sheet opens
  useEffect(() => {
    if (!open) return;

    const fetchMasterData = async () => {
      setIsLoadingData(true);
      try {
        const [typesRes, servRes, docsRes] = await Promise.all([
          fetch("http://localhost:4040/api/v1/services/types", getApiOptions),
          fetch("http://localhost:4040/api/v1/services", getApiOptions),
          fetch("http://localhost:4040/api/v1/doctors/available", getApiOptions),
        ]);

        if (!typesRes.ok || !servRes.ok || !docsRes.ok) throw new Error("Failed to load configs");

        const typesData = await typesRes.json();
        const servData = await servRes.json();
        const docsData = await docsRes.json();

        setServiceTypes(typesData.data || []);
        setAllServices(servData.data || []);
        setAvailableDoctors(docsData.data || []);
      } catch (error) {
        toast.error("Failed to load service configuration.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchMasterData();
  }, [open]);

  // Reset local state when sheet closes
  useEffect(() => {
    if (!open) {
      setSelectedTypeId("");
      setSelectedServiceId("");
      setSelectedDoctorId("");
      setCart([]);
    }
  }, [open]);

  // --- Derived Data ---
  const activeType = serviceTypes.find((t) => t.id === selectedTypeId);
  const activeService = allServices.find((s) => s.id === selectedServiceId);
  const availableServices = allServices.filter((s) => s.serviceTypeId === selectedTypeId);
  const requiresDoctor = activeType?.doctorInvolvement === "YES";
  const relevantDoctors = availableDoctors.filter((doc) => {
    if (!activeType) return true;
    return doc.specialization === activeService?.serviceName;
  });
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  // --- ACTIONS ---
  const handleAddToList = () => {
    if (!activeType || !activeService || (requiresDoctor && !selectedDoctorId)) return;

    const doctor = availableDoctors.find((d) => d.id === selectedDoctorId);

    const newItem: CartItem = {
      serviceId: activeService.id,
      serviceName: activeService.serviceName,
      typeId: activeType.id,
      typeName: activeType.name,
      doctorId: doctor?.id,
      doctorName: doctor?.doctorName,
      price: parseFloat(activeService.basePrice),
    };

    setCart((prev) => [...prev, newItem]);

    // Reset selections for the next item
    setSelectedServiceId("");
    setSelectedDoctorId("");
  };

  const handleRemoveFromList = (indexToRemove: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAppendToInvoice = async () => {
    if (!room || !room.currentInvoiceId || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const formattedItems = cart.map(item => ({
        serviceId: item.serviceId,
        serviceTypeId: item.typeId,
        doctorId: item.doctorId || null,
        // timingId: item.timingId || null, // Add if timing logic is implemented
      }));

      const response = await fetch(`http://localhost:4040/api/v1/invoices/${room.currentInvoiceId}/addItem`, {
        ...postApiOptions,
        method: "POST",
        body: JSON.stringify({ items: formattedItems })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to add services");

      toast.success(`${cart.length} service(s) successfully appended to ${room.currentPatientName}'s bill.`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update patient bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md p-5 flex flex-col h-full">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <IconStethoscope className="text-primary" />
            In-Room Services
          </SheetTitle>
          <SheetDescription>Queue services and append them to the active room bill.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 flex-1">
          {/* PATIENT CONTEXT CARD */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-1">
            <Label className="text-primary text-xs uppercase tracking-wider">Patient Details</Label>
            <p className="font-bold font-heading text-xl">{room?.currentPatientName}</p>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>MR: {room?.currentPatientMrNo}</span>
              <span>Room: {room?.roomNumber}</span>
            </div>
            {room?.currentInvoiceId && ( <div
              className="flex flex-col bg-background border p-2 rounded cursor-pointer hover:bg-muted transition-colors"
              onClick={() => {navigator.clipboard.writeText(room.currentInvoiceId!); setCopiedId(room.currentInvoiceId!); toast.success("Invoice ID copied"); setTimeout(() => setCopiedId(null), 2000); }} >

              <div className="flex flex-row gap-4"><span className="text-xs font-mono">Inv: {room.currentInvoiceId}</span>{copiedId === room.currentInvoiceId ? (<IconCheck size={20} className="text-emerald-500" />) : (<IconCopy size={20} className="text-muted-foreground" />)}</div>
            </div>
          )}
          </div>

          {/* ADD SERVICES FORM */}
          {isLoadingData ? (
             <div className="flex justify-center p-8"><IconLoader2 className="animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Select Service
              </h3>

              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select
                  value={selectedTypeId}
                  onValueChange={(val) => {
                    setSelectedTypeId(val);
                    setSelectedServiceId("");
                    setSelectedDoctorId("");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select Category..." /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specific Service</Label>
                <Select disabled={!selectedTypeId} value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                  <SelectContent>
                    {availableServices.map((s) => <SelectItem key={s.id} value={s.id}>{s.serviceName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {requiresDoctor && (
                <div className="space-y-2">
                  <Label>Assign Doctor</Label>
                  <Select disabled={!selectedTypeId || relevantDoctors.length === 0} value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger>
                      <SelectValue placeholder={relevantDoctors.length === 0 ? "No doctors available" : "Select Doctor..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantDoctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.doctorName} ({d.specialization})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
                disabled={!activeService || (requiresDoctor && !selectedDoctorId)}
                onClick={handleAddToList}
              >
                <IconPlus size={16} />
                Queue Service
              </Button>
            </div>
          )}

          {/* LOCAL CART PREVIEW */}
          {cart.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Queued for Billing</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded border">
                    <div>
                      <p className="font-semibold">{item.serviceName}</p>
                      <p className="text-xs text-muted-foreground">{item.doctorName ? `Dr. ${item.doctorName}` : item.typeName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono font-medium">Rs {item.price}</p>
                      <button onClick={() => handleRemoveFromList(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors">
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                <span>Subtotal:</span>
                <span className="font-mono text-primary">Rs {cartTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 pt-4 border-t">
          <Button
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleAppendToInvoice}
          >
            {isSubmitting ? <IconLoader2 className="animate-spin" size={18} /> : <IconCheck size={18} />}
            Append {cart.length} Item(s) to Bill
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}