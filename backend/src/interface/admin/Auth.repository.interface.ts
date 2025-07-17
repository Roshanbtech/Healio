import { UserListResponse } from "../adminInterface/userlist";
import { PaginationOptions } from "../../helper/pagination";
import {
  IDashboardStats,
  ITopDoctor,
  ITopUser,
  IAppointmentAnalytics,
} from "../adminInterface/dashboard";
import { IAppointment } from "../../model/appointmentModel";
import { Iuser } from "../../model/userModel";
import { DoctorListResponse } from "../adminInterface/doctorlist";
import {
  Service,
  ServiceListResponse,
} from "../adminInterface/serviceInterface";
import { IDoctor } from "../../model/doctorModel";
import { Coupon, CouponListResponse } from "../adminInterface/couponlist";
import { ICoupon } from "../../model/couponModel";

export interface IAuthRepository {
  getAllUsers(
    options: PaginationOptions
  ): Promise<Omit<UserListResponse, "status">>;
  getAllDoctors(
    options: PaginationOptions
  ): Promise<Omit<DoctorListResponse, "status">>;
  toggleUser(id: string): Promise<Iuser | null>;
  toggleDoctor(id: string): Promise<IDoctor | null>;
  getAllServices(
    options: PaginationOptions
  ): Promise<Omit<ServiceListResponse, "status">>;
  addService(name: string, isActive: boolean): Promise<Service | null>;
  createCoupon(couponData: Coupon): Promise<ICoupon | null>;
  editService(
    id: string,
    name: string,
    isActive: boolean
  ): Promise<Service | null>;
  toggleService(id: string): Promise<Service | null>;
  findServiceByName(name: string): Promise<Service | null>;
  getCertificates(id: string): Promise<string[] | null>;
  // doctorProfile(id:string): Promise<Partial<IDoctor>|null>
  approveDoctor(id: string): Promise<IDoctor | null>;
  rejectDoctor(id: string, reason: string): Promise<IDoctor | null>;
  getAllCoupons(
    options: PaginationOptions
  ): Promise<Omit<CouponListResponse, "status">>;
  toggleCoupon(id: string): Promise<ICoupon | null>;
  editCoupon(id: string, couponData: Coupon): Promise<ICoupon | null>;
  existCoupon(code: string): Promise<boolean>;
  fetchDashboardStats(): Promise<IDashboardStats>;
  fetchTopDoctors(): Promise<ITopDoctor[]>;
  fetchTopUsers(): Promise<ITopUser[]>;
  fetchAppointmentAnalytics(
    timeFrame: string
  ): Promise<IAppointmentAnalytics[]>;
  fetchReports(
    startDate: Date,
    endDate: Date,
    status: string,
    options: PaginationOptions
  ): Promise<{
    data: IAppointment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
}
