import { IDoctorInfo } from "../doctorInterface/Interface";

export interface IAuthService {
  signup(doctorData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ token: string }>;
  sendOtp(email: string): Promise<{ status: boolean; message: string }>;
  verifyOtp(
    email: string,
    otp: string
  ): Promise<{ status: boolean; message: string }>;
  resendOtp(email: string): Promise<{ status: boolean; message: string }>;
}
