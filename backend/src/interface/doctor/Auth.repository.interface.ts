import { Document } from "mongoose";
import { DoctorResult, doctorType } from "../doctorInterface/Interface";
import { Service } from "../doctorInterface/Interface";

export interface IAuthRepository {
  existDoctor(email: string): Promise<{ existEmail: boolean }>;
  createDoctor(doctorData: doctorType): Promise<Document>;
  doctorCheck(email: string): Promise<DoctorResult | null>;
  updatePassword(email: string, hashedPassword: string): Promise<any>
}


export interface IDoctorRepository{
  getServices(): Promise<Service[]>
  addQualification(data: any, id: string): Promise<any>
  getQualifications(id: string): Promise<any>
  getDoctorProfile(id: string): Promise<any>
  editDoctorProfile(id: string, data: any): Promise<any> }