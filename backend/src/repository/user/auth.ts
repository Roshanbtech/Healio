import userModel from "../../model/userModel";
import bcrypt from "bcrypt";
import { UserProfile, userType } from "../../interface/userInterface/interface";
import { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";

export class AuthRepository implements IAuthRepository {
  async existUser(email: string): Promise<{ existEmail: boolean }> {
    try {
      console.log(".....");

      let existEmail = true;

      const emailExist = await userModel.findOne({ email });
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
      console.log("user data", userData);

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
      const userData = await userModel.findOne({ email }).lean();

      if (!userData) {
        return null;
      }

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
        image: userData.image || "",
        password: userData.password,
      };
    } catch (error: any) {
      console.error("Error in userCheck:", error);
      throw new Error("Database error occurred while checking user.");
    }
  }

  async handleGoogleLogin(userData: any): Promise<{ user: any; isNewUser: boolean }> {
    try {
        const { email, name, googleId, isVerified, image } = userData;
        let user = await userModel.findOne({ email });
        let isNewUser = false;

        if (!user) {
            user = new userModel({
                name,
                email,
                googleId,
                isVerified,
                image,
            });
            await user.save();
            isNewUser = true;
        }

        return { user, isNewUser };
    } catch (error: any) {
        console.error("Error in Google login repository:", error);
        throw new Error("DB error while handling Google login");
    }
}

  
  async updatePassword(email: string, hashedPassword: string): Promise<any> {
    try {
      return await userModel.updateOne({ email }, { $set: { password: hashedPassword } });
    } catch (error: any) {
      console.error("Error updating password:", error);
      throw new Error("Error updating password");
    }
  }

  async logout(refreshToken: string): Promise<any> {
    try {
      console.log(refreshToken, "refresh token");
      return await userModel.updateOne(
        { refreshToken },
        { $set: { refreshToken: "" } }
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
