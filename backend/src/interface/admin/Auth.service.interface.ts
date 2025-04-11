import { PaginationOptions } from "../../helper/pagination";
import { IAppointment } from "../../model/appointmentModel";
import { PaginatedResult } from "../../services/admin/auth";
import {
  AdminLoginInput,
  AdminLoginSuccess,
  AdminLoginError,
  AdminLogoutSuccess,
  AdminLogoutError,
} from "../adminInterface/adminAuth";
import { UserListResponse, UserToggleStatus } from "../adminInterface/userlist";
import {
  ApproveRejectResponse,
  DoctorListResponse,
  DoctorToggleStatus,
} from "../adminInterface/doctorlist";
import {
  IAppointmentAnalytics,
  IDashboardStats,
  ITopDoctor,
  ITopUser,
} from "../adminInterface/dashboard";
import {
  ServiceListResponse,
  ServiceSuccessResponse,
  ServiceToggleStatus,
} from "../adminInterface/serviceInterface";
import {
  Coupon,
  CouponListResponse,
  CouponSuccessResponse,
  CouponToggleStatus,
} from "../adminInterface/couponlist";

export interface IAuthService {
  login(
    adminData: AdminLoginInput
  ): Promise<AdminLoginSuccess | AdminLoginError>;
  logout(refreshToken: string): Promise<AdminLogoutSuccess | AdminLogoutError>;
  getUser(
    options: PaginationOptions
  ): Promise<Omit<UserListResponse, "status">>;
  getDoctor(
    options: PaginationOptions
  ): Promise<Omit<DoctorListResponse, "status">>;
  toggleUser(id: string): Promise<UserToggleStatus | null>;
  toggleDoctor(id: string): Promise<DoctorToggleStatus | null>;
  getService(
    options: PaginationOptions
  ): Promise<Omit<ServiceListResponse, "status">>;
  addService(name: string, isActive: boolean): Promise<ServiceSuccessResponse>;
  editService(
    id: string,
    name: string,
    isActive: boolean
  ): Promise<ServiceSuccessResponse>;
  toggleService(id: string): Promise<ServiceToggleStatus | null>;
  getCertificates(id: string): Promise<string[]>;
  approveDoctor(id: string): Promise<ApproveRejectResponse>;
  rejectDoctor(id: string, reason: string): Promise<ApproveRejectResponse>;
  createCoupon(couponData: Coupon): Promise<CouponSuccessResponse>;
  getCoupons(
    options: PaginationOptions
  ): Promise<Omit<CouponListResponse, "status">>;
  toggleCoupon(id: string): Promise<CouponToggleStatus | null>;
  editCoupon(id: string, couponData: Coupon): Promise<CouponSuccessResponse>;
  getDashboardStats(): Promise<IDashboardStats>;
  getTopDoctors(): Promise<ITopDoctor[]>;
  getTopUsers(): Promise<ITopUser[]>;
  getAppointmentAnalytics(timeFrame: string): Promise<IAppointmentAnalytics[]>;
  getReports(
    startDate: Date,
    endDate: Date,
    status: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<IAppointment>>;
}
