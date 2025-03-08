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
    | { accessToken: string; refreshToken: string; doctorId: string }
    | { error: string }
  >;
  handleGoogleLogin(idToken: string): Promise<{ doctor: any; isNewDoctor: boolean; accessToken: string; refreshToken: string }> 
  sendForgotPasswordOtp(
    email: string
  ): Promise<{ status: boolean; message: string }>;
  verifyForgotPasswordOtp(
    email: string,
    otp: string
  ): Promise<{ status: boolean; message: string }>;
  resetPassword(
    email: string,
    password: string
  ): Promise<{ status: boolean; message: string }>;
}

import { Service } from "../../interface/doctorInterface/Interface";
import { Schedule } from "../../interface/doctorInterface/Interface";
import { IAppointment } from "../../model/appointmentModel";
import { Iuser } from "../../model/userModel";
export interface IDoctorService {
  getServices(): Promise<Service[]>;
  addQualification(data: any, files: any): Promise<any>;
  getQualifications(id: string): Promise<any>;
  getDoctorProfile(id: string): Promise<any>;
  editDoctorProfile(
    id: string,
    data: any,
    file: Express.Multer.File
  ): Promise<any>;
  changePassword(id: string, oldPassword: any, newPassword: any): Promise<any>;
  addSchedule(scheduleData: Schedule): Promise<any>; 
  getSchedule(id: string): Promise<any>;
  getUsers(): Promise<any>;
  getAppointmentUsers(id: string): Promise<Iuser[]>;
  chatImageUploads(
    id: string,
    file: Express.Multer.File): Promise<any>;
  getAppointments(id: string): Promise<any>;
  // findAppointmentById(id: string): Promise<IAppointment | null>;
  acceptAppointment(id:string): Promise<IAppointment | null>
}
