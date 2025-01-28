import { Document } from "mongoose";
import { UserProfile, userType } from "../userInterface/interface";

export interface IAuthRepository {
    existUser(email:string,phone:string): Promise<{ existEmail: boolean; existPhone: boolean }>;
    createUser(userData: userType): Promise<Document>;
    // userCheck(email:string): Promise<UserProfile | null>;
    
 };