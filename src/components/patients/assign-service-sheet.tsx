import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IconFileSignal, IconPlus, IconReceipt, IconPrinter, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { getApiOptions, patchApiOptions, postApiOptions } from "@/lib/utils";
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
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);

  // Form Selection State
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Billing Workflow State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceState, setInvoiceState] = useState< "drafting" | "generated" | "finalized" | "paid" >("drafting");
  const [isLoading, setIsLoading] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [discount, setDiscount] = useState<number | string>(0);

  // Fetch Master Data
  useEffect(() => {
    if (!isOpen) return;

    const fetchMasterData = async () => {
      try {
        const [typesRes, servRes, docsRes] = await Promise.all([
          fetch("http://localhost:4040/api/v1/services/types", getApiOptions),
          fetch("http://localhost:4040/api/v1/services", getApiOptions),
          fetch("http://localhost:4040/api/v1/doctors/available", getApiOptions),
        ]);
        const typesData = await typesRes.json();
        const servData = await servRes.json();
        const docsData = await docsRes.json();

        setServiceTypes(typesData.data || []);
        setAllServices(servData.data || []);
        setAvailableDoctors(docsData.data || []);
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
      setPaymentMethod("CASH");
      setDiscount("");
    }
  }, [isOpen]);

  // --- Derived Data ---
  const activeType = serviceTypes.find((t) => t.id === selectedTypeId);
  const activeService = allServices.find((s) => s.id === selectedServiceId);
  const availableServices = allServices.filter(
    (s) => s.serviceTypeId === selectedTypeId,
  );
  const requiresDoctor = activeType?.doctorInvolvement === "YES";
  const relevantDoctors = availableDoctors.filter((doc) => {
    if (!activeType) return true;
    return doc.specialization === activeService?.serviceName;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const numericDiscount = Number(discount) || 0;
  const finalTotal = Math.max(0, cartTotal - numericDiscount);

  // Grouping Logic for Departmental Receipts
  const groupedCartByDepartment = cart.reduce((acc, item) => {
    const deptName = item.typeName || "General";
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  // --- ACTIONS ---
  const handleAddToCart = async () => {
    if (!activeType || !activeService || (requiresDoctor && !selectedDoctorId))
      return;

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

    if (invoiceState === "generated" && invoiceId) {
      setIsLoading(true);
      try {
        const formattedItems = {
          serviceId: newItem.serviceId,
          serviceTypeId: newItem.typeId,
          doctorId: newItem.doctorId || null,
          timingId: newItem.timingId || null,
        };

        const response = await fetch(
          `http://localhost:4040/api/v1/invoices/${invoiceId}/addItem`,
          {
            ...postApiOptions,
            method: "POST",
            body: JSON.stringify({ items: [formattedItems] }),
          },
        );

        if (!response.ok) throw new Error("Failed to append service.");

        toast.success("Service added to active invoice.");
        setCart((prev) => [...prev, newItem]);
      } catch (err) {
        toast.error("Failed to append service to invoice.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart((prev) => [...prev, newItem]);
    }

    setSelectedServiceId("");
    setSelectedDoctorId("");
  };

  const handleGenerateInvoice = async () => {
    if (!patient || cart.length === 0) return;
    setIsLoading(true);
    try {
      const formattedItems = cart.map((item) => ({
        serviceId: item.serviceId,
        serviceTypeId: item.typeId,
        doctorId: item.doctorId || null,
        timingId: item.timingId || null,
      }));

      const response = await fetch(
        "http://localhost:4040/api/v1/invoices/reception/generate",
        {
          ...postApiOptions,
          method: "POST",
          body: JSON.stringify({
            patientId: patient.id,
            items: formattedItems,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setInvoiceId(data.data.invoice.id);
      setInvoiceState("generated");
      toast.success("Draft invoice generated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeInvoice = async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4040/api/v1/invoices/${invoiceId}/reception/finalize`,
        {
          ...patchApiOptions,
          method: "PATCH",
        },
      );
      if (!response.ok) throw new Error("Failed to finalize");

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
      const response = await fetch(
        `http://localhost:4040/api/v1/invoices/${invoiceId}/pay`,
        {
          ...postApiOptions,
          method: "POST",
          body: JSON.stringify({
            amountPaid: finalTotal.toString(),
            paymentMethod: paymentMethod,
            discount: numericDiscount.toString(),
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to pay");

      setInvoiceState("paid");
      toast.success("Payment processed successfully.");
    } catch (err) {
      toast.error("Failed to process payment.");
    } finally {
      setIsLoading(false);
    }
  };

  const printMasterReceipt = () => {
    console.log("Printing Master Receipt for Invoice:", invoiceId, cart);
    toast("Master Receipt sent to printer.");
  };

  const printDepartmentReceipt = (deptName: string, items: CartItem[]) => {
    console.log(`Printing Receipt for ${deptName}:`, items);
    toast(`${deptName} Receipt sent to printer.`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="overflow-y-auto sm:max-w-md p-5 flex flex-col h-full">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <IconFileSignal className="text-primary" />
            Service & Billing
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 flex-1">
          <div className="bg-slate-100 p-3 text-sm rounded">
            Assigning to:{" "}
            <strong>
              {patient?.firstName} {patient?.lastName}
            </strong>{" "}
            ({patient?.mrNumber})
          </div>

          {/* ADD SERVICES FORM */}
          {invoiceState === "drafting" || invoiceState === "generated" ? (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Add Services
              </h3>

              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select
                  value={selectedTypeId}
                  onValueChange={(val) => {
                    setSelectedTypeId(val);
                    setSelectedServiceId("");
                    setSelectedDoctorId(""); // Reset doctor selection when category changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specific Service</Label>
                <Select
                  disabled={!selectedTypeId}
                  value={selectedServiceId}
                  onValueChange={setSelectedServiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.serviceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {requiresDoctor && (
                <div className="space-y-2">
                  <Label>Assign Doctor</Label>
                  <Select
                    disabled={!selectedTypeId || relevantDoctors.length === 0}
                    value={selectedDoctorId}
                    onValueChange={setSelectedDoctorId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          relevantDoctors.length === 0
                            ? "No doctors available for this service"
                            : "Select Doctor..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantDoctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.doctorName} ({d.specialization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
                disabled={
                  !activeService ||
                  (requiresDoctor && !selectedDoctorId) ||
                  isLoading
                }
                onClick={handleAddToCart}
              >
                <IconPlus size={16} />
                Add to Current Invoice
              </Button>
            </div>
          ) : null}

          {/* CURRENT CART / INVOICE PREVIEW */}
          {cart.length > 0 && invoiceState !== "paid" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <IconReceipt size={20} /> Invoice Draft
                </h3>
                <span className="text-xs uppercase bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                  {invoiceState}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded border"
                  >
                    <div>
                      <p className="font-semibold">{item.serviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.doctorName
                          ? `Assigned: ${item.doctorName}`
                          : item.typeName}
                      </p>
                    </div>
                    <p className="font-mono font-medium">Rs {item.price}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                <span>Total Amount:</span>
                <span className="font-mono text-primary">
                  Rs {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* PAYMENT DETAILS */}
          {invoiceState === "finalized" && (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50 mt-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Payment Details
              </h3>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="ONLINE_TRANSFER">Online Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Discount (Rs)</Label>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Enter discount amount"
                />
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t">
                {numericDiscount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Discount Applied:</span>
                    <span>- Rs {numericDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Amount Payable:</span>
                  <span className="font-mono text-emerald-600">
                    Rs {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PRINT RECEIPTS DASHBOARD */}
          {invoiceState === "paid" && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <IconCheck size={24} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold">Payment Successful</p>
                  <p className="text-sm">Invoice #{invoiceId} has been cleared.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider">
                  Print Master Receipt
                </h3>
                <Button
                  className="w-full gap-2 py-6 bg-slate-900 text-white"
                  onClick={printMasterReceipt}
                >
                  <IconPrinter size={20} />
                  Print Complete Invoice
                </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider">
                  Print Department Receipts
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(groupedCartByDepartment).map(([deptName, items]) => (
                    <Button
                      key={deptName}
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3"
                      onClick={() => printDepartmentReceipt(deptName, items)}
                    >
                      <div className="bg-primary/10 p-2 rounded text-primary">
                        <IconPrinter size={16} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{deptName} Receipt</p>
                        <p className="text-xs text-muted-foreground">
                          {items.length} service{items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 pt-4 border-t">
          {invoiceState === "drafting" && (
            <Button
              className="w-full"
              disabled={cart.length === 0 || isLoading}
              onClick={handleGenerateInvoice}
            >
              Generate Draft Invoice
            </Button>
          )}
          {invoiceState === "generated" && (
            <Button
              className="w-full"
              variant="destructive"
              disabled={isLoading}
              onClick={handleFinalizeInvoice}
            >
              Finalize & Lock Invoice
            </Button>
          )}
          {invoiceState === "finalized" && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading || finalTotal < 0}
              onClick={handlePayInvoice}
            >
              Collect Payment (Rs {finalTotal.toLocaleString()})
            </Button>
          )}
          {invoiceState === "paid" && (
            <Button className="w-full" variant="ghost" onClick={closeSheet}>
              Close Window
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}