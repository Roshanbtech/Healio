import doctorModel from "../../model/doctorModel";
import { Document, ObjectId } from "mongoose";
import {
  doctorType,
  DoctorResult,
} from "../../interface/doctorInterface/Interface";
import { IAuthRepository } from "../../interface/doctor/Auth.repository.interface";

export class AuthRepository implements IAuthRepository {
  async existDoctor(email: string): Promise<{ existEmail: boolean }> {
    try {
      console.log(".....");

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
  async createDoctor(doctorData: doctorType): Promise<Document> {
    try {
      console.log("doctor data", doctorData);

      doctorData.isVerified = true;
      const newDoctor = new doctorModel(doctorData);
      return await newDoctor.save();
    } catch (error: any) {
      console.log("Error in creating new doctor", error);
      throw new Error(`Error creating user : ${error.message}`);
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
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
