export interface Patient {
    _id: string;
    name: string;
    email: string;
    phone: string;
  }
  
  export interface MedicalRecord {
    recordDate?: string;
    condition?: string;
    symptoms?: string[];
    medications?: string[];
    notes?: string;
  }
  
  export interface Appointment {
    _id: string;
    appointmentId: string;
    patientId: Patient;
    doctorId: string;
    date: string;
    time: string;
    status:
      | "pending"
      | "accepted"
      | "completed"
      | "cancelled"
      | "cancelled by Dr";
    reason?: string;
    fees?: number;
    paymentStatus?:
      | "payment pending"
      | "payment completed"
      | "payment failed"
      | "refunded"
      | "anonymous";
    prescription?: string | null;
    review?: { rating?: number; description?: string };
    medicalRecords?: MedicalRecord[];
  }
  
  export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface TimeSlot {
    slot: string;
    datetime: string;
  }