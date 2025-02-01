import mongoose, { ObjectId, Types } from "mongoose";

export type userType={
    userId:string;
    name:string;
    email:string;
    phone:string;
    password:string;
    isVerified?: boolean;
}

// export interface User {
//     userId: string;
//     name: string;
//     phone : string;
//     email: string;
//     isBlocked: boolean;
    
  
//   }



export interface UserProfile {
  
  _id: ObjectId;
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB: Date;
  address: string;
  image:string;
  isBlocked: boolean;
  isVerified: boolean
}
