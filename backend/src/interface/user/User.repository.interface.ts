import { PaginationOptions } from "../../helper/pagination";
import { DoctorDetails } from "../userInterface/interface";
import { UserProfile } from "../userInterface/interface";
import { Iuser } from "../../model/userModel";
export interface Service {
    serviceId: string;
    name: string;
    isActive: boolean;
  }

export interface IUserRepository {
    getDoctors(options:PaginationOptions): Promise<DoctorDetails[]>
    getDoctorDetails(id: string): Promise<DoctorDetails | null>
    getServices(): Promise<Service[]>
    getUserProfile(id: string): Promise<UserProfile[] | null>
    editUserProfile(id: string, data: any): Promise<any>
    changePassword(id: string, oldPassword: any, newPassword: any): Promise<any>;
    getScheduleForDoctor(id: string): Promise<any>
    uploadChatImage(chatId: string, file: Express.Multer.File): Promise<any>
    saveChatImageMessage(chatId: string, messageData: any): Promise<any> 
    refundToUser(userId: string, refundAmount: number): Promise<Iuser>
}