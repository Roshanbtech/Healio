import { Document } from "mongoose";
import { UserProfile, userType } from "../userInterface/interface";

export interface IAuthRepository {
  existUser(email: string): Promise<{ existEmail: boolean }>;
  createUser(userData: userType): Promise<Document>;
  userCheck(email: string): Promise<UserProfile | null>;
  updatePassword(email: string, hashedPassword: string): Promise<any>
  logout(refreshToken: string): Promise<any>;
}
