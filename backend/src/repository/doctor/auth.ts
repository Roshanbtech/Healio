import doctorModel, { IDoctor } from "../../model/doctorModel";
import { Document, ObjectId } from "mongoose";
import {
  doctorType,
  DoctorResult,
} from "../../interface/doctorInterface/Interface";
import { IAuthRepository } from "../../interface/doctor/Auth.repository.interface";

export class AuthRepository implements IAuthRepository {
  async existDoctor(email: string): Promise<{ existEmail: boolean }> {
    try {
      let existEmail = true;

      const emailExist = await doctorModel.findOne({ email: email });
      if (!emailExist) {
        existEmail = false;
      }

      return { existEmail };
    } catch (error) {
      console.error("Error checking if doctor exists:", error);
      throw new Error("Error checking if doctor exists");
    }
  }
  async createDoctor(doctorData: doctorType): Promise<IDoctor> {
    try {
      doctorData.isVerified = true;
      const newDoctor = new doctorModel(doctorData);
      return (await newDoctor.save()) as IDoctor;
    } catch (error: unknown) {
       if(error instanceof Error){
         throw new Error (`Error creating doctor: ${error.message}`);
       } 
       throw new Error("Error creating doctor");
    }
  }

  async updatePassword(email: string, hashedPassword: string): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    try {
      return await doctorModel.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating password:", error.message);
        throw new Error("Error updating password");
      } else {
        console.error("Unexpected error updating password:", error);
        throw new Error("Unknown error while updating password");
      }
    }
  }

  async doctorCheck(email: string): Promise<DoctorResult | null> {
    try {
      const doctorData = await doctorModel.findOne({ email: email }).lean();

      if (!doctorData) {
        return null;
      }

      return {
        _id: doctorData._id as ObjectId,
        name: doctorData.name,
        email: doctorData.email,
        password: doctorData.password,
        phone: doctorData.phone,
        isBlocked: doctorData.isBlocked,
        isVerified: doctorData.isVerified,
        image: doctorData.image || "",
        isDoctor: doctorData.isDoctor,
        docStatus: doctorData.docStatus,
      };
    } catch (error: unknown) {
      throw new Error("Error checking doctor");
    }
  }

  async handleGoogleLogin(
    doctorData: any
  ): Promise<{ doctor: any; isNewDoctor: boolean }> {
    try {
      const { email, name, googleId, isVerified, image } = doctorData;
      let doctor = await doctorModel.findOne({ email });
      let isNewDoctor = false;

      if (!doctor) {
        doctor = new doctorModel({
          name,
          email,
          googleId,
          isVerified,
          image,
        });
        await doctor.save();
        isNewDoctor = true;
      }

      return { doctor, isNewDoctor };
    } catch (error: any) {
      console.error("Error in Google login repository:", error);
      throw new Error("DB error while handling Google login");
    }
  }

  async logout(refreshToken: string): Promise<boolean> {
    try {
      const result = await doctorModel.updateOne(
        { refreshToken },
        { $set: { refreshToken: "" } }
      );

      return result.modifiedCount > 0;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Repository logout error: " + error.message);
      }
      throw new Error("Unexpected repository error");
    }
  }
  
}
