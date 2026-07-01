import { create } from "zustand";

export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "UNDER_MAINTENANCE";

export interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  price: string;
  status: RoomStatus;
  lastCleanedAt: string | null;
  isActive: boolean;
  createdAt: string;

  // Appended from active bookings
  currentPatientName?: string;
  currentPatientMrNo?: string;
  currentInvoiceId?: string;
}

export interface Patient {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  cnic: string;
  phone: string;
}

interface RoomStore {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  admitPatientLocally: (roomId: string, patientName: string, mrNumber: string, invoiceId: string) => void;
  dischargePatientLocally: (roomId: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),

  admitPatientLocally: (roomId, patientName, mrNumber, invoiceId) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              status: "OCCUPIED" as RoomStatus,
              currentPatientName: patientName,
              currentPatientMrNo: mrNumber,
              currentInvoiceId: invoiceId,
            }
          : room
      ),
    })),

  dischargePatientLocally: (roomId) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              status: "CLEANING" as RoomStatus,
              currentPatientName: undefined,
              currentPatientMrNo: undefined,
              currentInvoiceId: undefined,
            }
          : room
      ),
    })),
}));