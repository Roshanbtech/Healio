export interface Coupon {
    _id: string;
    name: string;
    code: string;
    discount: number;
    expirationDate: string; // ISO string
    startDate?: string;
    isActive: boolean;
  }
  
  export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface CouponListResponse {
    data: Coupon[];
    pagination: PaginationInfo;
  }
  