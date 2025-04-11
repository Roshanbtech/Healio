export interface IAuthService {
  signup(doctorData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }): Promise<{ status: boolean; message: string; token?: string }>;
  sendOtp(email: string): Promise<{ status: boolean; message: string }>;
  resendOtp(email: string): Promise<{ status: boolean; message: string }>;
  login(DoctorData: {
    email: string;
    password: string;
  }): Promise<
    | { accessToken: string; refreshToken: string; doctorId: string }
    | { error: string }
  >;
  handleGoogleLogin(
    idToken: string
  ): Promise<{
    doctor: any;
    isNewDoctor: boolean;
    accessToken: string;
    refreshToken: string;
  }>;
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
  logout(refreshToken: string): Promise<{ status: boolean; message: string }>;
}

import { Service } from "../../interface/doctorInterface/Interface";
import { Schedule } from "../../interface/doctorInterface/Interface";
import { IAppointment } from "../../model/appointmentModel";
import { IDoctor } from "../../model/doctorModel";
import { ISchedule } from "../../model/slotModel";
import { Iuser } from "../../model/userModel";
import {
  DashboardHomeData,
  DashboardStatsData,
  GrowthChartData,
  DashboardStatsResponse,
} from "../doctorInterface/dashboardInterface";
export interface IDoctorService {
  getServices(): Promise<Service[]>;
  addQualification(
    data: Record<string, string>,
    files: Express.Multer.File[]
  ): Promise<IDoctor | null>;
  getQualifications(id: string): Promise<IDoctor | null>;
  getDoctorProfile(id: string): Promise<Partial<IDoctor> | null>;
  editDoctorProfile(
    id: string,
    data: Partial<IDoctor>,
    file: Express.Multer.File
  ): Promise<Partial<IDoctor> | null>;
  changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ status: boolean; message: string }>;
  addSchedule(
    scheduleData: Partial<ISchedule> & {
      recurrenceDays?: string[];
      recurrenceUntil?: string;
    }
  ): Promise<ISchedule>;
  getSchedule(id: string): Promise<{
    status: boolean;
    message: string;
    data?: ISchedule[];
  }>;
  getUsers(): Promise<any>;
  getAppointmentUsers(id: string): Promise<Iuser[]>;
  chatImageUploads(id: string, file: Express.Multer.File): Promise<any>;
  getAppointments(id: string): Promise<any>;
  // findAppointmentById(id: string): Promise<IAppointment | null>;
  acceptAppointment(id: string): Promise<IAppointment | null>;
  completeAppointment(id: string): Promise<IAppointment | null>;
  rescheduleAppointment(
    id: string,
    date: string,
    time: string,
    reason: string
  ): Promise<IAppointment | null>;
  getDoctorAvailableSlots(id: string): Promise<any>;
  fetchDashboardStats(docotrId: string): Promise<DashboardStatsResponse | null>;
  // fetchGrowthData(doctorId: string): Promise<growthChartData[]>;
  fetchGrowthData(
    doctorId: string,
    timeRange: "daily" | "weekly" | "monthly" | "yearly",
    dateParam?: string
  ): Promise<GrowthChartData[]>;
  getDashboardHome(doctorId: string): Promise<DashboardHomeData>;
}
