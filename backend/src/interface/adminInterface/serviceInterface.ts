export interface Service {
  serviceId: string;
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
  status: boolean;
  data: Service[];
  pagination: PaginationInfo;
}

export interface ServiceSuccessResponse {
  status: true;
  service: Service;
  message: string;
}

export interface ErrorResponse {
  status: false;
  message: string;
}

export interface ServiceToggleStatus {
  status: boolean;
  message: string;
}
