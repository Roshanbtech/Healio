import userModel from "../../model/userModel";
import { UserProfile, userType } from "../../interface/userInterface/interface";
import { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";


// const Objectid = mongoose.Types.ObjectId;

export class AuthRepository implements IAuthRepository {
  async existUser(
    email: string,
  ): Promise<{ existEmail: boolean}> {
    try {

      console.log(".....");
      
      let existEmail = true;

      const emailExist = await userModel.findOne({ email: email });
      if (!emailExist) {
        existEmail = false;
      }

      

      return { existEmail };
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw new Error("Error checking if user exists");
    }
  }
  async createUser(userData: userType): Promise<Document> {
    try {
        console.log("user data",userData);

      
      userData.isVerified = true;  
      const newUser = new userModel(userData);
      return await newUser.save();
    } catch (error: any) {
      console.log("Error in creating new User", error);
      throw new Error(`Error creating user : ${error.message}`);
    }
  }
  async userCheck(email: string): Promise<UserProfile | null> {
    try {
      const userData = await userModel.findOne(
        { email: email }
      ).lean();
      
      if (userData) {
        
        return {
          _id: userData._id as ObjectId,
          userId: userData.userId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          DOB: userData.DOB,
          address: userData.address,
          isBlocked: userData.isBlocked,
          isVerified: userData.isVerified,
          image: userData.image || '',
          password:userData.password
         
        }; ;
      }
      throw new Error("User Doesn't exist");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
}
