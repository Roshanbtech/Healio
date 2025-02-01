import { Document } from "mongoose";
import {  DoctorResult, doctorType } from "../doctorInterface/Interface";


export interface IAuthRepository {
    existDoctor(email:string,phone:string): Promise<{ existEmail: boolean; existPhone: boolean }>;
    createDoctor(doctorData: doctorType): Promise<IDoctor>;
    // doctorCheck(email: string): Promise<DoctorResult>;
    
 };