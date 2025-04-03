export interface Patient {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  }
  
  export interface Doctor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    docStatus: string;
    fees: number;
    averageRating: number | null;
  }
  
  export interface Appointment {
    _id: string;
    appointmentId: string;
    patientId: Patient;
    doctorId: Doctor;
    date: string;
    time: string;
    status: string;
    fees: number;
    paymentMethod: string;
    paymentStatus: string;
    couponCode: string | null;
    couponDiscount: string | null;
    isApplied: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface AppliedFilters {
    startDate: string;
    endDate: string;
    status?: string;
    search?: string;
  }
  