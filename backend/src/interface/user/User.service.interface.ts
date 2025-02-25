import { PaginationOptions } from "../../helper/pagination";

export interface IUserService {
  getDoctors(options: PaginationOptions): Promise<any>;
  getDoctorDetails(id: string): Promise<any>;
  getServices(): Promise<any>;
  getUserProfile(id: string): Promise<any>;
  editUserProfile(
    id: string,
    data: any,
    file: Express.Multer.File): Promise<any>;
  changePassword(id: string, oldPassword: any, newPassword: any): Promise<any>;
  getAvailableSlots(id: string): Promise<any>;
  chatImageUploads(
    id: string,
    file: Express.Multer.File): Promise<any>;
}
