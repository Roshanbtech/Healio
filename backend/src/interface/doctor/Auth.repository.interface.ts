import { Document } from "mongoose";
import { DoctorResult, doctorType, Schedule } from "../doctorInterface/Interface";
import { Service } from "../doctorInterface/Interface";
import { UserProfile } from "../userInterface/interface";

export interface IAuthRepository {
  existDoctor(email: string): Promise<{ existEmail: boolean }>;
  createDoctor(doctorData: doctorType): Promise<Document>;
  doctorCheck(email: string): Promise<DoctorResult | null>;
  handleGoogleLogin(doctorData: any): Promise<{ doctor: any; isNewDoctor: boolean }>
  updatePassword(email: string, hashedPassword: string): Promise<any>
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
  uploadChatImage(chatId: string, file: Express.Multer.File): Promise<any>
  saveChatImageMessage(chatId: string, messageData: any): Promise<any> 
  getAppointments(id: string): Promise<any>
}