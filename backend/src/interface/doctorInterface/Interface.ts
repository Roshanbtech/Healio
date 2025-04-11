import mongoose, { ObjectId, Types } from "mongoose";

export type doctorType = {
  name: string;
  email: string;
  phone: string;
  password: string;
  isVerified?: boolean;
  docStatus?: "pending" | "approved" | "rejected";
};

export interface IDoctorInformation {
  name: string;
  email: string;
  doctorId: string | ObjectId;
  phone: string;
  isBlocked: boolean;
  fees: number;
  image: string;
}



export interface IDoctorInfo {
  name: string;
  email: string;
  doctorId: string | ObjectId;
  phone: string;
  isBlocked: boolean;
  isVerified: boolean;
  docStatus: string;
}

export interface UserProfile {
  _id: ObjectId;
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB: Date;
  address: string;
  image: string;
  isBlocked: boolean;
  isVerified: boolean;
}
export interface DoctorResult {
  _id: any;
  name: string;
  email: string;
  phone: string;
  password: string;
  isBlocked: boolean;
  isVerified: boolean;
  image: string;
  isDoctor?:boolean;
  docStatus?: "pending" |"approved" | "rejected"
}

export interface Doctor {
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
}

export interface Service {
  serviceId: string;
  name: string;
  isActive: boolean;
}

export interface Qualification {
  hospital: string;
  degree: string;
  specialization: Types.ObjectId;
  year: string;
  country: string;
  achievements: string;
}

export interface Schedule {
  doctor: string;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  startTime: Date;
  endTime: Date;
  defaultSlotDuration: number;
  breaks: {
    startTime: Date;
    endTime: Date;
  }[];
  exceptions: {
    date: Date;
    isOff: boolean;
    overrideSlotDuration?: number;
  }[];
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
}

export interface DoctorQualificationInput {
  hospital?: string;
  degree?: string;
  speciality?: string; 
  experience?: string;
  country?: string;
  achievements?: string;
  certificate?: string[];
}