import doctorModel from "../../model/doctorModel";
import { Document,ObjectId } from "mongoose";
import { doctorType, DoctorResult } from "../../interface/doctorInterface/Interface";
import { IAuthRepository } from "../../interface/doctor/Auth.repository.interface";

export class AuthRepository implements IAuthRepository{
    async existDoctor(email: string, phone: string): Promise<{ existEmail: boolean; existPhone: boolean }> {
        try {
          const emailExist = await doctorModel.findOne({ email });
          const phoneExist = await doctorModel.findOne({ phone });
      
          return { existEmail: !!emailExist, existPhone: !!phoneExist };
        } catch (error) {
          console.error("Error checking doctor existence:", error);
          throw new Error("Error checking doctor existence");
        }
      }
      
      async createDoctor(doctorData: doctorType): Promise<IDoctor> {
        try {
            doctorData.isVerified = true;
            const newDoctor = new doctorModel(doctorData);
            return await newDoctor.save();
        } catch (error: any) {
            console.error("Error in creating new doctor:", error);
            throw new Error(`Error creating doctor: ${error.message}`);
        }
    }
    
      async doctorCheck(email: string): Promise<DoctorResult | null> {
        try {
          const doctorData = await doctorModel.findOne({ email }).lean();
          if (!doctorData) {
            return null;
          }
          return {
            _id: doctorData._id as ObjectId,
            doctorId: doctorData.doctorId,
            name: doctorData.name,
            email: doctorData.email,
            phone: doctorData.phone,
            DOB: doctorData.DOB,
            address: doctorData.address,
            isBlocked: doctorData.isBlocked,
            isVerified: doctorData.isVerified,
            image: doctorData.image || "",
            password: doctorData.password,
          };
        } catch (error: any) {
          console.error("Error checking doctor:", error);
          throw new Error(error.message);
        }
      }
      
        
      }
      
    