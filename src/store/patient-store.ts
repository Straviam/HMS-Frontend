import { create } from "zustand";
import type { Patient } from "../types/types";

interface PatientStore {
  // Patient State
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;

  // Form Sheet State (Add/Update)
  isFormSheetOpen: boolean;
  formMode: "add" | "update";
  openFormSheet: (mode: "add" | "update", patient?: Patient | null) => void;
  closeFormSheet: () => void;

  // Assign Service Sheet State
  isAssignSheetOpen: boolean;
  openAssignSheet: (patient: Patient) => void;
  closeAssignSheet: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  activePatient: null,
  setActivePatient: (patient) => set({ activePatient: patient }),

  isFormSheetOpen: false,
  formMode: "add",
  openFormSheet: (mode, patient = null) =>
    set({ isFormSheetOpen: true, formMode: mode, activePatient: patient }),
  closeFormSheet: () => set({ isFormSheetOpen: false, activePatient: null }),

  isAssignSheetOpen: false,
  openAssignSheet: (patient) =>
    set({ isAssignSheetOpen: true, activePatient: patient }),
  closeAssignSheet: () =>
    set({ isAssignSheetOpen: false, activePatient: null }),
}));
