export interface Service {
    _id: string;
    name: string;
    isActive: boolean;
  }
  
  export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface ServiceListResponse {
    data: Service[];
    pagination: PaginationInfo;
  }
  