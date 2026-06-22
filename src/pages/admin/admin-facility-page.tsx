import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  IconActivity,
  IconSearch,
  IconPlus,
  IconSettings,
  IconEdit,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FacilityConfigSheet from "@/components/facility/facility-add-sheet";
import { getApiOptions } from "@/lib/utils";
import { iconDictionary } from "@/lib/icons";


// --- Types & Loader Data ---
export interface ServiceType {
  id: string;
  name: string;
  isQueuingEnabled: boolean;
  doctorInvolvement: "YES" | "NO" | "OPTIONAL";
  iconKey: string;
}

export interface Service {
  id: string;
  systemCode: string;
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
  try {

    const [serviceRes, serviceTypeRes] = await Promise.all([
      fetch("http://localhost:4040/api/v1/services", getApiOptions),
      fetch("http://localhost:4040/api/v1/services/types", getApiOptions)
    ]);

    if (!serviceRes.ok) {
      const err = await serviceRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch doctors list.");
    }

    if (!serviceTypeRes.ok) {
      const err = await serviceTypeRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch hospital stats.");
    }
    const serviceData = await serviceRes.json();
    const serviceTypeData = await serviceTypeRes.json();

    return {
      serviceTypes: serviceTypeData.data,
      services: serviceData.data
    };
  }
  catch (error) {
    console.error("Loader Exception:", error instanceof Error ? error.message : "Unknown error");
    // what is this Response it is native web api we are handeling the error in the react router error boundry componenet 
    throw new Response("Failed to load facilities data from server.", {
      status: 500,
      statusText: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
}


export default function AdminFacilityPage() {
  const { services, serviceTypes } = useLoaderData() as LoaderData;
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

  const filteredServices = services.filter((service) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      service.serviceName.toLowerCase().includes(lowerCaseQuery) ||
      service.systemCode.toLowerCase().includes(lowerCaseQuery)
    )
  })

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
                {/* // NOTE : For Now we are doing only frontend search here as it can not be too many */}
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
                {filteredServices.length === 0 ?
                  (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No services found matching "{searchQuery}".
                      </TableCell>
                    </TableRow>
                  ) :
                  (
                    filteredServices.map((service) => {
                      const category = getCategoryForService(service.serviceTypeId);
                      {/* const IconComponent = category ? iconDictionary[category.iconKey] : IconActivity; */ }
                      const IconComponent = IconActivity;

                      return (
                        <TableRow key={service.id} className={`transition-colors hover:bg-muted/10 ${!service.isActive ? 'opacity-60' : ''}`}>
                          <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                            {service.systemCode}
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
                      )

                    })

                  )}
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

//TODO:  BUILT Action sheet as well
