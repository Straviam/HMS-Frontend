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
import { Switch } from "@/components/ui/switch";
import { type ServiceType } from "@/pages/admin/admin-facility-page";
import { iconDictionary } from "@/lib/icons";

interface CategoryConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ServiceType | null;
}

export default function CategoryConfigSheet({ open, onOpenChange, initialData }: CategoryConfigSheetProps) {
  const revalidator = useRevalidator();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState("IconActivity");
  const [isQueuingEnabled, setIsQueuingEnabled] = useState(false);
  const [doctorInvolvement, setDoctorInvolvement] = useState("NO");

  const isEditing = !!initialData;

  // Hydrate or clear form when the sheet opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setIconKey(initialData.iconKey || "IconActivity");
        setIsQueuingEnabled(initialData.isQueuingEnabled ?? false);
        setDoctorInvolvement(initialData.doctorInvolvement || "NO");
      } else {
        setName("");
        setIconKey("IconActivity");
        setIsQueuingEnabled(false);
        setDoctorInvolvement("NO");
      }
    }
  }, [open, initialData]);

  const handleSave = async () => {
    if (!name || !iconKey) {
      toast.error("Please provide a category name and select an icon.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isEditing
        ? `http://localhost:4040/api/v1/services/types/${initialData.id}`
        : "http://localhost:4040/api/v1/services/types";

      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          name,
          iconKey,
          isQueuingEnabled,
          doctorInvolvement
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      revalidator.revalidate();
      toast.success(result.message || `Category ${isEditing ? "updated" : "created"} successfully`);
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
            {isEditing ? "Edit Service Category" : "Create Service Category"}
          </SheetTitle>
          <SheetDescription>
            {isEditing ? "Modify operational rules for this category." : "Set operational rules for a new group of services."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 mt-6 space-y-6 pr-1">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              placeholder="e.g., Cardiology"
              className="bg-background"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Display Icon</Label>
            <Select value={iconKey} onValueChange={setIconKey}>
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
                checked={isQueuingEnabled}
                onCheckedChange={setIsQueuingEnabled}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Require Doctor</Label>
                <p className="text-[10px] text-muted-foreground">Mandatory doctor selection at POS.</p>
              </div>
              <Select value={doctorInvolvement} onValueChange={setDoctorInvolvement}>
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
        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button className="w-full shadow-sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Category" : "Save Category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
