import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { IconDatabaseEdit, IconUserPlus } from "@tabler/icons-react";
import { usePatientStore } from "../../store/patient-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../ui/select";
import { toast } from "sonner";
import { getApiOptions, API_BASE_URL } from "@/lib/utils";

export function PatientFormSheet() {
  const isOpen = usePatientStore((state) => state.isFormSheetOpen);
  const mode = usePatientStore((state) => state.formMode);
  const patient = usePatientStore((state) => state.activePatient);
  const closeSheet = usePatientStore((state) => state.closeFormSheet);

  const [isLoading, setIsLoading] = useState(false);

  // Local state to track form inputs
  const [formData, setFormData] = useState({
        firstName: patient?.firstName || "",
        lastName: patient?.lastName || "",
        phone: patient?.phone || "",
        cnic: patient?.cnic || "",
        dateOfBirth: patient?.dateOfBirth
          ? patient?.dateOfBirth.split("T")[0]
          : "",
        gender: patient?.gender || "",
        bloodGroup: patient?.bloodGroup || "",
        address: patient?.address || "",});

  useEffect(() => { if (patient && mode === "update") {
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        phone: patient.phone || "",
        cnic: patient.cnic || "",
        dateOfBirth: patient.dateOfBirth
          ? patient.dateOfBirth.split("T")[0]
          : "",
        gender: patient.gender || "",
        bloodGroup: patient.bloodGroup || "",
        address: patient.address || "",
      });
    } else {
      // Reset form when switching to 'add' mode
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        cnic: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        address: "",
      });
    }
  }, [patient, mode]);

  // Generic change handler for text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default page reload
    setIsLoading(true);

    try {
      if (mode === "add") {
        const response = await fetch(`${API_BASE_URL}/patients`, {
          ...getApiOptions,
          method: "POST",
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to register patient.");
        }
        toast.success(
          `${formData?.firstName} ${formData?.lastName} registered successfully!`,
        );
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          cnic: "",
          dateOfBirth: "",
          gender: "",
          bloodGroup: "",
          address: "",
        });
        closeSheet();
        // TODO: handle re-fetching!
      } else if (mode === "update") {
        const response = await fetch(

          `${API_BASE_URL}/patients/${patient?.id}`,

          {
            ...getApiOptions,
            method: "PATCH",
            body: JSON.stringify(formData),
          },
        );
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          cnic: "",
          dateOfBirth: "",
          gender: "",
          bloodGroup: "",
          address: "",
        });
        closeSheet();
        if (!response.ok) throw new Error("Failed to update patient.");
        toast.success("Patient updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="overflow-y-auto sm:max-w-md p-5">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            {mode === "add" ? (
              <>
                <IconUserPlus className="text-primary" /> Register Patient
              </>
            ) : (
              <>
                <IconDatabaseEdit className="text-primary" /> Update Patient
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <form
          key={patient?.id || "new"}
          onSubmit={handleSubmit}
          className="flex flex-col h-full space-y-4"
        >
          <div className="space-y-4 flex-1">
            {mode === "update" && (
              <div className="space-y-1">
                <Label>MR No</Label>
                <Input disabled value={patient?.mrNumber || ""} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Phone No</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>CNIC</Label>
              <Input
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>DOB</Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Blood Group</Label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, bloodGroup: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Address</Label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <SheetFooter className="mt-6 pt-4 border-t border-border/50">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 shadow-md"
            >
              {isLoading ? "Saving..." : "Save Patient Record"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
