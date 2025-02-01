import mongoose, { ObjectId, Types } from "mongoose";

export type doctorType = {
    doctorId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    isVerified?: boolean;
}

// interface ImageDetails {
//     type: string;
//     url: string;
//     _id?: ObjectId;
// }

export interface IDoctorInformation {
    name: string;
    email: string;
    doctorId: string|ObjectId;
    phone: string;
    isBlocked: boolean;
    DOB: Date;
    fees: number;
    image: string;
}


export interface DoctorData{
    name: string;
    email: string;
    phone: string;
    dob: Date;
    fees: number;
    specialization: string;
}

export interface IDoctorInfo {
    name: string;
    email: string;
    doctorId: string | ObjectId; // Replace `ObjectId` with the actual type if using a specific library like MongoDB
    phone: string;
    isBlocked: boolean;
    isVerified:boolean;
    docStatus: string;
    rejectedReason: string | null|any; // Nullable, as it might not always have a value
  }

  export interface DoctorResult{
    _id: any;
    doctorId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    isBlocked: boolean;
    DOB: Date;
    specialization: any;
    fees:number;
    image:string;
    rejectedReason?:string;
    justApproved?: boolean;
  }

  export interface Doctor {
    doctorId: string;
    name: string;
    phone : string;
    email: string;
    isBlocked: boolean;
    isVerified: boolean;
  }