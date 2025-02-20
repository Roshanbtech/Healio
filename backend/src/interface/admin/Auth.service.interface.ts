import { PaginationOptions } from "../../helper/pagination";

export interface IAuthService {
  login(AdminData: {
    email: string;
    password: string;
  }): Promise<
    { accessToken: string; refreshToken: string } | { error: string }
  >;
  logout(refreshToken: string): Promise<any>;
  getUser(options:PaginationOptions): Promise<any>;
  getDoctor(): Promise<any>;
  toggleUser(id: string): Promise<any>;
  toggleDoctor(id: string): Promise<any>;
  getService(): Promise<any>;
  addService(name: string, isActive: boolean): Promise<any>;
  editService(id: string, name: string, isActive: boolean): Promise<any>;
  toggleService(id: string): Promise<any>;
  getCertificates(id: string): Promise<any>;
  approveDoctor(id: string): Promise<any>;
  rejectDoctor(id: string): Promise<any>;
  createCoupon(couponData: any): Promise<any>;
  getCoupons(): Promise<any>;
  toggleCoupon(id: string): Promise<any>;
  editCoupon(id: string, couponData: any): Promise<any>;
}

export type AdminType = {
  email: string;
  password: string;
};
