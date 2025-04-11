import { ICoupon } from "../../model/couponModel";

export interface Coupon {
  name: string;
  code: string;
  discount: number;
  startDate: Date;
  expirationDate: Date;
  isActive: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CouponListResponse {
  status: boolean;
  data: ICoupon[];
  pagination: PaginationInfo;
}

export interface CouponToggleStatus {
  status: boolean;
  message: string;
}

export interface CouponSuccessResponse {
  status: true;
  coupon: ICoupon;
  message: string;
}

export interface ErrorResponse {
  status: false;
  message: string;
}
