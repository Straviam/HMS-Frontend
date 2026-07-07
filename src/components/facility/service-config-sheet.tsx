import { API_BASE_URL } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRevalidator } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { type ServiceType, type Service } from "@/pages/admin/admin-facility-page";
import { iconDictionary } from "@/lib/icons";

interface ServiceConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceType[];
  initialData: Service | null;
}

export default function ServiceConfigSheet({ open, onOpenChange, categories, initialData }: ServiceConfigSheetProps) {
  const revalidator = useRevalidator();
  const [isLoading, setIsLoading] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [systemCode, setSystemCode] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const isEditing = !!initialData;
  const selectedCategory = categories.find(c => c.id === serviceTypeId);

  // Hydrate or clear form when the sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (initialData) {
          setServiceName(initialData.serviceName || "");
          setSystemCode(initialData.systemCode || "");
          setBasePrice(initialData.basePrice || "");
          setServiceTypeId(initialData.serviceTypeId || "");
          setIsActive(initialData.isActive ?? true);
        } else {
          setServiceName("");
          setSystemCode("");
          setBasePrice("");
          setServiceTypeId("");
          setIsActive(true);
        }
      }, 0);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    if (!serviceName || !systemCode || !serviceTypeId || basePrice === "") {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Dynamic endpoint and method based on whether we are editing
      const endpoint = isEditing
        ? `${API_BASE_URL}/services/${initialData.id}`
        : `${API_BASE_URL}/services`;

      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serviceName,
          systemCode,
          basePrice: Number(basePrice),
          serviceTypeId,
          isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate();
      toast.success(result.message || `Service ${isEditing ? "updated" : "created"} successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-background border-l border-border/50">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl text-foreground">
            {isEditing ? "Edit Service" : "Add New Service"}
          </SheetTitle>
          <SheetDescription>
            {isEditing ? "Update details for this billable item." : "Define a new billable item for the hospital."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 mt-6 space-y-6 pr-1">
          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select value={serviceTypeId} onValueChange={setServiceTypeId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory && (
              <div className="bg-muted/20 border border-border/50 p-3 rounded-md mt-2 flex items-start gap-2 animate-in fade-in zoom-in-95">
                {(() => {
                  const CategoryIcon = iconDictionary[selectedCategory.iconKey] || iconDictionary["IconActivity"];
                  if (!CategoryIcon) return <div className="w-4 h-4 bg-primary/20 rounded-full mt-0.5 shrink-0" />;
                  return <CategoryIcon size={16} className="text-primary mt-0.5 shrink-0" />;
                })()}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Services in <strong>{selectedCategory.name}</strong>
                  {selectedCategory.isQueuingEnabled ? " are routed to the live queue" : " bypass the queuing system"} and
                  {selectedCategory.doctorInvolvement === "YES" ? " require a doctor assignment." : " do not require a specific doctor."}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Service Name</Label>
            <Input
              placeholder="e.g., Digital X-Ray"
              className="bg-background"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>System Code</Label>
              <Input
                placeholder="e.g., RAD-005"
                className="bg-background font-mono"
                value={systemCode}
                onChange={(e) => setSystemCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Base Price (Rs)</Label>
              <Input
                type="number"
                placeholder="1500"
                className="bg-background font-mono"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || "")}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button className="w-full shadow-sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Service" : "Save Service"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
