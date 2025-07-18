import { DoctorQualificationInput, DoctorResult, doctorType, Schedule } from "../doctorInterface/Interface";
import {Express} from "express";
import { Service } from "../doctorInterface/Interface";
import { UserProfile } from "../userInterface/interface";
import { IAppointment } from "../../model/appointmentModel";
import { IDoctor } from "../../model/doctorModel";
import { Iuser } from "../../model/userModel";
import { DashboardHomeData, DashboardStatsData, DashboardStatsResponse, DoctorProfile, GrowthChartData } from "../doctorInterface/dashboardInterface";
import { ISchedule } from "../../model/slotModel";

export interface IAuthRepository {
  existDoctor(email: string): Promise<{ existEmail: boolean }>;
  createDoctor(doctorData: doctorType): Promise<IDoctor>;
  doctorCheck(email: string): Promise<DoctorResult | null>;
  handleGoogleLogin(doctorData: any): Promise<{ doctor: any; isNewDoctor: boolean }>;
  updatePassword(email: string, hashedPassword: string): Promise<{ acknowledged: boolean; modifiedCount: number }>; 
  logout(refreshToken: string): Promise<boolean>;
}


export interface IDoctorRepository{
  getServices(): Promise<Service[]>
  addQualification(data: DoctorQualificationInput, doctorId: string): Promise<IDoctor | null>;
  getQualifications(id: string): Promise<IDoctor | null>;
  getDoctorProfile(id: string): Promise<Partial<IDoctor>|null>;
  editDoctorProfile(id: string, data:Partial<IDoctor>): Promise<Partial<IDoctor>| null> 
  changePassword(id: string,oldPassword:string, newPassword: string): Promise<{ status: boolean; message: string }>;
  addSchedule(scheduleData: Partial<ISchedule>): Promise<ISchedule>;
  findRecurringScheduleByDoctor(doctor: string): Promise<ISchedule | null>
  getSchedule(id: string): Promise<ISchedule[]>
  getUsers(): Promise<any>
  getAppointmentUsers(id: string): Promise<Iuser[]>
  uploadChatImage(chatId: string, file: Express.Multer.File): Promise<any>
  saveChatImageMessage(chatId: string, messageData: any): Promise<any> 
  getAppointments(id: string): Promise<any>
  // findAppointmentById(id: string): Promise<IAppointment | null>
  acceptAppointment(id:string): Promise<IAppointment | null>; 
  completeAppointment(id:string): Promise<IAppointment | null>
  updateWalletTransaction( doctorId: string,fee: number,appointmentId: string): Promise<any>
  deductFromDoctorWallet(doctorId: string, refundAmount: number): Promise<IDoctor | null>
  updateDoctorAggregatedReview(doctorId: string): Promise<IDoctor | null>
  rescheduleAppointment(id: string, date: string, time: string, reason: string): Promise<IAppointment | null>;
  getDoctorAvailableSlots(id: string): Promise<any>;
  getDashboardStats(doctorId: string): Promise<DashboardStatsResponse | null> 
    // getGrowthData(doctorId: string): Promise<growthChartData[]>;
    getGrowthData(
      doctorId: string,
      timeRange:"daily" | "weekly" | "monthly" | "yearly",
      dateParam?: string
    ): Promise<GrowthChartData[]>;
  getDashboardHome(doctorId: string): Promise<DashboardHomeData>;
}