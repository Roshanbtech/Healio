import { Document } from "mongoose";
import { DoctorResult, doctorType, Schedule } from "../doctorInterface/Interface";
import { Service } from "../doctorInterface/Interface";
import { UserProfile } from "../userInterface/interface";
import { IAppointment } from "../../model/appointmentModel";
import { IDoctor } from "../../model/doctorModel";
import { Iuser } from "../../model/userModel";
import { DashboardHomeData, DashboardStatsData, DashboardStatsResponse, growthChartData } from "../doctorInterface/dashboardInterface";

export interface IAuthRepository {
  existDoctor(email: string): Promise<{ existEmail: boolean }>;
  createDoctor(doctorData: doctorType): Promise<Document>;
  doctorCheck(email: string): Promise<DoctorResult | null>;
  handleGoogleLogin(doctorData: any): Promise<{ doctor: any; isNewDoctor: boolean }>
  updatePassword(email: string, hashedPassword: string): Promise<any>
  logout(refreshToken: string): Promise<any>
}


export interface IDoctorRepository{
  getServices(): Promise<Service[]>
  addQualification(data: any, id: string): Promise<any>
  getQualifications(id: string): Promise<any>
  getDoctorProfile(id: string): Promise<any>
  editDoctorProfile(id: string, data: any): Promise<any> 
  changePassword(id: string,oldPassword:string, newPassword: string): Promise<any>
  addSchedule(scheduleData: Schedule): Promise<any>
  getSchedule(id: string): Promise<any>
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
    getGrowthData(doctorId: string): Promise<growthChartData[]>;
  getDashboardHome(doctorId: string): Promise<DashboardHomeData>;
}