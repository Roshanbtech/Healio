export interface Speciality {
    _id: string;
    name: string;
  }
  
  export interface Doctor {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    isBlocked: boolean;
    speciality?: Speciality;
    experience?: string;
    docStatus: "pending" | "approved" | "rejected";
    isActive?: boolean;
    certificate?: string[];
    description?: string;
    fees?: number;
    rating?: number;
    hospital?: string;
    country?: string;
    achievements?: string;
    degree?: string;
    rejectionReason?: string;
  }
  
  export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  