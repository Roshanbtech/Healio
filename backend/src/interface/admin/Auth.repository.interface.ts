import { UserProfile, userType } from "../userInterface/interface";
import { DoctorResult, doctorType } from "../doctorInterface/Interface";

export interface Service {
  serviceId: string;
  name: string;
  isActive: boolean;
}

export interface IAuthRepository {
  logout(refreshToken: string): Promise<any>;
  getAllUsers(): Promise<UserProfile[]>;
  getAllDoctors(): Promise<DoctorResult[]>;
  toggleUser(id: string): Promise<any>;
  toggleDoctor(id: string): Promise<any>;
  getAllServices(): Promise<Service[]>;
  addService(name: string, isActive: boolean): Promise<any>;
  editService(id: string,name: string, isActive: boolean): Promise<any>;
  toggleService(id: string): Promise<any>;
  findServiceByName(name: string): Promise<any>;
  getCertificates(id: string): Promise<any>;
  approveDoctor(id: string): Promise<any>;
  rejectDoctor(id: string): Promise<any>;
}
