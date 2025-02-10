export interface IAuthService {
  signup(DoctorData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }): Promise<{ token: string }>;
  sendOtp(email: string): Promise<{ status: boolean; message: string }>;
  resendOtp(email: string): Promise<{ status: boolean; message: string }>;
  login(DoctorData: {
    email: string;
    password: string;
  }): Promise<
    { accessToken: string; refreshToken: string; doctorId: string } | { error: string }
  >;
}
 
import { Service } from "../../interface/doctorInterface/Interface";
export interface IDoctorService {
  getServices(): Promise<Service[]>;
  addQualification(data: any, files: any): Promise<any>;
  getQualifications(id: string): Promise<any>;
}
