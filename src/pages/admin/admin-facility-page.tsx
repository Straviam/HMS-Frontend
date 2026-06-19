import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  IconActivity,
  IconStethoscope,
  IconBone,
  IconDroplet,
  IconBed,
  IconPill,
  IconMicroscope,
  IconListNumbers,
  IconSearch,
  IconPlus,
  IconSettings,
  IconEdit,
  IconArchive
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// --- 1. The Icon Dictionary ---
// This safely maps the database string to the actual React Component
const iconDictionary: Record<string, React.ElementType> = {
  IconActivity: IconActivity,
  IconStethoscope: IconStethoscope,
  IconBone: IconBone,
  IconDroplet: IconDroplet,
  IconBed: IconBed,
  IconPill: IconPill,
  IconMicroscope: IconMicroscope,
};

// --- Types & Loader Data ---
interface ServiceType {
  id: string;
  name: string;
  isQueuingEnabled: boolean;
  doctorInvolvement: "YES" | "NO" | "OPTIONAL";
  iconKey: string;
}

interface Service {
  id: string;
  code: string;
  serviceTypeId: string;
  serviceName: string;
  basePrice: number;
  isActive: boolean;
}

interface LoaderData {
  serviceTypes: ServiceType[];
  services: Service[];
}

export async function adminFacilityLoader(): Promise<LoaderData> {
  return {
    serviceTypes: [
      { id: "st-1", name: "General Consultation", isQueuingEnabled: true, doctorInvolvement: "YES", iconKey: "IconStethoscope" },
      { id: "st-2", name: "Radiology", isQueuingEnabled: true, doctorInvolvement: "NO", iconKey: "IconBone" },
      { id: "st-3", name: "Pathology (Labs)", isQueuingEnabled: true, doctorInvolvement: "NO", iconKey: "IconDroplet" },
      { id: "st-4", name: "Accommodations", isQueuingEnabled: false, doctorInvolvement: "NO", iconKey: "IconBed" },
    ],
    services: [
      { id: "srv-1", code: "CON-001", serviceTypeId: "st-1", serviceName: "Initial Specialist Consult", basePrice: 2000, isActive: true },
      { id: "srv-2", code: "CON-002", serviceTypeId: "st-1", serviceName: "Follow-up Consult", basePrice: 1500, isActive: true },
      { id: "srv-3", code: "RAD-001", serviceTypeId: "st-2", serviceName: "Digital Chest X-Ray", basePrice: 1200, isActive: true },
      { id: "srv-4", code: "RAD-002", serviceTypeId: "st-2", serviceName: "MRI Scan (Without Contrast)", basePrice: 15000, isActive: false },
      { id: "srv-5", code: "LAB-001", serviceTypeId: "st-3", serviceName: "Complete Blood Count (CBC)", basePrice: 800, isActive: true },
      { id: "srv-6", code: "BED-001", serviceTypeId: "st-4", serviceName: "Private Room (Per Night)", basePrice: 8000, isActive: true },
    ]
  };
}

// --- Main Component ---
export default function AdminFacilityPage() {
  const { serviceTypes, services } = useLoaderData() as LoaderData;
  const [activeTab, setActiveTab] = useState<"catalog" | "rules">("catalog");
  const [searchQuery, setSearchQuery] = useState("");

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"SERVICE" | "CATEGORY">("SERVICE");

  const openSheet = (mode: "SERVICE" | "CATEGORY") => {
    setSheetMode(mode);
    setIsSheetOpen(true);
  };

  // Helper to get Category data for a specific service
  const getCategoryForService = (typeId: string) => {
    return serviceTypes.find(st => st.id === typeId);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Facility Engine</h1>
          <p className="text-muted-foreground text-sm">Master catalog of billable services and operational rules.</p>
        </div>
        <Button
          className="gap-2 shadow-sm"
          onClick={() => openSheet(activeTab === "catalog" ? "SERVICE" : "CATEGORY")}
        >
          <IconPlus size={18} />
          {activeTab === "catalog" ? "Add New Service" : "Add New Category"}
        </Button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Active Services</span>
              <IconActivity size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold mt-1">
              {services.filter(s => s.isActive).length}
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Service Categories</span>
              <IconSettings size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold mt-1">
              {serviceTypes.length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Two-Tiered Configuration Tabs */}
      <Tabs defaultValue="catalog" onValueChange={(v) => setActiveTab(v as "catalog" | "rules")} className="space-y-4">
        <TabsList className="bg-muted/30 p-1">
          <TabsTrigger value="catalog" className="text-sm px-6 font-medium">Service Catalog</TabsTrigger>
          <TabsTrigger value="rules" className="text-sm px-6 font-medium">Categories & Rules</TabsTrigger>
        </TabsList>

        {/* TAB 1: Service Catalog */}
        <TabsContent value="catalog" className="space-y-4 focus-visible:outline-none">
          <Card className="shadow-sm border-border/50">
            <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/10">
              <div className="relative w-full max-w-md">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search by name or code..."
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[120px]">Code</TableHead>
                  <TableHead>Service Name & Category</TableHead>
                  <TableHead>Operational Rules</TableHead>
                  <TableHead className="text-right">Base Price</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => {
                  const category = getCategoryForService(service.serviceTypeId);
                  const IconComponent = category ? iconDictionary[category.iconKey] : IconActivity;

                  return (
                    <TableRow key={service.id} className={`transition-colors hover:bg-muted/10 ${!service.isActive ? 'opacity-60' : ''}`}>
                      <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                        {service.code}
                      </TableCell>

                      <TableCell>
                        <p className="font-medium text-foreground">{service.serviceName}</p>
                        {category && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <IconComponent size={14} /> {category.name}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          {category?.doctorInvolvement === "YES" && (
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider bg-blue-500/10 text-blue-600 border-blue-500/20 px-1.5 py-0">
                              Doc Req
                            </Badge>
                          )}
                          {category?.isQueuingEnabled && (
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider bg-orange-500/10 text-orange-600 border-orange-500/20 px-1.5 py-0">
                              Queued
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium text-foreground">
                        Rs {service.basePrice.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] font-medium tracking-wider ${service.isActive ? 'bg-green-500/10 text-green-600 border-green-500/30' : 'bg-muted text-muted-foreground'}`}>
                          {service.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                          <IconEdit size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 2: Categories & Rules */}
        <TabsContent value="rules" className="space-y-4 focus-visible:outline-none">
          <Card className="shadow-sm border-border/50">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Doctor Required</TableHead>
                  <TableHead>Queuing System</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceTypes.map((type) => {
                  const IconComponent = iconDictionary[type.iconKey] || IconActivity;
                  return (
                    <TableRow key={type.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium text-foreground flex items-center gap-2">
                        <div className="bg-muted/50 p-1.5 rounded-md text-muted-foreground">
                          <IconComponent size={18} />
                        </div>
                        {type.name}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{type.doctorInvolvement}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${type.isQueuingEnabled ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-background text-muted-foreground'}`}>
                          {type.isQueuingEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                          <IconEdit size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Context-Aware Slide-out Form */}
      <FacilityConfigSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode={sheetMode}
        categories={serviceTypes}
      />
    </div>
  );
}

// --- The Context-Aware Form Sheet ---
interface FacilityConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "SERVICE" | "CATEGORY";
  categories: ServiceType[];
}

function FacilityConfigSheet({ open, onOpenChange, mode, categories }: FacilityConfigSheetProps) {
  // Simple state for demonstration of the category alert box
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

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

        <div className="flex-1 overflow-y-auto mt-6 space-y-6 pr-1">

          {mode === "SERVICE" && (
            <>
              {/* Category Dropdown creates Context! */}
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

                {/* The UI Magic Alert Box we discussed */}
                {selectedCategory && (
                  <div className="bg-muted/20 border border-border/50 p-3 rounded-md mt-2 flex items-start gap-2 animate-in fade-in zoom-in-95">
                    <IconActivity size={16} className="text-primary mt-0.5 shrink-0" />
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
                <Input placeholder="e.g., Digital X-Ray" className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>System Code</Label>
                  <Input placeholder="e.g., RAD-005" className="bg-background font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Base Price (Rs)</Label>
                  <Input type="number" placeholder="1500" className="bg-background font-mono" />
                </div>
              </div>
            </>
          )}

          {mode === "CATEGORY" && (
            <>
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input placeholder="e.g., Cardiology" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label>Display Icon</Label>
                <Select defaultValue="IconActivity">
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
                  <Switch />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Require Doctor</Label>
                    <p className="text-[10px] text-muted-foreground">Mandatory doctor selection at POS.</p>
                  </div>
                  <Select defaultValue="NO">
                    <SelectTrigger className="w-[110px] h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Yes</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                      <SelectItem value="OPTIONAL">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border/50">
          <Button className="w-full shadow-sm">
            Save {mode === "SERVICE" ? "Service" : "Category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// TODO: replace the sheets to there own new files as components
// BUILT Action sheet as well
