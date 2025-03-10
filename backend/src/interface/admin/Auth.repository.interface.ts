import { UserProfile, userType } from "../userInterface/interface";
import { DoctorResult, doctorType } from "../doctorInterface/Interface";
import { PaginationOptions } from "../../helper/pagination";

export interface Service {
  serviceId: string;
  name: string;
  isActive: boolean;
}

export interface Coupon {
  _id: string;
  name: string;
  code: string;
  discount: number;
  expirationDate: string;
  isActive: boolean;
}

export interface IAuthRepository {
  logout(refreshToken: string): Promise<any>;
  getAllUsers(options:PaginationOptions): Promise<UserProfile[]>;
  getAllDoctors(): Promise<DoctorResult[]>;
  toggleUser(id: string): Promise<any>;
  toggleDoctor(id: string): Promise<any>;
  getAllServices(): Promise<Service[]>;
  addService(name: string, isActive: boolean): Promise<any>;
  createCoupon(couponData: any): Promise<any>;
  editService(id: string,name: string, isActive: boolean): Promise<any>;
  toggleService(id: string): Promise<any>;
  findServiceByName(name: string): Promise<any>;
  getCertificates(id: string): Promise<any>;
  approveDoctor(id: string): Promise<any>;
  rejectDoctor(id: string, reason: string): Promise<any>;
  getAllCoupons(): Promise<Coupon[]>;
  toggleCoupon(id: string): Promise<any>;
  editCoupon(id: string, couponData: any): Promise<any>;
  existCoupon(code:string): Promise<any>;
}
