import mongoose, { ObjectId, Types } from "mongoose";

export type userType = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isVerified?: boolean;
};

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

export interface DoctorDetails {
  _id: any;
  name: string;
  email: string;
  phone: string;
  image?: string;
  speciality?: string;
  degree: string;
  experience: string;
  about?: string;
  achievements?: string;
  fees?:number;
  hospital?: string;
}

export interface Service {
  _id: string;
  name: string;
  isActive: boolean;
}