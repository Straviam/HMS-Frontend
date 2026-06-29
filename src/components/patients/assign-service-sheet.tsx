import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IconFileSignal, IconPlus, IconReceipt } from "@tabler/icons-react";
import { toast } from "sonner";
import { getApiOptions } from "@/lib/utils";
import type { ServiceType, Service, Doctor, CartItem } from "../../types/types";
import { usePatientStore } from "../../store/patient-store";

export function AssignServiceSheet() {
  // Zustand State
  const isOpen = usePatientStore((state) => state.isAssignSheetOpen);
  const patient = usePatientStore((state) => state.activePatient);
  const closeSheet = usePatientStore((state) => state.closeAssignSheet);

  // Master Data State
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

  // Form Selection State
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Billing Workflow State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceState, setInvoiceState] = useState<"drafting" | "generated" | "finalized" | "paid">("drafting");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Master Data (only runs when the sheet opens for the first time)
  useEffect(() => {
    if (!isOpen) return;

    const fetchMasterData = async () => {
      try {
        const [typesRes, servRes, docsRes] = await Promise.all([
          fetch("http://localhost:4040/api/v1/services/types", getApiOptions),
          fetch("http://localhost:4040/api/v1/services", getApiOptions),
          fetch("http://localhost:4040/api/v1/doctors", getApiOptions)
        ]);
        const typesData = await typesRes.json();
        const servData = await servRes.json();
        const docsData = await docsRes.json();

        setServiceTypes(typesData.data || []);
        setAllServices(servData.data || []);
        setAllDoctors(docsData.data || []);
      } catch (error) {
        toast.error("Failed to load service configuration.");
      }
    };
    fetchMasterData();
  }, [isOpen]);

  // Reset local state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTypeId("");
      setSelectedServiceId("");
      setSelectedDoctorId("");
      setCart([]);
      setInvoiceId(null);
      setInvoiceState("drafting");
    }
  }, [isOpen]);

  // Derived Data
  const activeType = serviceTypes.find(t => t.id === selectedTypeId);
  const activeService = allServices.find(s => s.id === selectedServiceId);
  const availableServices = allServices.filter(s => s.serviceTypeId === selectedTypeId);
  const requiresDoctor = activeType?.doctorInvolvement === "YES";
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  // --- ACTIONS ---
  const handleAddToCart = async () => {
    if (!activeType || !activeService || (requiresDoctor && !selectedDoctorId)) return;

    const doctor = allDoctors.find(d => d.id === selectedDoctorId);

    const newItem: CartItem = {
      serviceId: activeService.id,
      serviceName: activeService.serviceName,
      typeId: activeType.id,
      typeName: activeType.name,
      doctorId: doctor?.id,
      doctorName: doctor?.doctorName,
      price: parseFloat(activeService.basePrice)
    };

    if (invoiceState === "generated" && invoiceId) {
      setIsLoading(true);
      try {
        await fetch(`http://localhost:4040/api/v1/invoices/${invoiceId}/addItem`, {
          ...getApiOptions,
          method: "POST",
          body: JSON.stringify({ item: newItem })
        });
        toast.success("Service added to active invoice.");
        setCart(prev => [...prev, newItem]);
      } catch (err) {
        toast.error("Failed to append service to invoice.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart(prev => [...prev, newItem]);
    }

    setSelectedServiceId("");
    setSelectedDoctorId("");
  };

  const handleGenerateInvoice = async () => {
    if (!patient || cart.length === 0) return;
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4040/api/v1/invoices/reception/generate", {
        ...getApiOptions,
        method: "POST",
        body: JSON.stringify({ patientId: patient.id, items: cart })
      });
      const data = await response.json();
      setInvoiceId(data.data.id);
      setInvoiceState("generated");
      toast.success("Draft invoice generated successfully.");
    } catch (err) {
      toast.error("Failed to generate invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeInvoice = async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    try {
      await fetch(`http://localhost:4040/api/v1/invoices/${invoiceId}/reception/finalize`, {
        ...getApiOptions,
        method: "PATCH"
      });
      setInvoiceState("finalized");
      toast.success("Invoice finalized and locked.");
    } catch (err) {
      toast.error("Failed to finalize invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    try {
      await fetch(`http://localhost:4040/api/v1/invoices/${invoiceId}/pay`, {
        ...getApiOptions,
        method: "POST"
      });
      setInvoiceState("paid");
      toast.success("Payment processed successfully.");
      setTimeout(() => closeSheet(), 2000);
    } catch (err) {
      toast.error("Failed to process payment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="overflow-y-auto sm:max-w-md p-5 flex flex-col h-full">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <IconFileSignal className="text-primary" />
            Service & Billing
          </SheetTitle>
          <SheetDescription>
            Assign services to <strong>{patient?.firstName} {patient?.lastName}</strong> ({patient?.mrNumber})
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 flex-1">
          {invoiceState === "drafting" || invoiceState === "generated" ? (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Add Services</h3>

              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select value={selectedTypeId} onValueChange={(val) => { setSelectedTypeId(val); setSelectedServiceId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select Category..." /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specific Service</Label>
                <Select disabled={!selectedTypeId} value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                  <SelectContent>
                    {availableServices.map(s => <SelectItem key={s.id} value={s.id}>{s.serviceName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {requiresDoctor && (
                <div className="space-y-2">
                  <Label>Assign Doctor</Label>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger><SelectValue placeholder="Select Doctor..." /></SelectTrigger>
                    <SelectContent>
                      {allDoctors.map(d => <SelectItem key={d.id} value={d.id}>{d.doctorName} ({d.specialization})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
                disabled={!activeService || (requiresDoctor && !selectedDoctorId) || isLoading}
                onClick={handleAddToCart}
              >
                <IconPlus size={16} />
                Add to Current Invoice
              </Button>
            </div>
          ) : null}

          {cart.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <IconReceipt size={20}/> Invoice Draft
                </h3>
                <span className="text-xs uppercase bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                  {invoiceState}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded border">
                    <div>
                      <p className="font-semibold">{item.serviceName}</p>
                      <p className="text-xs text-muted-foreground">{item.doctorName ? `Assigned: ${item.doctorName}` : item.typeName}</p>
                    </div>
                    <p className="font-mono font-medium">Rs {item.price}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                <span>Total Amount:</span>
                <span className="font-mono text-primary">Rs {cartTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 pt-4 border-t">
          {invoiceState === "drafting" && (
            <Button className="w-full" disabled={cart.length === 0 || isLoading} onClick={handleGenerateInvoice}>
              Generate Draft Invoice
            </Button>
          )}
          {invoiceState === "generated" && (
            <Button className="w-full" variant="destructive" disabled={isLoading} onClick={handleFinalizeInvoice}>
              Finalize & Lock Invoice
            </Button>
          )}
          {invoiceState === "finalized" && (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading} onClick={handlePayInvoice}>
              Collect Payment (Rs {cartTotal.toLocaleString()})
            </Button>
          )}
          {invoiceState === "paid" && (
            <Button className="w-full" variant="outline" onClick={closeSheet}>
              Done & Close
            </Button>
          )}
        </SheetFooter>

      </SheetContent>
    </Sheet>
  );
}