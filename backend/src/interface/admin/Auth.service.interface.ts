import { PaginationOptions } from "../../helper/pagination";
import { IAppointment } from "../../model/appointmentModel";
import { PaginatedResult } from "../../services/admin/auth";
import { IAppointmentAnalytics, IDashboardStats, ITopDoctor, ITopUser } from "../adminInterface/dashboard"

export interface IAuthService {
  login(AdminData: {
    email: string;
    password: string;
  }): Promise<
    { accessToken: string; refreshToken: string } | { error: string }
  >;
  logout(refreshToken: string): Promise<any>;
  getUser(options:PaginationOptions): Promise<any>;
  getDoctor(options:PaginationOptions): Promise<any>;
  toggleUser(id: string): Promise<any>;
  toggleDoctor(id: string): Promise<any>;
  getService(options:PaginationOptions): Promise<any>;
  addService(name: string, isActive: boolean): Promise<any>;
  editService(id: string, name: string, isActive: boolean): Promise<any>;
  toggleService(id: string): Promise<any>;
  getCertificates(id: string): Promise<any>;
  approveDoctor(id: string): Promise<any>;
  rejectDoctor(id: string, reason: string): Promise<any>;
  createCoupon(couponData: any): Promise<any>;
  getCoupons(options:PaginationOptions): Promise<any>;
  toggleCoupon(id: string): Promise<any>;
  editCoupon(id: string, couponData: any): Promise<any>;
  getDashboardStats(): Promise<IDashboardStats>;
  getTopDoctors(): Promise<ITopDoctor[]>;
  getTopUsers(): Promise<ITopUser[]>;
  getAppointmentAnalytics(timeFrame: string): Promise<IAppointmentAnalytics[]>;
getReports(
    startDate: Date,
    endDate: Date,
    status: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<IAppointment>>}

export type AdminType = {
  email: string;
  password: string;
};
