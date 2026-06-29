export interface Patient {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  cnic: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
}

export interface ServiceType {
  id: string;
  name: string;
  isQueuingEnabled: boolean;
  doctorInvolvement: "YES" | "NO";
  description: string | null;
}

export interface Service {
  id: string;
  serviceTypeId: string;
  serviceName: string;
  basePrice: string;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  doctorName: string;
  specialization: string;
  isAvailable: boolean;
}

export interface CartItem {
  serviceId: string;
  serviceName: string;
  typeId: string;
  typeName: string;
  doctorId?: string;
  doctorName?: string;
  price: number;
}