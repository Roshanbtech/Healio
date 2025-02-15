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
  sendForgotPasswordOtp(email: string): Promise<{ status: boolean; message: string }>;
  verifyForgotPasswordOtp(email: string, otp: string): Promise<{ status: boolean; message: string }>;
  resetPassword(email: string, password: string): Promise<{ status: boolean; message: string }>;
}
 
import { Service } from "../../interface/doctorInterface/Interface";
export interface IDoctorService {
  getServices(): Promise<Service[]>;
  addQualification(data: any, files: any): Promise<any>;
  getQualifications(id: string): Promise<any>;
  getDoctorProfile(id: string): Promise<any>;
  // editDoctorProfile(id: string, data: any, files: any): Promise<any>;
}
