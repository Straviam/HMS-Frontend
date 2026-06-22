import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type ServiceType } from "@/pages/admin/admin-facility-page";
import { iconDictionary } from "@/lib/icons";
import { useState } from "react";
import { IconActivity } from "@tabler/icons-react";
import { useRevalidator } from "react-router";
import { toast } from "sonner";


interface FacilityConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "SERVICE" | "CATEGORY";
  categories: ServiceType[];
}

export default function FacilityConfigSheet({ open, onOpenChange, mode, categories }: FacilityConfigSheetProps) {
  const revalidator = useRevalidator();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const [serviceData, setServiceData] = useState({
    serviceName: "",
    systemCode: "",
    basePrice: 0,
    isActive: true
  });

  const [serviceTypeData, setServiceTypeData] = useState({
    name: "",
    isQueuingEnabled: false,
    doctorInvolvement: "NO",
    description: "",
    iconKey: "IconActivity" // Defaulted to match your UI
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const endpoint = mode === "SERVICE"
        ? "http://localhost:4040/api/v1/services"
        : "http://localhost:4040/api/v1/services/types";

      const payload = mode === "SERVICE"
        ? { ...serviceData, serviceTypeId: selectedCategoryId }
        : serviceTypeData;

      // TODO: make a comman object for all the details of fetch in utils 
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate()
      toast.success(result.message || "sucesss")

      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong"
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-background border-l border-border/50">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl text-foreground">
            {mode === "SERVICE" ? "Add New Service" : "Create Service Category"}
          </SheetTitle>
          <SheetDescription>
            {mode === "SERVICE"
              ? "Define a new billable item for the hospital."
              : "Set operational rules for a new group of services."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 mt-6 space-y-6 pr-1">

          {mode === "SERVICE" && (
            <>
              {/* Category Dropdown */}
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* The UI Magic Alert Box */}
                {selectedCategory && (
                  <div className="bg-muted/20 border border-border/50 p-3 rounded-md mt-2 flex items-start gap-2 animate-in fade-in zoom-in-95">
                    {/* // IIFE is used to display the icon */}
                    {(() => {
                      const CategoryIcon = iconDictionary[selectedCategory.iconKey] || iconDictionary["IconActivity"];

                      {/* // If for some reason the dictionary is empty, fall back to a standard div */ }
                      if (!CategoryIcon) return <div className="w-4 h-4 bg-primary/20 rounded-full mt-0.5 shrink-0" />;

                      return <CategoryIcon size={16} className="text-primary mt-0.5 shrink-0" />;
                    })()
                    }
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Services in <strong>{selectedCategory.name}</strong>
                      {selectedCategory.isQueuingEnabled ? " are routed to the live queue" : " bypass the queuing system"} and
                      {selectedCategory.doctorInvolvement === "YES" ? " require a doctor assignment upon billing." : " do not require a specific doctor."}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  placeholder="e.g., Digital X-Ray"
                  className="bg-background"
                  value={serviceData.serviceName}
                  onChange={(e) => setServiceData({ ...serviceData, serviceName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>System Code</Label>
                  <Input
                    placeholder="e.g., RAD-005"
                    className="bg-background font-mono"
                    value={serviceData.systemCode}
                    onChange={(e) => setServiceData({ ...serviceData, systemCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Price (Rs)</Label>
                  <Input
                    type="number"
                    placeholder="1500"
                    className="bg-background font-mono"
                    value={serviceData.basePrice || ""}
                    onChange={(e) => setServiceData({ ...serviceData, basePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </>
          )}

          {mode === "CATEGORY" && (
            <>
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  placeholder="e.g., Cardiology"
                  className="bg-background"
                  value={serviceTypeData.name}
                  onChange={(e) => setServiceTypeData({ ...serviceTypeData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Display Icon</Label>
                <Select
                  value={serviceTypeData.iconKey}
                  onValueChange={(val) => setServiceTypeData({ ...serviceTypeData, iconKey: val })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(iconDictionary).map(key => {
                      const Icon = iconDictionary[key];
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon size={16} className="text-muted-foreground" />
                            {key.replace("Icon", "")}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/10 border border-border/50 rounded-lg p-4 space-y-4 mt-6">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Operational Rules</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Live Queuing</Label>
                    <p className="text-[10px] text-muted-foreground">Add patient to daily waiting list.</p>
                  </div>
                  <Switch
                    checked={serviceTypeData.isQueuingEnabled}
                    onCheckedChange={(checked) => setServiceTypeData({ ...serviceTypeData, isQueuingEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Require Doctor</Label>
                    <p className="text-[10px] text-muted-foreground">Mandatory doctor selection at POS.</p>
                  </div>
                  <Select
                    value={serviceTypeData.doctorInvolvement}
                    onValueChange={(val) => setServiceTypeData({ ...serviceTypeData, doctorInvolvement: val })}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Yes</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                      <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button
            className="w-full shadow-sm"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : `Save ${mode === "SERVICE" ? "Service" : "Category"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

}

